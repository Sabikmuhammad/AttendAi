"""
Video Streaming Routes

Provides real-time video streaming endpoints with face detection overlays.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import logging
import time
from typing import Optional

from services.attendance_service import get_active_monitor
from face_detector import draw_detections

logger = logging.getLogger("attendai.routes.stream")

router = APIRouter(prefix="/stream", tags=["streaming"])


def generate_video_stream(class_id: str):
    """
    Generator function that yields MJPEG frames for streaming.
    
    Args:
        class_id: MongoDB class ID to stream from
        
    Yields:
        MJPEG frame bytes in multipart/x-mixed-replace format
    """
    logger.info(f"📹 Starting video stream for class {class_id}")
    
    frame_count = 0
    max_fps = 15  # Limit to 15 FPS for web streaming
    frame_delay = 1.0 / max_fps
    
    try:
        while True:
            # Get the active monitor for this class
            monitor = get_active_monitor(class_id)
            
            if not monitor:
                # Send a placeholder frame indicating no active monitoring
                placeholder = create_placeholder_frame("No active monitoring session")
                ret, buffer = cv2.imencode('.jpg', placeholder, [cv2.IMWRITE_JPEG_QUALITY, 85])
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                time.sleep(0.5)  # Check again in 0.5 seconds
                continue
            
            # Get latest frame from monitor
            frame = monitor.get_latest_frame()
            
            if frame is None:
                # Send placeholder if no frame available yet
                placeholder = create_placeholder_frame("Waiting for camera...")
                ret, buffer = cv2.imencode('.jpg', placeholder, [cv2.IMWRITE_JPEG_QUALITY, 85])
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                time.sleep(0.1)
                continue
            
            # Get detection results from monitor
            detections = monitor.get_latest_detections()
            
            # Draw bounding boxes and labels on frame
            if detections:
                face_locations = detections.get('face_locations', [])
                labels = detections.get('labels', [])
                confidences = detections.get('confidences', [])
                
                annotated_frame = draw_detection_overlay(
                    frame, 
                    face_locations, 
                    labels, 
                    confidences
                )
            else:
                annotated_frame = frame.copy()
            
            # Add frame info overlay
            annotated_frame = add_info_overlay(annotated_frame, monitor, frame_count)
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            
            if not ret:
                logger.warning("Failed to encode frame")
                continue
            
            frame_bytes = buffer.tobytes()
            frame_count += 1
            
            # Yield frame in MJPEG format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Control frame rate
            time.sleep(frame_delay)
            
    except GeneratorExit:
        logger.info(f"📹 Stream ended for class {class_id}")
    except Exception as e:
        logger.error(f"Error in video stream: {e}")


def create_placeholder_frame(message: str) -> np.ndarray:
    """Create a placeholder frame with a message."""
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:] = (30, 30, 30)  # Dark gray background
    
    # Add message
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_size = cv2.getTextSize(message, font, 0.8, 2)[0]
    text_x = (640 - text_size[0]) // 2
    text_y = (480 + text_size[1]) // 2
    
    cv2.putText(frame, message, (text_x, text_y), font, 0.8, (200, 200, 200), 2)
    
    return frame


def draw_detection_overlay(
    frame: np.ndarray,
    face_locations: list,
    labels: list,
    confidences: list
) -> np.ndarray:
    """
    Draw bounding boxes and labels on detected faces.
    
    Args:
        frame: Original BGR frame
        face_locations: List of (top, right, bottom, left) tuples
        labels: List of student names or "Unknown"
        confidences: List of confidence scores (0-100)
        
    Returns:
        Annotated frame
    """
    annotated = frame.copy()
    
    for i, (top, right, bottom, left) in enumerate(face_locations):
        label = labels[i] if i < len(labels) else "Unknown"
        confidence = confidences[i] if i < len(confidences) else 0
        
        # Choose color: green for recognized, red for unknown
        if label != "Unknown":
            color = (0, 255, 0)  # Green
            box_thickness = 3
        else:
            color = (0, 0, 255)  # Red
            box_thickness = 2
        
        # Draw bounding box
        cv2.rectangle(annotated, (left, top), (right, bottom), color, box_thickness)
        
        # Prepare label text
        if label != "Unknown":
            text = f"{label} ({confidence:.1f}%)"
        else:
            text = "Unknown"
        
        # Calculate label background size
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        font_thickness = 2
        (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, font_thickness)
        
        # Draw label background
        label_top = max(top - text_height - 10, 0)
        cv2.rectangle(
            annotated,
            (left, label_top),
            (left + text_width + 10, top),
            color,
            -1  # Filled
        )
        
        # Draw label text
        cv2.putText(
            annotated,
            text,
            (left + 5, top - 5),
            font,
            font_scale,
            (255, 255, 255),  # White text
            font_thickness
        )
    
    return annotated


def add_info_overlay(frame: np.ndarray, monitor, frame_count: int) -> np.ndarray:
    """Add information overlay to frame (status, stats, etc.)."""
    annotated = frame.copy()
    height, width = frame.shape[:2]
    
    # Get stats from monitor (avoid async call in sync context)
    try:
        # Access cached stats directly
        students_present = len(monitor.recorded_students) if hasattr(monitor, 'recorded_students') else 0
        total_students = len(monitor.class_data.get("studentIds", [])) if monitor.class_data else 0
        attendance_rate = (students_present / total_students * 100) if total_students > 0 else 0
    except:
        students_present = 0
        total_students = 0
        attendance_rate = 0
    
    # Draw semi-transparent overlay panel at top
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, 0), (width, 80), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.4, annotated, 0.6, 0, annotated)
    
    # Add text information
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # Status indicator
    cv2.circle(annotated, (20, 25), 8, (0, 255, 0), -1)  # Green dot
    cv2.putText(annotated, "LIVE", (35, 30), font, 0.6, (255, 255, 255), 2)
    
    # Attendance stats
    stats_text = f"Present: {students_present}/{total_students} ({attendance_rate:.1f}%)"
    cv2.putText(annotated, stats_text, (20, 60), font, 0.6, (255, 255, 255), 2)
    
    # Frame counter (top right)
    frame_text = f"Frame: {frame_count}"
    text_size = cv2.getTextSize(frame_text, font, 0.5, 1)[0]
    cv2.putText(
        annotated, 
        frame_text, 
        (width - text_size[0] - 20, 30), 
        font, 
        0.5, 
        (200, 200, 200), 
        1
    )
    
    return annotated


@router.get("/video/{class_id}")
async def stream_video(class_id: str):
    """
    Stream live video feed for a class with face detection overlay.
    
    Returns MJPEG stream that can be displayed in an <img> tag:
    ```html
    <img src="http://localhost:8000/stream/video/{class_id}" />
    ```
    
    Args:
        class_id: MongoDB class ID
        
    Returns:
        MJPEG video stream
    """
    # Validate that monitoring is active for this class
    monitor = get_active_monitor(class_id)
    
    if not monitor:
        # Still allow streaming - will show placeholder until monitoring starts
        logger.info(f"No active monitor for class {class_id}, will show placeholder")
    
    return StreamingResponse(
        generate_video_stream(class_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/status/{class_id}")
async def get_stream_status(class_id: str):
    """
    Get streaming status for a class.
    
    Returns:
        JSON with streaming availability and stats
    """
    monitor = get_active_monitor(class_id)
    
    if not monitor:
        return {
            "streaming": False,
            "message": "No active monitoring session"
        }
    
    try:
        stats = await monitor.get_stats()
        return {
            "streaming": True,
            "stats": stats
        }
    except Exception as e:
        return {
            "streaming": False,
            "error": str(e)
        }
