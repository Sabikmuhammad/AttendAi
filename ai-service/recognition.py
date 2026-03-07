"""
recognition.py — Face recognition and matching module.

Compares detected face encodings against the stored
student embeddings to identify who is in the frame.
"""

import numpy as np
import face_recognition
import logging
from typing import Tuple

logger = logging.getLogger("attendai.recognition")

# Tolerance: lower = stricter matching (0.5 is very strict, 0.6 is default, 0.7 is lenient)
RECOGNITION_TOLERANCE = 0.55


def recognize_faces(
    face_encodings: list[np.ndarray],
    embedding_store,  # EmbeddingStore instance
    tolerance: float = RECOGNITION_TOLERANCE,
) -> Tuple[list[str], float | None]:
    """
    Match detected face encodings against known student embeddings.

    Args:
        face_encodings:   List of 128-dim numpy arrays from detected faces
        embedding_store:  EmbeddingStore with known student embeddings
        tolerance:        Maximum distance to count as a match (lower = stricter)

    Returns:
        recognized_ids:  List of matched student MongoDB _id strings
        avg_confidence:  Average confidence score (0.0–1.0) for matched faces
    """
    if not face_encodings:
        return [], None

    known_encodings, student_ids = embedding_store.get_all()

    if not known_encodings:
        logger.warning("No student embeddings loaded — cannot recognize faces")
        return [], None

    recognized_ids = []
    confidence_scores = []

    for face_encoding in face_encodings:
        # ── Compare this face against all known student encodings ────────────────
        distances = face_recognition.face_distance(known_encodings, face_encoding)

        if len(distances) == 0:
            continue

        # Find the best match (minimum distance = most similar)
        best_match_idx = int(np.argmin(distances))
        best_distance = float(distances[best_match_idx])

        logger.debug(f"Best match distance: {best_distance:.4f} (tolerance: {tolerance})")

        if best_distance <= tolerance:
            matched_student_id = student_ids[best_match_idx]

            # Avoid duplicate detections in the same frame
            if matched_student_id not in recognized_ids:
                recognized_ids.append(matched_student_id)

                # Convert distance to confidence score (0.0 = exact match, 1.0 = perfect)
                confidence = 1.0 - best_distance
                confidence_scores.append(confidence)
                logger.info(f"Recognized student {matched_student_id} with confidence {confidence:.2%}")
        else:
            logger.debug(f"Face did not match any known student (distance: {best_distance:.4f})")

    avg_confidence = float(np.mean(confidence_scores)) if confidence_scores else None

    return recognized_ids, avg_confidence
