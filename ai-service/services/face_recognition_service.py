"""
Face Recognition Service Module

Matches detected faces against stored student embeddings
to identify students for attendance recording.
"""

import numpy as np
import logging
from typing import List, Dict, Tuple, Optional
import asyncio

# Import existing recognition module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recognition import recognize_faces as _recognize_faces_sync

logger = logging.getLogger("attendai.face_recognition")


class StudentEmbeddingStore:
    """
    In-memory storage for student embeddings.
    Loaded from MongoDB once during service startup.
    """
    
    def __init__(self):
        self.embeddings: List[np.ndarray] = []
        self.student_ids: List[str] = []  # MongoDB _id as string
        self.student_metadata: Dict[str, Dict] = {}  # Additional student info
        self._loaded = False
    
    async def load_from_database(self):
        """
        Load all student embeddings from MongoDB.
        Called during service startup.
        """
        from utils.database import get_all_student_embeddings
        
        logger.info("📚 Loading student embeddings from database...")
        
        try:
            students = await get_all_student_embeddings()
            
            self.embeddings = []
            self.student_ids = []
            self.student_metadata = {}
            
            for student in students:
                student_id = str(student["_id"])
                embedding = student.get("faceEmbedding")
                
                if embedding and len(embedding) == 128:
                    self.embeddings.append(np.array(embedding))
                    self.student_ids.append(student_id)
                    
                    # Store metadata
                    self.student_metadata[student_id] = {
                        "studentId": student.get("studentId", ""),
                        "name": student.get("name", "Unknown")
                    }
            
            self._loaded = True
            logger.info(f"✅ Loaded {len(self.embeddings)} student embeddings")
            
        except Exception as e:
            logger.error(f"❌ Failed to load embeddings: {e}")
            raise
    
    async def reload(self):
        """Reload embeddings from database (for when new students are added)."""
        await self.load_from_database()
        logger.info("🔄 Student embeddings reloaded")
    
    def get_all(self) -> Tuple[List[np.ndarray], List[str]]:
        """
        Get all embeddings and corresponding student IDs.
        
        Returns:
            (embeddings, student_ids) tuple
        """
        return self.embeddings, self.student_ids
    
    def count(self) -> int:
        """Get number of stored embeddings."""
        return len(self.embeddings)
    
    def is_loaded(self) -> bool:
        """Check if embeddings have been loaded."""
        return self._loaded
    
    def get_student_info(self, student_id: str) -> Optional[Dict]:
        """Get student metadata by ID."""
        return self.student_metadata.get(student_id)


class FaceRecognitionService:
    """
    Service for recognizing students from detected face encodings.
    Uses stored embeddings to identify students.
    """
    
    def __init__(
        self,
        embedding_store: StudentEmbeddingStore,
        tolerance: float = 0.55
    ):
        """
        Initialize face recognition service.
        
        Args:
            embedding_store: Store containing student embeddings
            tolerance: Recognition threshold (lower = stricter)
                      0.5 = very strict, 0.6 = default, 0.7 = lenient
        """
        self.embedding_store = embedding_store
        self.tolerance = tolerance
        self.total_recognitions = 0
        self.frames_processed = 0
    
    def recognize_faces(
        self,
        face_encodings: List[np.ndarray]
    ) -> Tuple[List[str], Optional[float]]:
        """
        Recognize faces by matching against stored embeddings.
        
        Args:
            face_encodings: List of 128-d face encodings from detected faces
        
        Returns:
            recognized_ids: List of matched student MongoDB _id strings
            avg_confidence: Average confidence score (0.0-1.0)
        """
        if not self.embedding_store.is_loaded():
            logger.warning("Embedding store not loaded. Call load_from_database() first.")
            return [], None
        
        if not face_encodings:
            return [], None
        
        try:
            # Use existing recognition module
            recognized_ids, avg_confidence = _recognize_faces_sync(
                face_encodings,
                self.embedding_store,
                tolerance=self.tolerance
            )
            
            self.frames_processed += 1
            self.total_recognitions += len(recognized_ids)
            
            if recognized_ids:
                logger.debug(f"Recognized {len(recognized_ids)} student(s)")
            
            return recognized_ids, avg_confidence
            
        except Exception as e:
            logger.error(f"Face recognition error: {e}")
            return [], None
    
    async def recognize_faces_async(
        self,
        face_encodings: List[np.ndarray]
    ) -> Tuple[List[str], Optional[float]]:
        """
        Async wrapper for face recognition.
        
        Args:
            face_encodings: List of 128-d face encodings
        
        Returns:
            recognized_ids: List of matched student MongoDB _id strings
            avg_confidence: Average confidence score
        """
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            self.recognize_faces,
            face_encodings
        )
        return result
    
    def get_stats(self) -> dict:
        """
        Get recognition statistics.
        
        Returns:
            {
                "frames_processed": 1234,
                "total_recognitions": 567,
                "students_loaded": 30,
                "tolerance": 0.55
            }
        """
        return {
            "frames_processed": self.frames_processed,
            "total_recognitions": self.total_recognitions,
            "students_loaded": self.embedding_store.count(),
            "tolerance": self.tolerance
        }
    
    def reset_stats(self):
        """Reset recognition statistics."""
        self.frames_processed = 0
        self.total_recognitions = 0


class RecognitionResult:
    """Container for face recognition results."""
    
    def __init__(
        self,
        recognized_ids: List[str],
        confidence: Optional[float],
        frame_number: int = 0
    ):
        self.recognized_ids = recognized_ids
        self.confidence = confidence
        self.frame_number = frame_number
        self.recognition_count = len(recognized_ids)
    
    def has_recognitions(self) -> bool:
        """Check if any faces were recognized."""
        return self.recognition_count > 0
    
    def get_confidence_percentage(self) -> float:
        """Get confidence as percentage (0-100)."""
        if self.confidence is None:
            return 0.0
        return round(self.confidence * 100, 2)


# Global embedding store (singleton)
_global_embedding_store: Optional[StudentEmbeddingStore] = None


async def get_embedding_store() -> StudentEmbeddingStore:
    """
    Get the global student embedding store.
    Creates and loads it if not already initialized.
    """
    global _global_embedding_store
    
    if _global_embedding_store is None:
        _global_embedding_store = StudentEmbeddingStore()
        await _global_embedding_store.load_from_database()
    
    return _global_embedding_store


async def reload_embeddings():
    """
    Reload student embeddings from database.
    Call this when new students are added or embeddings are updated.
    """
    global _global_embedding_store
    
    if _global_embedding_store is not None:
        await _global_embedding_store.reload()
    else:
        _global_embedding_store = StudentEmbeddingStore()
        await _global_embedding_store.load_from_database()


def create_recognition_service(
    tolerance: float = 0.55
) -> FaceRecognitionService:
    """
    Factory function to create a face recognition service.
    
    Args:
        tolerance: Recognition threshold (0.5-0.7)
    
    Returns:
        Configured FaceRecognitionService instance
    """
    global _global_embedding_store
    
    if _global_embedding_store is None:
        raise RuntimeError(
            "Embedding store not initialized. Call get_embedding_store() first."
        )
    
    logger.info(f"Creating face recognition service (tolerance: {tolerance})")
    
    return FaceRecognitionService(
        embedding_store=_global_embedding_store,
        tolerance=tolerance
    )
