"""
face_detector.py — OpenCV-based face detection module.

Uses the HOG-based face detector from the face_recognition library
(backed by dlib) for accurate face location detection.
Optionally falls back to OpenCV's Haar cascade for performance mode.
"""

import cv2
import numpy as np
import face_recognition
import logging
from typing import Tuple

logger = logging.getLogger("attendai.detector")


def detect_faces(
    frame: np.ndarray,
    model: str = "hog",  # "hog" (CPU) or "cnn" (GPU/accurate)
    upsample_times: int = 1,
) -> Tuple[list, list]:
    """
    Detect all faces in a BGR frame and return their locations
    and 128-dimensional encoding vectors.

    Args:
        frame:          BGR image as a NumPy array (from OpenCV)
        model:          Detection model — 'hog' for speed, 'cnn' for accuracy
        upsample_times: Number of times to upsample the image for detecting smaller faces

    Returns:
        face_locations: List of (top, right, bottom, left) tuples
        face_encodings: List of 128-dim numpy arrays
    """
    # Convert BGR (OpenCV) to RGB (face_recognition expects RGB)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # ── Resize for faster processing while maintaining aspect ratio ─────────────
    max_width = 800
    height, width = rgb_frame.shape[:2]
    if width > max_width:
        scale = max_width / width
        new_size = (max_width, int(height * scale))
        rgb_frame = cv2.resize(rgb_frame, new_size)
        scale_factor = width / max_width
    else:
        scale_factor = 1.0

    # ── Detect face locations ────────────────────────────────────────────────────
    face_locations = face_recognition.face_locations(
        rgb_frame,
        number_of_times_to_upsample=upsample_times,
        model=model,
    )

    # Scale locations back if we resized
    if scale_factor != 1.0:
        face_locations = [
            (
                int(top * scale_factor),
                int(right * scale_factor),
                int(bottom * scale_factor),
                int(left * scale_factor),
            )
            for top, right, bottom, left in face_locations
        ]

    if not face_locations:
        return [], []

    # ── Encode detected faces ────────────────────────────────────────────────────
    # Re-encode on the original-size image for better accuracy
    original_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_encodings = face_recognition.face_encodings(
        original_rgb,
        known_face_locations=face_locations,
        num_jitters=1,  # 1 = fast, higher = more accurate but slower
    )

    logger.debug(f"Detected {len(face_locations)} faces, encoded {len(face_encodings)}")
    return face_locations, face_encodings


def draw_detections(
    frame: np.ndarray,
    face_locations: list,
    labels: list[str] | None = None,
) -> np.ndarray:
    """
    Draw bounding boxes and labels on the frame (for debugging/visualization).
    Returns the annotated frame.
    """
    annotated = frame.copy()
    for i, (top, right, bottom, left) in enumerate(face_locations):
        # Green box for recognized, red for unknown
        color = (0, 255, 0) if (labels and labels[i] != "Unknown") else (0, 0, 255)
        cv2.rectangle(annotated, (left, top), (right, bottom), color, 2)

        label = labels[i] if labels else ""
        if label:
            cv2.rectangle(annotated, (left, bottom - 25), (right, bottom), color, cv2.FILLED)
            cv2.putText(
                annotated, label,
                (left + 6, bottom - 6),
                cv2.FONT_HERSHEY_DUPLEX,
                0.5, (255, 255, 255), 1,
            )

    return annotated
