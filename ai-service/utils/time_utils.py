"""
Time Utility Module

Handles time-based operations for class scheduling
and automatic monitoring activation.
"""

from datetime import datetime, timedelta
from typing import Optional
import asyncio
import logging

logger = logging.getLogger("attendai.time_utils")


def parse_datetime(dt_string: str) -> Optional[datetime]:
    """
    Parse datetime string to datetime object.
    
    Supports formats:
    - ISO 8601: "2024-03-11T09:00:00Z"
    - ISO with timezone: "2024-03-11T09:00:00+00:00"
    - Datetime objects (returns as-is)
    - Naive datetime strings without timezone
    """
    # If already a datetime object, return it
    if isinstance(dt_string, datetime):
        return dt_string
    
    # If None or empty, return None
    if not dt_string:
        return None
    
    try:
        # Try parsing ISO format with Z
        if dt_string.endswith('Z'):
            return datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
        # Try parsing ISO format
        else:
            return datetime.fromisoformat(dt_string)
    except ValueError:
        logger.error(f"Failed to parse datetime: {dt_string}")
        return None


def get_current_time() -> datetime:
    """Get current UTC time."""
    return datetime.utcnow()


def calculate_wait_time(start_time: datetime) -> float:
    """
    Calculate seconds to wait until start time.
    
    Args:
        start_time: Target datetime to wait for
    
    Returns:
        Seconds to wait (0 if start time has passed)
    """
    current_time = get_current_time()
    
    if start_time <= current_time:
        return 0
    
    wait_seconds = (start_time - current_time).total_seconds()
    return wait_seconds


async def wait_until_start_time(start_time: datetime, class_id: str = ""):
    """
    Async wait until the specified start time.
    
    Args:
        start_time: Target datetime to wait for
        class_id: Optional class ID for logging
    
    This function will:
    1. Calculate wait time
    2. Log waiting status
    3. Sleep until start time
    4. Return when ready to start
    """
    wait_seconds = calculate_wait_time(start_time)
    
    if wait_seconds <= 0:
        logger.info(f"Class {class_id} start time has already passed. Starting immediately.")
        return
    
    wait_minutes = wait_seconds / 60
    
    if wait_minutes < 1:
        logger.info(f"⏳ Class {class_id} starts in {wait_seconds:.0f} seconds...")
    else:
        logger.info(f"⏳ Class {class_id} starts in {wait_minutes:.1f} minutes...")
    
    # Sleep in chunks to allow for cancellation if needed
    while wait_seconds > 0:
        sleep_duration = min(wait_seconds, 60)  # Sleep max 60 seconds at a time
        await asyncio.sleep(sleep_duration)
        wait_seconds -= sleep_duration
        
        if wait_seconds > 60:
            remaining_minutes = wait_seconds / 60
            logger.debug(f"⏳ {remaining_minutes:.1f} minutes until class start...")
    
    logger.info(f"🚀 Class {class_id} starting NOW!")


def is_within_class_time(start_time: datetime, end_time: datetime) -> bool:
    """
    Check if current time is within class period.
    
    Args:
        start_time: Class start datetime
        end_time: Class end datetime
    
    Returns:
        True if current time is between start and end time
    """
    current_time = get_current_time()
    return start_time <= current_time <= end_time


def get_time_until_end(end_time: datetime) -> float:
    """
    Calculate seconds remaining until class ends.
    
    Returns:
        Seconds until end time (0 if already ended)
    """
    current_time = get_current_time()
    
    if end_time <= current_time:
        return 0
    
    remaining_seconds = (end_time - current_time).total_seconds()
    return remaining_seconds


def format_time_remaining(seconds: float) -> str:
    """
    Format seconds into human-readable time string.
    
    Examples:
        45 seconds -> "45 seconds"
        90 seconds -> "1 minute 30 seconds"
        3600 seconds -> "1 hour"
    """
    if seconds <= 0:
        return "ended"
    
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    parts = []
    if hours > 0:
        parts.append(f"{hours} hour{'s' if hours > 1 else ''}")
    if minutes > 0:
        parts.append(f"{minutes} minute{'s' if minutes > 1 else ''}")
    if secs > 0 and hours == 0:  # Only show seconds if less than 1 hour
        parts.append(f"{secs} second{'s' if secs > 1 else ''}")
    
    return " ".join(parts)


def extend_end_time(end_time: datetime, extra_minutes: int = 10) -> datetime:
    """
    Extend class end time to allow for late arrivals.
    
    Args:
        end_time: Original class end time
        extra_minutes: Minutes to add (default: 10)
    
    Returns:
        Extended end time
    """
    return end_time + timedelta(minutes=extra_minutes)


class ClassTimer:
    """
    Timer utility for managing class duration and monitoring.
    """
    
    def __init__(self, start_time: datetime, end_time: datetime, class_id: str = ""):
        self.start_time = start_time
        self.end_time = end_time
        self.class_id = class_id
        self.monitoring_started = False
    
    async def wait_for_start(self):
        """Wait until class start time."""
        await wait_until_start_time(self.start_time, self.class_id)
        self.monitoring_started = True
    
    def is_active(self) -> bool:
        """Check if class is currently active."""
        return is_within_class_time(self.start_time, self.end_time)
    
    def has_ended(self) -> bool:
        """Check if class has ended."""
        return get_current_time() > self.end_time
    
    def time_remaining(self) -> float:
        """Get seconds remaining in class."""
        return get_time_until_end(self.end_time)
    
    def time_remaining_formatted(self) -> str:
        """Get formatted time remaining."""
        return format_time_remaining(self.time_remaining())
    
    def get_status(self) -> str:
        """
        Get current status of the class.
        
        Returns:
            'waiting', 'active', or 'ended'
        """
        current_time = get_current_time()
        
        if current_time < self.start_time:
            return 'waiting'
        elif current_time >= self.start_time and current_time <= self.end_time:
            return 'active'
        else:
            return 'ended'
