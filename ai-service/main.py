"""
Main FastAPI application for AttendAI face recognition service.

Endpoints:
  GET  /health                    - health check
  POST /detect                    - detect and recognize faces in base64 image
  POST /generate-embedding        - generate face embedding from image URL
  POST /embeddings/refresh        - reload student embeddings from MongoDB
  
  POST /monitor/start             - start attendance monitoring for a class
  POST /monitor/stop              - stop attendance monitoring
  GET  /monitor/status/{classId}  - get monitoring status
  GET  /monitor/active            - get all active monitoring sessions
  
  GET  /attendance/class/{classId}       - get attendance records
  GET  /attendance/class/{classId}/stats - get attendance statistics
  POST /attendance/manual                - manually record attendance
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
import logging
import requests
from io import BytesIO

from face_detector import detect_faces
from recognition import recognize_faces
from embeddings import EmbeddingStore

# Import new routes
from routes import monitor, attendance, stream

# Import utilities
from utils.database import connect_to_mongodb, close_mongodb_connection
from services.attendance_service import stop_all_monitoring

# ─── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("attendai")

# ─── FastAPI App ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AttendAI Face Recognition & Monitoring Service",
    description="AI-powered attendance system with face recognition and automated monitoring.",
    version="2.0.0",
)

# ─── CORS - allow requests from Next.js frontend ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # Replace with your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ─── Include Routers ─────────────────────────────────────────────────────────────
app.include_router(monitor.router)
app.include_router(attendance.router)
app.include_router(stream.router)

# ─── Global Embedding Store ──────────────────────────────────────────────────────
# NOTE: Old EmbeddingStore is deprecated - using StudentEmbeddingStore from face_recognition_service
# embedding_store = EmbeddingStore()  # REMOVED

# ─── Lifecycle Events ────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("🚀 AttendAI service starting...")
    
    # Connect to MongoDB
    try:
        await connect_to_mongodb()
        logger.info("✅ MongoDB connected")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise
    
    # Load student embeddings using NEW system
    try:
        from services.face_recognition_service import get_embedding_store
        embedding_store = await get_embedding_store()
        logger.info(f"✅ Loaded embeddings for {embedding_store.count()} students")
    except Exception as e:
        logger.warning(f"⚠️  Could not load embeddings: {e}")
    
    logger.info("🎉 AttendAI service ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("🛑 AttendAI service shutting down...")
    
    # Stop all active monitoring sessions
    try:
        await stop_all_monitoring()
        logger.info("✅ All monitoring sessions stopped")
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
    
    # Close MongoDB connection
    try:
        await close_mongodb_connection()
        logger.info("✅ MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB: {e}")
    
    logger.info("👋 Goodbye!")


# ─── Request / Response Schemas ──────────────────────────────────────────────────

class DetectRequest(BaseModel):
    """Incoming detection request with base64-encoded image."""
    image: str  # base64-encoded JPEG or PNG

class DetectResponse(BaseModel):
    """Detection results returned to Next.js."""
    detected_students: list[str]  # list of matched student MongoDB _id strings
    face_count: int               # total faces detected (even unrecognized)
    confidence: float | None      # average confidence of matched faces


class RefreshResponse(BaseModel):
    message: str
    student_count: int


class GenerateEmbeddingRequest(BaseModel):
    """Request to generate face embedding from an image URL."""
    imageUrl: str


class GenerateEmbeddingResponse(BaseModel):
    """Response with generated face embedding."""
    success: bool
    embedding: list[float] | None = None
    faces_detected: int = 0
    error: str | None = None


# ─── Routes ──────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint - used by Next.js to verify AI service is running."""
    from services.face_recognition_service import get_embedding_store
    try:
        store = await get_embedding_store()
        student_count = store.count()
    except:
        student_count = 0
    
    return {
        "status": "healthy",
        "service": "AttendAI Face Recognition",
        "version": "1.0.0",
        "students_loaded": student_count,
    }


