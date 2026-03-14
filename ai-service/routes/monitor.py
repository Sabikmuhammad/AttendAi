"""
Monitoring Routes

API endpoints for starting/stopping attendance monitoring sessions.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging

from services.camera_service import CameraMode
from services.attendance_service import (
    start_class_monitoring,
    stop_class_monitoring,
    get_active_monitor,
    get_all_active_monitors
)

logger = logging.getLogger("attendai.routes.monitor")

router = APIRouter(prefix="/monitor", tags=["monitoring"])


# ─── Request/Response Models ──────────────────────────────────────────────────

class StartMonitoringRequest(BaseModel):
    """Request to start monitoring a class."""
    classId: str
    mode: str = "development"  # "development" or "production"
    rtspUrl: Optional[str] = None  # Required for production mode


class MonitoringResponse(BaseModel):
    """Response for monitoring operations."""
    success: bool
    message: str
    classId: str
    monitoring_active: bool
    stats: Optional[dict] = None


class StopMonitoringRequest(BaseModel):
    """Request to stop monitoring a class."""
    classId: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=MonitoringResponse)
async def start_monitoring(request: StartMonitoringRequest):
    """
    Start attendance monitoring for a class.
    
    Workflow:
    1. Validates class exists in MongoDB
    2. Waits until class start time
    3. Activates camera (webcam or RTSP)
    4. Begins face detection and recognition loop
    5. Records attendance automatically
    
    ## Development Mode
    - Uses webcam (cv2.VideoCapture(0))
    - Requires manual activation from admin camera page
    
    ## Production Mode
    - Uses RTSP camera stream
    - Can be triggered automatically by scheduler
    - Requires rtspUrl parameter
    
    ## Example Request (Development)
    ```json
    {
        "classId": "65f1234567890abcdef12345",
        "mode": "development"
    }
    ```
    
    ## Example Request (Production)
    ```json
    {
        "classId": "65f1234567890abcdef12345",
        "mode": "production",
        "rtspUrl": "rtsp://192.168.1.100:554/stream"
    }
    ```
    """
    try:
        logger.info(f"📞 Received monitoring request for class {request.classId}")
        
        # Validate mode
        if request.mode not in ["development", "production"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid mode. Must be 'development' or 'production'"
            )
        
        # Validate RTSP URL for production mode
        if request.mode == "production" and not request.rtspUrl:
            raise HTTPException(
                status_code=400,
                detail="rtspUrl is required for production mode"
            )
        
        # Convert mode string to enum
        camera_mode = (
            CameraMode.PRODUCTION if request.mode == "production"
            else CameraMode.DEVELOPMENT
        )
        
        # Start monitoring
        monitor = await start_class_monitoring(
            class_id=request.classId,
            mode=camera_mode,
            rtsp_url=request.rtspUrl
        )
        
        if not monitor:
            raise HTTPException(
                status_code=500,
                detail="Failed to start monitoring. Check logs for details."
            )
        
        # Get initial stats
        stats = await monitor.get_stats()
        
        logger.info(f"✅ Monitoring started for class {request.classId}")
        
        return MonitoringResponse(
            success=True,
            message="Monitoring started successfully. Waiting for class start time.",
            classId=request.classId,
            monitoring_active=True,
            stats=stats
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop", response_model=MonitoringResponse)
async def stop_monitoring(request: StopMonitoringRequest):
    """
    Stop attendance monitoring for a class.
    
    ## Example Request
    ```json
    {
        "classId": "65f1234567890abcdef12345"
    }
    ```
    """
    try:
        class_id = request.classId
        
        if not class_id:
            raise HTTPException(status_code=400, detail="classId is required")
        
        logger.info(f"📞 Received stop request for class {class_id}")
        
        # Check if monitoring is active
        monitor = get_active_monitor(class_id)
        
        if not monitor:
            raise HTTPException(
                status_code=404,
                detail=f"No active monitoring found for class {class_id}"
            )
        
        # Get final stats before stopping
        stats = await monitor.get_stats()
        
        # Stop monitoring
        await stop_class_monitoring(class_id)
        
        logger.info(f"✅ Monitoring stopped for class {class_id}")
        
        return MonitoringResponse(
            success=True,
            message="Monitoring stopped successfully",
            classId=class_id,
            monitoring_active=False,
            stats=stats
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{class_id}", response_model=MonitoringResponse)
async def get_monitoring_status(class_id: str):
    """
    Get current monitoring status for a class.
    
    Returns real-time statistics including:
    - Students present
    - Total detections
    - Camera status
    - Class timer status
    """
    try:
        monitor = get_active_monitor(class_id)
        
        if not monitor:
            return MonitoringResponse(
                success=True,
                message="No active monitoring for this class",
                classId=class_id,
                monitoring_active=False,
                stats=None
            )
        
        stats = await monitor.get_stats()
        
        return MonitoringResponse(
            success=True,
            message="Monitoring is active",
            classId=class_id,
            monitoring_active=True,
            stats=stats
        )
    
    except Exception as e:
        logger.error(f"❌ Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active")
async def get_active_sessions():
    """
    Get all active monitoring sessions.
    
    Returns:
    ```json
    {
        "success": true,
        "active_sessions": 3,
        "classes": [
            {
                "classId": "...",
                "courseName": "...",
                "monitoring_active": true,
                "students_present": 25
            },
            ...
        ]
    }
    ```
    """
    try:
        monitors = get_all_active_monitors()
        
        classes = []
        for class_id, monitor in monitors.items():
            stats = await monitor.get_stats()
            classes.append(stats)
        
        return {
            "success": True,
            "active_sessions": len(monitors),
            "classes": classes
        }
    
    except Exception as e:
        logger.error(f"❌ Error getting active sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
