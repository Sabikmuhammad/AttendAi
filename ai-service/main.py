"""
Main FastAPI application for AttendAI face recognition service.

Endpoints:
  GET  /health       — health check
  POST /detect       — detect and recognize faces in a base64-encoded image
  POST /embeddings/refresh — reload student embeddings from MongoDB
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
import logging

from face_detector import detect_faces
from recognition import recognize_faces
from embeddings import EmbeddingStore

# ─── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("attendai")

# ─── FastAPI App ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AttendAI Face Recognition Service",
    description="Detects and recognizes student faces from classroom camera frames.",
    version="1.0.0",
)

# ─── CORS — allow requests from Next.js frontend ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # Replace with your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── Global embedding store (loaded once on startup) ─────────────────────────────
embedding_store = EmbeddingStore()


@app.on_event("startup")
async def startup_event():
    """Load student embeddings from MongoDB on startup."""
    logger.info("🚀 AttendAI service starting...")
    await embedding_store.load()
    logger.info(f"✅ Loaded embeddings for {embedding_store.count()} students")


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


# ─── Routes ──────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint — used by Next.js to verify AI service is running."""
    return {
        "status": "healthy",
        "service": "AttendAI Face Recognition",
        "students_loaded": embedding_store.count(),
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
        recognized_ids, avg_confidence = recognize_faces(
            face_encodings,
            embedding_store,
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


@app.post("/embeddings/refresh", response_model=RefreshResponse)
async def refresh_embeddings():
    """
    Refresh student embeddings from MongoDB.
    Call this after new students are enrolled or face images are updated.
    """
    await embedding_store.load()
    return RefreshResponse(
        message="Embeddings refreshed successfully",
        student_count=embedding_store.count(),
    )


# ─── Entry point ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
