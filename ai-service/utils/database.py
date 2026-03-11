"""
Database Utility Module

Provides MongoDB connection and data access functions
for the AttendAI face recognition service.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("attendai.database")

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "test"  # Change to your database name if different

# Global database client
_db_client: Optional[AsyncIOMotorClient] = None
_database = None


async def connect_to_mongodb():
    """
    Connect to MongoDB and initialize the database client.
    Called once during service startup.
    """
    global _db_client, _database
    
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable is not set")
    
    try:
        _db_client = AsyncIOMotorClient(MONGODB_URI)
        _database = _db_client[DATABASE_NAME]
        
        # Verify connection
        await _db_client.admin.command('ping')
        logger.info(f"✅ Connected to MongoDB: {DATABASE_NAME}")
        
    except ConnectionFailure as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection during service shutdown."""
    global _db_client
    
    if _db_client:
        _db_client.close()
        logger.info("MongoDB connection closed")


def get_database():
    """Get the database instance."""
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")
    return _database


# ─── Student Embeddings ──────────────────────────────────────────────────────

async def get_all_student_embeddings() -> List[Dict]:
    """
    Fetch all student embeddings from MongoDB.
    
    Returns:
        List of student documents with embeddings:
        [
            {
                "_id": ObjectId,
                "studentId": "STU001",
                "name": "John Doe",
                "faceEmbedding": [0.123, -0.456, ...]
            },
            ...
        ]
    """
    db = get_database()
    students = db["students"]
    
    # Only fetch students that have face embeddings
    cursor = students.find(
        {"faceEmbedding": {"$exists": True, "$ne": None}},
        {"_id": 1, "studentId": 1, "faceEmbedding": 1}
    )
    
    result = []
    async for student in cursor:
        if student.get("faceEmbedding"):
            result.append(student)
    
    logger.info(f"Loaded {len(result)} student embeddings from database")
    return result


async def get_student_by_id(student_id: str) -> Optional[Dict]:
    """Get student by MongoDB _id (ObjectId string)."""
    from bson import ObjectId
    
    db = get_database()
    students = db["students"]
    
    try:
        student = await students.find_one({"_id": ObjectId(student_id)})
        return student
    except Exception as e:
        logger.error(f"Error fetching student {student_id}: {e}")
        return None


# ─── Class Management ─────────────────────────────────────────────────────────

async def get_class_by_id(class_id: str) -> Optional[Dict]:
    """
    Get class details by MongoDB _id.
    
    Returns:
        {
            "_id": ObjectId,
            "courseName": "Computer Science 101",
            "classroomNumber": "A-401",
            "facultyId": ObjectId,
            "studentIds": [ObjectId, ObjectId, ...],
            "startTime": "2024-03-11T09:00:00Z",
            "endTime": "2024-03-11T10:30:00Z",
            "status": "scheduled"
        }
    """
    from bson import ObjectId
    
    db = get_database()
    classes = db["classes"]
    
    try:
        class_doc = await classes.find_one({"_id": ObjectId(class_id)})
        return class_doc
    except Exception as e:
        logger.error(f"Error fetching class {class_id}: {e}")
        return None


async def get_active_classes() -> List[Dict]:
    """
    Get all active classes (status: 'active').
    Used for automatic production monitoring.
    """
    db = get_database()
    classes = db["classes"]
    
    cursor = classes.find({"status": "active"})
    
    result = []
    async for class_doc in cursor:
        result.append(class_doc)
    
    return result


async def update_class_status(class_id: str, status: str):
    """
    Update class status.
    
    Args:
        class_id: MongoDB _id as string
        status: 'scheduled', 'active', 'completed', 'cancelled'
    """
    from bson import ObjectId
    
    db = get_database()
    classes = db["classes"]
    
    try:
        await classes.update_one(
            {"_id": ObjectId(class_id)},
            {"$set": {"status": status}}
        )
        logger.info(f"Updated class {class_id} status to: {status}")
    except Exception as e:
        logger.error(f"Error updating class status: {e}")


# ─── Attendance Records ───────────────────────────────────────────────────────

async def create_attendance_record(
    student_id: str,
    class_id: str,
    status: str = "present"
) -> Optional[str]:
    """
    Create an attendance record.
    
    Args:
        student_id: MongoDB _id of the student
        class_id: MongoDB _id of the class
        status: 'present', 'absent', 'late'
    
    Returns:
        Inserted document _id as string, or None if failed
    """
    from bson import ObjectId
    from datetime import datetime
    
    db = get_database()
    attendance = db["attendances"]
    
    try:
        record = {
            "studentId": ObjectId(student_id),
            "classId": ObjectId(class_id),
            "status": status,
            "detectedTime": datetime.utcnow(),
            "method": "face_recognition",
            "createdAt": datetime.utcnow()
        }
        
        result = await attendance.insert_one(record)
        logger.info(f"✅ Attendance recorded: Student {student_id} in Class {class_id}")
        return str(result.inserted_id)
        
    except Exception as e:
        logger.error(f"❌ Failed to create attendance record: {e}")
        return None


async def check_attendance_exists(student_id: str, class_id: str) -> bool:
    """
    Check if attendance record already exists for this student in this class.
    Prevents duplicate attendance records.
    """
    from bson import ObjectId
    
    db = get_database()
    attendance = db["attendances"]
    
    try:
        existing = await attendance.find_one({
            "studentId": ObjectId(student_id),
            "classId": ObjectId(class_id)
        })
        return existing is not None
    except Exception as e:
        logger.error(f"Error checking attendance: {e}")
        return False


async def get_class_attendance(class_id: str) -> List[Dict]:
    """Get all attendance records for a specific class."""
    from bson import ObjectId
    
    db = get_database()
    attendance = db["attendances"]
    
    cursor = attendance.find({"classId": ObjectId(class_id)})
    
    result = []
    async for record in cursor:
        result.append(record)
    
    return result


# ─── Statistics ───────────────────────────────────────────────────────────────

async def get_attendance_stats(class_id: str) -> Dict:
    """
    Get attendance statistics for a class.
    
    Returns:
        {
            "total_students": 30,
            "present": 25,
            "absent": 5,
            "attendance_rate": 83.33
        }
    """
    from bson import ObjectId
    
    db = get_database()
    classes = db["classes"]
    attendance = db["attendances"]
    
    try:
        # Get class details
        class_doc = await classes.find_one({"_id": ObjectId(class_id)})
        if not class_doc:
            return {}
        
        total_students = len(class_doc.get("studentIds", []))
        
        # Count present students
        present_count = await attendance.count_documents({
            "classId": ObjectId(class_id),
            "status": "present"
        })
        
        absent_count = total_students - present_count
        attendance_rate = (present_count / total_students * 100) if total_students > 0 else 0
        
        return {
            "total_students": total_students,
            "present": present_count,
            "absent": absent_count,
            "attendance_rate": round(attendance_rate, 2)
        }
        
    except Exception as e:
        logger.error(f"Error calculating attendance stats: {e}")
        return {}
