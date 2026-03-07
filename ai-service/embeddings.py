"""
embeddings.py — Student face embeddings management.

Loads student face embeddings from MongoDB on startup
and provides a fast in-memory lookup store for recognition.

Each student can have multiple training images.
We store all their embeddings and any one can produce a match.
"""

import os
import asyncio
import numpy as np
import logging
from typing import Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("attendai.embeddings")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/attendai")


class EmbeddingStore:
    """
    In-memory store for student face embeddings.

    Structure:
        _encodings:   List of 128-dim numpy arrays
        _student_ids: List of student MongoDB _id strings (parallel to _encodings)
    """

    def __init__(self):
        self._encodings: list[np.ndarray] = []
        self._student_ids: list[str] = []

    async def load(self) -> None:
        """
        Fetch all students with face embeddings from MongoDB
        and store them in memory.

        Students without embeddings (faceEmbedding == []) are skipped.
        Students with multiple training encodings stored in imageDataset encodings
        are added multiple times for better recognition coverage.
        """
        try:
            client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            db = client.get_default_database()

            # Fetch all students that have face embeddings
            cursor = db.students.find(
                {"faceEmbedding": {"$exists": True, "$ne": []}},
                {"_id": 1, "name": 1, "faceEmbedding": 1},
            )

            new_encodings: list[np.ndarray] = []
            new_ids: list[str] = []

            async for student in cursor:
                student_id = str(student["_id"])
                embedding = student.get("faceEmbedding", [])

                if not embedding or len(embedding) != 128:
                    logger.warning(f"Skipping student {student_id}: invalid embedding length {len(embedding)}")
                    continue

                encoding = np.array(embedding, dtype=np.float64)
                new_encodings.append(encoding)
                new_ids.append(student_id)

            # Atomically swap the store
            self._encodings = new_encodings
            self._student_ids = new_ids

            client.close()
            logger.info(f"Loaded {len(self._encodings)} face embeddings from MongoDB")

        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}", exc_info=True)
            # Don't crash on load failure — keep existing embeddings if any

    def get_all(self) -> Tuple[list[np.ndarray], list[str]]:
        """Return all encodings and their corresponding student IDs."""
        return self._encodings, self._student_ids

    def count(self) -> int:
        """Return the number of distinct students loaded."""
        return len(set(self._student_ids))

    def add_student(self, student_id: str, encoding: np.ndarray) -> None:
        """
        Dynamically add a single student's encoding to the store.
        Useful for real-time enrollment without requiring a full reload.
        """
        self._encodings.append(encoding)
        self._student_ids.append(student_id)
        logger.info(f"Added encoding for student {student_id} (total: {len(self._encodings)})")

    def remove_student(self, student_id: str) -> None:
        """Remove all encodings for a student."""
        indices_to_remove = [
            i for i, sid in enumerate(self._student_ids) if sid == student_id
        ]
        for idx in sorted(indices_to_remove, reverse=True):
            self._encodings.pop(idx)
            self._student_ids.pop(idx)
        logger.info(f"Removed {len(indices_to_remove)} encoding(s) for student {student_id}")
