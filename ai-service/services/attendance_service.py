"""
Attendance Service Module

Orchestrates the complete attendance monitoring workflow:
1. Camera capture
2. Face detection
3. Face recognition
4. Attendance recording
"""

import asyncio
import logging
from typing import List, Dict, Optional, Set
from datetime import datetime
import numpy as np

from services.camera_service import CameraService, CameraMode, CameraManager
from services.face_detection_service import FaceDetectionService, create_detection_service
from services.face_recognition_service import FaceRecognitionService, get_embedding_store, create_recognition_service
from utils.database import (
    get_class_by_id,
    create_attendance_record,
    check_attendance_exists,
    get_attendance_stats,
    update_class_status
)
from utils.time_utils import ClassTimer, parse_datetime

logger = logging.getLogger("attendai.attendance")


class AttendanceMonitor:
    """
    Monitors a class session and automatically records attendance
    based on face recognition.
    """
    
    def __init__(
        self,
        class_id: str,
        mode: CameraMode = CameraMode.DEVELOPMENT,
        rtsp_url: Optional[str] = None,
        detection_interval: int = 3
    ):
        """
        Initialize attendance monitor.
        
        Args:
            class_id: MongoDB _id of the class
            mode: DEVELOPMENT (webcam) or PRODUCTION (RTSP)
            rtsp_url: RTSP stream URL for production mode
            detection_interval: Seconds between detection attempts (default: 3)
        """
        self.class_id = class_id
        self.mode = mode
        self.rtsp_url = rtsp_url
        self.detection_interval = detection_interval
        
        # Services
        self.camera: Optional[CameraService] = None
        self.face_detector: Optional[FaceDetectionService] = None
        self.face_recognizer: Optional[FaceRecognitionService] = None
        self.class_timer: Optional[ClassTimer] = None
        
        # State
        self.is_monitoring = False
        self.class_data: Optional[Dict] = None
        self.recorded_students: Set[str] = set()  # Students who've been marked present
        self.total_detections = 0
        self.total_recognitions = 0
        
        # Frame and detection storage for streaming
        self.latest_frame: Optional[np.ndarray] = None
        self.latest_detections: Optional[Dict] = None
        
        # Monitoring task
        self._monitor_task: Optional[asyncio.Task] = None
    
    async def initialize(self) -> bool:
        """
        Initialize all services and load class data.
        
        Returns:
            True if initialization successful
        """
        try:
            logger.info(f"📋 Initializing attendance monitor for class {self.class_id}")
            
            # 1. Load class data from MongoDB
            self.class_data = await get_class_by_id(self.class_id)
            
            if not self.class_data:
                logger.error(f"❌ Class {self.class_id} not found in database")
                return False
            
            logger.info(f"✅ Loaded class: {self.class_data.get('courseName', 'Unknown')}")
            
            # 2. Parse class times
            start_time_str = self.class_data.get("startTime")
            end_time_str = self.class_data.get("endTime")
            
            if not start_time_str or not end_time_str:
                logger.error("❌ Class missing startTime or endTime")
                return False
            
            start_time = parse_datetime(start_time_str)
            end_time = parse_datetime(end_time_str)
            
            if not start_time or not end_time:
                logger.error("❌ Failed to parse class times")
                return False
            
            self.class_timer = ClassTimer(start_time, end_time, self.class_id)
            
            # 3. Initialize camera
            self.camera = CameraManager.get_camera(
                class_id=self.class_id,
                mode=self.mode,
                rtsp_url=self.rtsp_url
            )
            
            # 4. Initialize face detection service
            self.face_detector = create_detection_service(model="hog", use_gpu=False)
            
            # 5. Initialize face recognition service
            embedding_store = await get_embedding_store()
            self.face_recognizer = create_recognition_service(tolerance=0.55)
            
            logger.info(f"✅ Loaded {embedding_store.count()} student embeddings")
            
            logger.info("✅ Attendance monitor initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            return False
    
    async def start_monitoring(self):
        """
        Start the attendance monitoring process.
        
        Workflow:
        1. Wait until class start time
        2. Activate camera
        3. Begin detection loop
        4. Continue until class ends
        """
        if self.is_monitoring:
            logger.warning("Monitoring already in progress")
            return
        
        self.is_monitoring = True
        logger.info("🚀 Starting attendance monitoring")
        
        try:
            # Step 1: Wait for class start time
            if self.class_timer:
                await self.class_timer.wait_for_start()
                await update_class_status(self.class_id, "active")
            
            # Step 2: Connect to camera
            if not self.camera or not self.camera.connect():
                logger.error("❌ Failed to connect to camera")
                self.is_monitoring = False
                return
            
            logger.info("📷 Camera activated")
            
            # Step 3: Start detection loop
            self._monitor_task = asyncio.create_task(self._detection_loop())
            
        except Exception as e:
            logger.error(f"❌ Monitoring start failed: {e}")
            self.is_monitoring = False
            await self.cleanup()
    
    async def _detection_loop(self):
        """
        Main detection loop.
        Runs continuously until monitoring is stopped or class ends.
        """
        logger.info("🔄 Detection loop started")
        
        try:
            while self.is_monitoring:
                # Check if class has ended
                if self.class_timer and self.class_timer.has_ended():
                    logger.info("⏰ Class has ended. Stopping monitoring.")
                    await self.stop_monitoring()
                    break
                
                # Capture frame
                frame = await self.camera.capture_frame_async()
                
                if frame is None:
                    logger.warning("Failed to capture frame. Retrying...")
                    await asyncio.sleep(1)
                    continue
                
                # Store latest frame for streaming
                self.latest_frame = frame.copy()
                
                # Detect faces
                face_locations, face_encodings = await self.face_detector.detect_faces_async(frame)
                self.total_detections += len(face_locations)
                
                # Prepare detection data for streaming
                detection_data = {
                    'face_locations': face_locations,
                    'face_count': len(face_locations),
                    'labels': [],
                    'confidences': [],
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                if len(face_encodings) == 0:
                    # No faces detected, update detections and continue
                    self.latest_detections = detection_data
                    await asyncio.sleep(self.detection_interval)
                    continue
                
                logger.info(f"👤 Detected {len(face_encodings)} face(s)")
                
                # Recognize faces
                recognized_ids, confidence = await self.face_recognizer.recognize_faces_async(face_encodings)
                
                # Get student names for labels
                labels = []
                confidences = []
                for i, student_id in enumerate(recognized_ids):
                    if student_id and student_id != "Unknown":
                        # Get student name from database
                        student_name = await self._get_student_name(student_id)
                        labels.append(student_name)
                        confidences.append(confidence * 100 if confidence else 0)
                    else:
                        labels.append("Unknown")
                        confidences.append(0)
                
                detection_data['labels'] = labels
                detection_data['confidences'] = confidences
                self.latest_detections = detection_data
                
                if not recognized_ids:
                    logger.debug("No faces recognized")
                    await asyncio.sleep(self.detection_interval)
                    continue
                
                logger.info(f"✅ Recognized {len(recognized_ids)} student(s) (confidence: {confidence:.2%})")
                self.total_recognitions += len(recognized_ids)
                
                # Record attendance
                await self._record_attendance(recognized_ids)
                
                # Wait before next detection
                await asyncio.sleep(self.detection_interval)
        
        except asyncio.CancelledError:
            logger.info("Detection loop cancelled")
        except Exception as e:
            logger.error(f"❌ Detection loop error: {e}")
        finally:
            await self.cleanup()
    
    async def _record_attendance(self, student_ids: List[str]):
        """
        Record attendance for recognized students.
        
        Args:
            student_ids: List of MongoDB _id strings for recognized students
        """
        class_student_ids = [str(sid) for sid in self.class_data.get("studentIds", [])]
        
        for student_id in student_ids:
            # Skip if already recorded
            if student_id in self.recorded_students:
                logger.debug(f"Student {student_id} already marked present")
                continue
            
            # Verify student belongs to this class
            if student_id not in class_student_ids:
                logger.warning(f"Student {student_id} not enrolled in this class")
                continue
            
            # Check if attendance already exists (database level)
            exists = await check_attendance_exists(student_id, self.class_id)
            
            if exists:
                logger.debug(f"Attendance already recorded for student {student_id}")
                self.recorded_students.add(student_id)
                continue
            
            # Create attendance record
            attendance_id = await create_attendance_record(
                student_id=student_id,
                class_id=self.class_id,
                status="present"
            )
            
            if attendance_id:
                self.recorded_students.add(student_id)
                logger.info(f"✅ Marked student {student_id} as PRESENT")
    
    async def _finalize_attendance(self):
        """
        Mark students who were enrolled but not detected as absent.
        Called when monitoring stops.
        """
        if not self.class_data:
            return
        
        logger.info("📝 Finalizing attendance - marking absent students")
        
        # Get all enrolled student IDs
        enrolled_student_ids = [str(sid) for sid in self.class_data.get("studentIds", [])]
        
        # Find students who were not marked present
        absent_count = 0
        for student_id in enrolled_student_ids:
            if student_id not in self.recorded_students:
                # Check if already has an attendance record (might have been manually recorded)
                already_recorded = await check_attendance_exists(student_id, self.class_id)
                
                if not already_recorded:
                    # Mark as absent
                    attendance_id = await create_attendance_record(
                        student_id=student_id,
                        class_id=self.class_id,
                        status="absent"
                    )
                    
                    if attendance_id:
                        absent_count += 1
                        logger.info(f"❌ Marked student {student_id} as ABSENT")
        
        if absent_count > 0:
            logger.info(f"📊 Marked {absent_count} student(s) as absent")
        else:
            logger.info("✅ All enrolled students were present")
    
    async def stop_monitoring(self):
        """Stop the monitoring process and cleanup."""
        if not self.is_monitoring:
            return
        
        logger.info("🛑 Stopping attendance monitoring")
        self.is_monitoring = False
        
        # Cancel monitoring task
        if self._monitor_task and not self._monitor_task.done():
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass
        
        # Mark absent students before cleanup
        await self._finalize_attendance()
        
        await self.cleanup()
        
        # Update class status to completed
        if self.class_timer and self.class_timer.has_ended():
            await update_class_status(self.class_id, "completed")
        
        # Log final statistics
        stats = await self.get_stats()
        logger.info(f"📊 Final Statistics: {stats}")
    
    async def cleanup(self):
        """Release resources."""
        if self.camera:
            CameraManager.release_camera(self.class_id)
            self.camera = None
    
    def get_latest_frame(self) -> Optional[np.ndarray]:
        """
        Get the latest captured frame for streaming.
        
        Returns:
            Latest frame as numpy array, or None if not available
        """
        return self.latest_frame
    
    def get_latest_detections(self) -> Optional[Dict]:
        """
        Get the latest face detection results for overlay.
        
        Returns:
            Dictionary with face_locations, labels, confidences, and timestamp
        """
        return self.latest_detections
    
    async def _get_student_name(self, student_id: str) -> str:
        """
        Get student name by ID.
        
        Args:
            student_id: MongoDB _id of student
            
        Returns:
            Student name or "Unknown Student"
        """
        try:
            from utils.database import get_student_by_id
            student = await get_student_by_id(student_id)
            if student:
                return student.get('name', 'Unknown Student')
        except:
            pass
        return "Unknown Student"
    
    async def get_stats(self) -> Dict:
        """
        Get comprehensive monitoring statistics.
        
        Returns:
            {
                "class_id": "...",
                "course_name": "...",
                "monitoring_active": True,
                "students_present": 25,
                "total_students": 30,
                "attendance_rate": 83.33,
                "total_detections": 1234,
                "total_recognitions": 567,
                "mode": "development"
            }
        """
        attendance_stats = await get_attendance_stats(self.class_id)
        
        return {
            "class_id": self.class_id,
            "course_name": self.class_data.get("courseName", "Unknown") if self.class_data else "Unknown",
            "monitoring_active": self.is_monitoring,
            "students_present": len(self.recorded_students),
            "total_students": len(self.class_data.get("studentIds", [])) if self.class_data else 0,
            "attendance_rate": attendance_stats.get("attendance_rate", 0),
            "total_detections": self.total_detections,
            "total_recognitions": self.total_recognitions,
            "mode": self.mode.value,
            "class_status": self.class_timer.get_status() if self.class_timer else "unknown"
        }


# ─── Global Monitor Management ────────────────────────────────────────────────

_active_monitors: Dict[str, AttendanceMonitor] = {}


async def start_class_monitoring(
    class_id: str,
    mode: CameraMode = CameraMode.DEVELOPMENT,
    rtsp_url: Optional[str] = None
) -> Optional[AttendanceMonitor]:
    """
    Start monitoring for a specific class.
    
    Args:
        class_id: MongoDB _id of the class
        mode: DEVELOPMENT or PRODUCTION
        rtsp_url: RTSP stream URL for production mode
    
    Returns:
        AttendanceMonitor instance if successful, None otherwise
    """
    global _active_monitors
    
    if class_id in _active_monitors:
        logger.warning(f"Monitoring already active for class {class_id}")
        return _active_monitors[class_id]
    
    monitor = AttendanceMonitor(
        class_id=class_id,
        mode=mode,
        rtsp_url=rtsp_url,
        detection_interval=3
    )
    
    if not await monitor.initialize():
        logger.error(f"Failed to initialize monitor for class {class_id}")
        return None
    
    _active_monitors[class_id] = monitor
    
    # Start monitoring in background
    asyncio.create_task(monitor.start_monitoring())
    
    return monitor


async def stop_class_monitoring(class_id: str):
    """Stop monitoring for a specific class."""
    global _active_monitors
    
    if class_id not in _active_monitors:
        logger.warning(f"No active monitoring for class {class_id}")
        return
    
    monitor = _active_monitors[class_id]
    await monitor.stop_monitoring()
    del _active_monitors[class_id]


def get_active_monitor(class_id: str) -> Optional[AttendanceMonitor]:
    """Get active monitor for a class."""
    return _active_monitors.get(class_id)


def get_all_active_monitors() -> Dict[str, AttendanceMonitor]:
    """Get all active monitors."""
    return _active_monitors.copy()


async def stop_all_monitoring():
    """Stop all active monitoring sessions."""
    global _active_monitors
    
    class_ids = list(_active_monitors.keys())
    
    for class_id in class_ids:
        await stop_class_monitoring(class_id)
    
    logger.info("All monitoring sessions stopped")
