"""
Camera Service Module

Manages video capture from both webcam (development) and RTSP streams (production).
Provides a unified interface for frame capture regardless of source.
"""

import cv2
import numpy as np
import logging
from typing import Optional, Tuple
from enum import Enum
import asyncio

logger = logging.getLogger("attendai.camera")


class CameraMode(Enum):
    """Camera operation modes."""
    DEVELOPMENT = "development"  # Webcam
    PRODUCTION = "production"     # RTSP stream


class CameraService:
    """
    Camera service for capturing frames from webcam or RTSP stream.
    
    Development Mode:
        Uses local webcam via cv2.VideoCapture(0)
    
    Production Mode:
        Connects to RTSP stream via cv2.VideoCapture("rtsp://...")
    """
    
    def __init__(self, mode: CameraMode = CameraMode.DEVELOPMENT, rtsp_url: Optional[str] = None):
        """
        Initialize camera service.
        
        Args:
            mode: DEVELOPMENT (webcam) or PRODUCTION (RTSP)
            rtsp_url: RTSP stream URL (required for production mode)
        """
        self.mode = mode
        self.rtsp_url = rtsp_url
        self.capture: Optional[cv2.VideoCapture] = None
        self.is_active = False
        self.frame_count = 0
        
        # Camera configuration
        self.target_width = 640
        self.target_height = 480
        self.fps = 30
    
    def connect(self) -> bool:
        """
        Connect to camera source.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            if self.mode == CameraMode.DEVELOPMENT:
                logger.info("📷 Connecting to webcam (development mode)...")
                self.capture = cv2.VideoCapture(0)
                
                if not self.capture.isOpened():
                    logger.error("❌ Failed to open webcam")
                    return False
                
                # Set webcam properties
                self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.target_width)
                self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.target_height)
                self.capture.set(cv2.CAP_PROP_FPS, self.fps)
                
                logger.info("✅ Webcam connected successfully")
            
            elif self.mode == CameraMode.PRODUCTION:
                if not self.rtsp_url:
                    logger.error("❌ RTSP URL is required for production mode")
                    return False
                
                logger.info(f"📹 Connecting to RTSP stream: {self.rtsp_url}")
                self.capture = cv2.VideoCapture(self.rtsp_url)
                
                if not self.capture.isOpened():
                    logger.error(f"❌ Failed to connect to RTSP stream: {self.rtsp_url}")
                    return False
                
                logger.info("✅ RTSP stream connected successfully")
            
            self.is_active = True
            return True
            
        except Exception as e:
            logger.error(f"❌ Camera connection error: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from camera source and release resources."""
        if self.capture:
            self.capture.release()
            self.is_active = False
            logger.info("Camera disconnected")
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """
        Capture a single frame from the camera.
        
        Returns:
            Frame as numpy array (BGR format), or None if failed
        """
        if not self.is_active or not self.capture:
            logger.warning("Camera is not active. Call connect() first.")
            return None
        
        try:
            ret, frame = self.capture.read()
            
            if not ret or frame is None:
                logger.warning("Failed to capture frame")
                return None
            
            self.frame_count += 1
            return frame
            
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            return None
    
    async def capture_frame_async(self) -> Optional[np.ndarray]:
        """
        Async wrapper for frame capture.
        Allows non-blocking frame capture in async context.
        """
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        frame = await loop.run_in_executor(None, self.capture_frame)
        return frame
    
    def get_frame_size(self) -> Tuple[int, int]:
        """
        Get current frame dimensions.
        
        Returns:
            (width, height) tuple
        """
        if not self.capture:
            return (0, 0)
        
        width = int(self.capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        return (width, height)
    
    def get_fps(self) -> float:
        """Get current frames per second."""
        if not self.capture:
            return 0.0
        
        return self.capture.get(cv2.CAP_PROP_FPS)
    
    def is_connected(self) -> bool:
        """Check if camera is connected and active."""
        return self.is_active and self.capture is not None and self.capture.isOpened()
    
    def get_stats(self) -> dict:
        """
        Get camera statistics.
        
        Returns:
            {
                "mode": "development",
                "is_active": True,
                "frames_captured": 1234,
                "resolution": "640x480",
                "fps": 30.0
            }
        """
        width, height = self.get_frame_size()
        
        return {
            "mode": self.mode.value,
            "is_active": self.is_active,
            "frames_captured": self.frame_count,
            "resolution": f"{width}x{height}",
            "fps": self.get_fps(),
            "rtsp_url": self.rtsp_url if self.mode == CameraMode.PRODUCTION else None
        }
    
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()


class CameraManager:
    """
    Manages multiple camera instances for different classes.
    Singleton pattern to ensure only one camera per source.
    """
    
    _instances: dict = {}
    
    @classmethod
    def get_camera(
        cls,
        class_id: str,
        mode: CameraMode = CameraMode.DEVELOPMENT,
        rtsp_url: Optional[str] = None
    ) -> CameraService:
        """
        Get or create a camera instance for a specific class.
        
        Args:
            class_id: Unique identifier for the class
            mode: Camera mode (development or production)
            rtsp_url: RTSP stream URL for production mode
        
        Returns:
            CameraService instance
        """
        if class_id not in cls._instances:
            camera = CameraService(mode=mode, rtsp_url=rtsp_url)
            cls._instances[class_id] = camera
            logger.info(f"Created new camera instance for class {class_id}")
        
        return cls._instances[class_id]
    
    @classmethod
    def release_camera(cls, class_id: str):
        """Release camera instance for a specific class."""
        if class_id in cls._instances:
            camera = cls._instances[class_id]
            camera.disconnect()
            del cls._instances[class_id]
            logger.info(f"Released camera instance for class {class_id}")
    
    @classmethod
    def release_all(cls):
        """Release all camera instances."""
        for class_id in list(cls._instances.keys()):
            cls.release_camera(class_id)
        logger.info("All camera instances released")
    
    @classmethod
    def get_active_cameras(cls) -> list:
        """Get list of active camera class IDs."""
        return [
            class_id for class_id, camera in cls._instances.items()
            if camera.is_connected()
        ]


# ─── Utility Functions ────────────────────────────────────────────────────────

def test_camera_connection(mode: CameraMode, rtsp_url: Optional[str] = None) -> bool:
    """
    Test camera connection without creating a persistent instance.
    
    Args:
        mode: DEVELOPMENT or PRODUCTION
        rtsp_url: RTSP URL for production mode
    
    Returns:
        True if camera can be accessed, False otherwise
    """
    try:
        with CameraService(mode=mode, rtsp_url=rtsp_url) as camera:
            if not camera.is_connected():
                return False
            
            # Try capturing a test frame
            frame = camera.capture_frame()
            return frame is not None
    
    except Exception as e:
        logger.error(f"Camera connection test failed: {e}")
        return False


def validate_rtsp_url(url: str) -> bool:
    """
    Validate RTSP URL format.
    
    Args:
        url: RTSP URL to validate
    
    Returns:
        True if URL format is valid
    """
    if not url:
        return False
    
    # Basic validation
    valid_prefixes = ["rtsp://", "rtsps://"]
    return any(url.lower().startswith(prefix) for prefix in valid_prefixes)