@app.post("/detect", response_model=DetectResponse)
async def detect_endpoint(request: DetectRequest):
    """
    Main face detection and recognition endpoint.

    Process:
    1. Decode base64 image to NumPy array
    2. Detect face bounding boxes using OpenCV
    3. Encode detected faces using face_recognition (128-dim vectors)
    4. Compare encodings against student database embeddings
    5. Return matched student IDs
    """
    try:
        # ── Step 1: Decode base64 image ─────────────────────────────────────────
        try:
            image_bytes = base64.b64decode(request.image)
            np_array = np.frombuffer(image_bytes, dtype=np.uint8)
            frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

        if frame is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        logger.info(f"Processing frame: {frame.shape[1]}x{frame.shape[0]}")

        # ── Step 2 & 3: Detect faces and encode them ─────────────────────────────
        face_locations, face_encodings = detect_faces(frame)
        face_count = len(face_locations)

        logger.info(f"Detected {face_count} face(s)")

        if face_count == 0:
            return DetectResponse(
                detected_students=[],
                face_count=0,
                confidence=None,
            )

        # ── Step 4: Recognize faces against stored embeddings ─────────────────────
        from services.face_recognition_service import get_embedding_store
        store = await get_embedding_store()
        from embeddings import EmbeddingStore
        # Create temporary EmbeddingStore for legacy recognize_faces function
        legacy_store = EmbeddingStore()
        legacy_store._encodings, legacy_store._student_ids = store.get_all()
        
        recognized_ids, avg_confidence = recognize_faces(
            face_encodings,
            legacy_store,
        )

        logger.info(f"Recognized students: {recognized_ids}")

        return DetectResponse(
            detected_students=recognized_ids,
            face_count=face_count,
            confidence=avg_confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.post("/generate-embedding", response_model=GenerateEmbeddingResponse)
async def generate_embedding_endpoint(request: GenerateEmbeddingRequest):
    """
    Generate face embedding from an image URL.

    This endpoint is used during student enrollment to create
    face embeddings that are stored in MongoDB for later recognition.

    Process:
    1. Download image from the provided URL
    2. Detect faces in the image
    3. Generate 128-dimensional face embedding
    4. Return embedding vector

    Requirements:
    - Image must contain exactly ONE face
    - Face must be clearly visible and front-facing
    - Image must be accessible via HTTP/HTTPS
    """
    try:
        logger.info(f"Generating embedding for image: {request.imageUrl}")

        # ── Step 1: Download image from URL ──────────────────────────────────────
        try:
            response = requests.get(request.imageUrl, timeout=10)
            response.raise_for_status()
            image_bytes = response.content
        except requests.exceptions.Timeout:
            raise HTTPException(
                status_code=400,
                detail="Image download timed out. Please ensure the URL is accessible."
            )
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download image: {str(e)}"
            )

        # ── Step 2: Decode image to NumPy array ──────────────────────────────────
        try:
            np_array = np.frombuffer(image_bytes, dtype=np.uint8)
            frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image format: {str(e)}"
            )

        if frame is None:
            raise HTTPException(
                status_code=400,
                detail="Could not decode image. Please upload a valid JPEG or PNG file."
            )

        logger.info(f"Processing image: {frame.shape[1]}x{frame.shape[0]}")

        # ── Step 3: Detect faces and generate encodings ─────────────────────────
        face_locations, face_encodings = detect_faces(frame)
        faces_detected = len(face_locations)

        logger.info(f"Detected {faces_detected} face(s) in image")

        # ── Validation: Must have exactly one face ───────────────────────────────
        if faces_detected == 0:
            return GenerateEmbeddingResponse(
                success=False,
                embedding=None,
                faces_detected=0,
                error="No face detected in the image. Please upload a clear photo with a visible face."
            )

        if faces_detected > 1:
            return GenerateEmbeddingResponse(
                success=False,
                embedding=None,
                faces_detected=faces_detected,
                error=f"Multiple faces detected ({faces_detected}). Please upload an image with only one person."
            )

        # ── Step 4: Return the face embedding ────────────────────────────────────
        embedding = face_encodings[0].tolist()  # Convert numpy array to list
        
        logger.info(f"✅ Successfully generated embedding: {len(embedding)} dimensions")

        return GenerateEmbeddingResponse(
            success=True,
            embedding=embedding,
            faces_detected=1,
            error=None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Embedding generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )


@app.post("/embeddings/refresh", response_model=RefreshResponse)
async def refresh_embeddings():
    """
    Refresh student embeddings from MongoDB.
    Call this after new students are enrolled or face images are updated.
    """
    from services.face_recognition_service import reload_embeddings, get_embedding_store
    await reload_embeddings()
    store = await get_embedding_store()
    return RefreshResponse(
        message="Embeddings refreshed successfully",
        student_count=store.count(),
    )


# ─── Entry point ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
