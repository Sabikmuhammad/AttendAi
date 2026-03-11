"""
Face Detection Service Module

Wraps face detection functionality with enhanced error handling,
performance optimizations, and async support.
"""

import numpy as np
import logging
from typing import List, Tuple, Optional
import asyncio

# Import existing face detection module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from face_detector import detect_faces as _detect_faces_sync

logger = logging.getLogger("attendai.face_detection")


class FaceDetectionService:
    """
    Service for detecting faces in frames and generating encodings.
    Provides async interface and enhanced error handling.
    """
    
    def __init__(self, model: str = "hog", upsample_times: int = 1):
        """
        Initialize face detection service.
        
        Args:
            model: Detection model - 'hog' (CPU, fast) or 'cnn' (GPU, accurate)
            upsample_times: Number of times to upsample for detecting smaller faces
        """
        self.model = model
        self.upsample_times = upsample_times
        self.total_faces_detected = 0
        self.frames_processed = 0
    
    def detect_faces(self, frame: np.ndarray) -> Tuple[List, List]:
        """
        Detect faces in a frame and return locations and encodings.
        
        Args:
            frame: BGR image from cv2.VideoCapture
        
        Returns:
            face_locations: List of (top, right, bottom, left) tuples
            face_encodings: List of 128-dimensional face encoding arrays
        """
        if frame is None or frame.size == 0:
            logger.warning("Received empty frame for face detection")
            return [], []
        
        try:
            # Use existing face detection module
            face_locations, face_encodings = _detect_faces_sync(
                frame,
                model=self.model,
                upsample_times=self.upsample_times
            )
            
            self.frames_processed += 1
            self.total_faces_detected += len(face_locations)
            
            if len(face_locations) > 0:
                logger.debug(f"Detected {len(face_locations)} face(s) in frame")
            
            return face_locations, face_encodings
            
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            return [], []
    
    async def detect_faces_async(self, frame: np.ndarray) -> Tuple[List, List]:
        """
        Async wrapper for face detection.
        Runs detection in executor to avoid blocking the event loop.
        
        Args:
            frame: BGR image from cv2.VideoCapture
        
        Returns:
            face_locations: List of (top, right, bottom, left) tuples
            face_encodings: List of 128-dimensional face encoding arrays
        """
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self.detect_faces, frame)
        return result
    
    def get_stats(self) -> dict:
        """
        Get detection statistics.
        
        Returns:
            {
                "frames_processed": 1234,
                "total_faces_detected": 567,
                "avg_faces_per_frame": 0.46,
                "model": "hog"
            }
        """
        avg_faces = (
            self.total_faces_detected / self.frames_processed
            if self.frames_processed > 0
            else 0
        )
        
        return {
            "frames_processed": self.frames_processed,
            "total_faces_detected": self.total_faces_detected,
            "avg_faces_per_frame": round(avg_faces, 2),
            "model": self.model,
            "upsample_times": self.upsample_times
        }
    
    def reset_stats(self):
        """Reset detection statistics."""
        self.frames_processed = 0
        self.total_faces_detected = 0


class FaceDetectionResult:
    """Container for face detection results with metadata."""
    
    def __init__(
        self,
        frame: np.ndarray,
        face_locations: List,
        face_encodings: List,
        frame_number: int = 0
    ):
        self.frame = frame
        self.face_locations = face_locations
        self.face_encodings = face_encodings
        self.frame_number = frame_number
        self.face_count = len(face_locations)
    
    def has_faces(self) -> bool:
        """Check if any faces were detected."""
        return self.face_count > 0
    
    def get_face_boxes(self) -> List[Tuple[int, int, int, int]]:
        """
        Get bounding boxes in (x, y, width, height) format.
        Converts from face_recognition format to standard CV format.
        
        Returns:
            List of (x, y, width, height) tuples
        """
        boxes = []
        for (top, right, bottom, left) in self.face_locations:
            width = right - left
            height = bottom - top
            boxes.append((left, top, width, height))
        return boxes
    
    def draw_faces(self, color: Tuple[int, int, int] = (0, 255, 0), thickness: int = 2) -> np.ndarray:
        """
        Draw bounding boxes around detected faces.
        
        Args:
            color: BGR color tuple (default: green)
            thickness: Line thickness in pixels
        
        Returns:
            Frame with face boxes drawn
        """
        import cv2
        
        annotated_frame = self.frame.copy()
        
        for (top, right, bottom, left) in self.face_locations:
            cv2.rectangle(annotated_frame, (left, top), (right, bottom), color, thickness)
        
        return annotated_frame


def create_detection_service(
    model: str = "hog",
    use_gpu: bool = False
) -> FaceDetectionService:
    """
    Factory function to create a face detection service with optimal settings.
    
    Args:
        model: 'hog' for CPU or 'cnn' for GPU
        use_gpu: Whether to use GPU acceleration (requires CUDA)
    
    Returns:
        Configured FaceDetectionService instance
    """
    if use_gpu and model == "hog":
        logger.warning("GPU requested but HOG model doesn't support GPU. Using CPU.")
    
    detection_model = "cnn" if use_gpu else "hog"
    
    logger.info(f"Creating face detection service with model: {detection_model}")
    
    return FaceDetectionService(model=detection_model, upsample_times=1)
