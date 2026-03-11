"""
Attendance Routes

API endpoints for querying attendance records and statistics.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from utils.database import (
    get_class_attendance,
    get_attendance_stats,
    get_student_by_id
)

logger = logging.getLogger("attendai.routes.attendance")

router = APIRouter(prefix="/attendance", tags=["attendance"])


# ─── Response Models ──────────────────────────────────────────────────────────

class AttendanceRecord(BaseModel):
    """Single attendance record."""
    studentId: str
    studentName: Optional[str] = None
    status: str
    timestamp: str
    detectionMethod: str


class AttendanceStatsResponse(BaseModel):
    """Attendance statistics for a class."""
    success: bool
    classId: str
    total_students: int
    present: int
    absent: int
    attendance_rate: float


class AttendanceListResponse(BaseModel):
    """List of attendance records."""
    success: bool
    classId: str
    total_records: int
    records: List[dict]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/class/{class_id}", response_model=AttendanceListResponse)
async def get_class_attendance_records(class_id: str):
    """
    Get all attendance records for a specific class.
    
    Returns detailed list of all students who were marked present,
    including timestamps and detection methods.
    
    ## Example Response
    ```json
    {
        "success": true,
        "classId": "65f1234567890abcdef12345",
        "total_records": 25,
        "records": [
            {
                "studentId": "65f9876543210fedcba98765",
                "status": "present",
                "timestamp": "2024-03-11T09:15:23Z",
                "detectionMethod": "face_recognition"
            },
            ...
        ]
    }
    ```
    """
    try:
        logger.info(f"📊 Fetching attendance records for class {class_id}")
        
        records = await get_class_attendance(class_id)
        
        # Format records
        formatted_records = []
        for record in records:
            formatted_records.append({
                "studentId": str(record.get("studentId")),
                "status": record.get("status"),
                "timestamp": record.get("timestamp").isoformat() if record.get("timestamp") else None,
                "detectionMethod": record.get("detectionMethod", "face_recognition")
            })
        
        return AttendanceListResponse(
            success=True,
            classId=class_id,
            total_records=len(formatted_records),
            records=formatted_records
        )
    
    except Exception as e:
        logger.error(f"❌ Error fetching attendance records: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/class/{class_id}/stats", response_model=AttendanceStatsResponse)
async def get_class_stats(class_id: str):
    """
    Get attendance statistics for a class.
    
    Returns:
    - Total students in class
    - Number present
    - Number absent
    - Attendance rate percentage
    
    ## Example Response
    ```json
    {
        "success": true,
        "classId": "65f1234567890abcdef12345",
        "total_students": 30,
        "present": 25,
        "absent": 5,
        "attendance_rate": 83.33
    }
    ```
    """
    try:
        logger.info(f"📊 Fetching attendance stats for class {class_id}")
        
        stats = await get_attendance_stats(class_id)
        
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"Class {class_id} not found or has no attendance data"
            )
        
        return AttendanceStatsResponse(
            success=True,
            classId=class_id,
            total_students=stats.get("total_students", 0),
            present=stats.get("present", 0),
            absent=stats.get("absent", 0),
            attendance_rate=stats.get("attendance_rate", 0.0)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching attendance stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/{student_id}")
async def get_student_attendance(student_id: str):
    """
    Get attendance history for a specific student.
    
    Returns all classes the student attended.
    
    ## Example Response
    ```json
    {
        "success": true,
        "studentId": "65f9876543210fedcba98765",
        "studentName": "John Doe",
        "total_classes_attended": 18,
        "attendance_records": [...]
    }
    ```
    """
    try:
        logger.info(f"📊 Fetching attendance for student {student_id}")
        
        # Get student info
        student = await get_student_by_id(student_id)
        
        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student {student_id} not found"
            )
        
        # Note: This would require a new database function to get
        # all attendance records for a student across all classes
        # For now, return basic student info
        
        return {
            "success": True,
            "studentId": student_id,
            "studentName": student.get("name", "Unknown"),
            "message": "Full attendance history coming soon"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching student attendance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual")
async def manual_attendance_record(request: BaseModel):
    """
    Manually record attendance (admin override).
    
    Use case: Mark student present if face recognition failed
    but student was verified to be present by other means.
    
    ## Example Request
    ```json
    {
        "studentId": "65f9876543210fedcba98765",
        "classId": "65f1234567890abcdef12345",
        "status": "present"
    }
    ```
    """
    try:
        from utils.database import create_attendance_record
        
        data = request.dict()
        student_id = data.get("studentId")
        class_id = data.get("classId")
        status = data.get("status", "present")
        
        if not student_id or not class_id:
            raise HTTPException(
                status_code=400,
                detail="studentId and classId are required"
            )
        
        logger.info(f"📝 Manual attendance: Student {student_id} in Class {class_id}")
        
        attendance_id = await create_attendance_record(
            student_id=student_id,
            class_id=class_id,
            status=status
        )
        
        if not attendance_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create attendance record"
            )
        
        return {
            "success": True,
            "message": "Attendance recorded successfully",
            "attendanceId": attendance_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error recording manual attendance: {e}")
        raise HTTPException(status_code=500, detail=str(e))
