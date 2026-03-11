# Faculty Module - AI Smart Classroom Attendance System

## Overview

The Faculty Module enables automatic attendance tracking using AI-powered face recognition. Faculty members can view their class schedules, and the system automatically activates camera monitoring when class start time arrives.

## Features

### 1. Faculty Dashboard (`/faculty/dashboard`)
- View all assigned classes
- Real-time class status (scheduled, active, completed)
- Automatic refresh every 30 seconds
- Filter classes by status
- Quick stats overview

### 2. Class Details Page (`/faculty/class/[id]`)
- Complete class information
- Enrolled student list
- Classroom location with Google Maps integration
- Auto-redirect to monitoring when class becomes active

### 3. Automatic Class Activation
- Background service checks time every 30 seconds
- Automatically updates class status when start time arrives
- No manual intervention required
- Browser notifications for activated classes

### 4. Live Monitoring (`/faculty/class/[id]/monitor`)
- Automatic camera activation
- Real-time face detection every 5 seconds
- Live attendance tracking
- Detection history
- Attendance statistics

### 5. AI-Powered Attendance
- Face detection using OpenCV
- Face recognition using face_recognition library
- Automatic attendance marking
- Duplicate prevention
- Confidence scoring

## Architecture

### Frontend (Next.js)
```
/faculty/dashboard          - Main dashboard
/faculty/class/[id]         - Class details
/faculty/class/[id]/monitor - Live monitoring
```

### API Routes
```
/api/faculty/classes           - Get faculty classes
/api/faculty/classes/[id]      - Get class details
/api/classes/auto-activate     - Activate scheduled classes
/api/detect-faces              - Face detection service
/api/attendance/mark           - Mark attendance
```

### Backend Services
- **ClassActivationService**: Continuous time checking
- **Camera Monitoring**: WebRTC camera access
- **Frame Capture**: Canvas-based image capture
- **Python FastAPI**: Face detection and recognition

## Setup

### 1. Environment Variables

Add to `.env.local`:
```env
PYTHON_SERVICE_URL=http://localhost:8000
```

### 2. Python Service

Install dependencies:
```bash
cd ai-service
pip install -r requirements.txt
```

Start the service:
```bash
python main.py
```

The service will run on `http://localhost:8000`

### 3. Database Schema Updates

The following models have been updated:

**Class Model:**
- Added `section` field
- Added `classroomLocation` with latitude/longitude

**Attendance Model:**
- Added `detectedTime` field
- Added `confidence` field
- Added `method` field (face_recognition, manual, qr_code)

## Usage Flow

### For Faculty

1. **Login** with faculty credentials
2. **Navigate** to Faculty Dashboard
3. **View** scheduled classes
4. **Wait** for automatic class activation at start time
5. **Auto-redirect** to monitoring page
6. **Click** "Start Monitoring" to activate camera
7. **System** automatically detects and marks attendance
8. **View** real-time attendance records

### Automatic Process

```
Current Time >= Start Time
    ↓
Class Status = "active"
    ↓
Auto-redirect to monitoring
    ↓
Camera activates
    ↓
Frame capture every 5 seconds
    ↓
Send to Python service
    ↓
Face detection & recognition
    ↓
Mark attendance (prevent duplicates)
    ↓
Update UI with new records
    ↓
Show notification
```

## API Integration

### Detect Faces

```typescript
const formData = new FormData();
formData.append('image', blob, 'frame.jpg');
formData.append('classId', classId);

const response = await fetch('/api/detect-faces', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.detectedStudents contains matched students
```

### Mark Attendance

```typescript
const response = await fetch('/api/attendance/mark', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    classId,
    students: [{
      studentId,
      detectedTime,
      confidence,
    }],
  }),
});
```

## Security Features

1. **Authentication**: Clerk-based authentication required
2. **Role-based Access**: Faculty and Admin only
3. **Class Enrollment**: Only enrolled students marked present
4. **Duplicate Prevention**: Unique index on (classId, studentId)
5. **Confidence Threshold**: Configurable in Python service

## Browser Permissions

Required permissions:
- Camera access (`navigator.mediaDevices.getUserMedia()`)
- Notifications (optional, for alerts)

## Performance Optimization

1. **Frame Capture**: 5-second intervals to reduce server load
2. **Auto-refresh**: 30-second polling for class activation
3. **Efficient Queries**: MongoDB indexes on classId and studentId
4. **Canvas Compression**: JPEG quality at 0.8
5. **Background Service**: Single interval for all classes

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Try different browser

### Python Service Not Available
- Verify service is running on port 8000
- Check PYTHON_SERVICE_URL in .env.local
- Development mode uses mock data

### No Faces Detected
- Ensure good lighting
- Position face clearly in frame
- Check camera quality

### Attendance Not Marking
- Verify student is enrolled in class
- Check class status is "active"
- Review confidence threshold

## Development Notes

### Testing Without Python Service

In development mode, if Python service is unavailable, the system returns mock detection data. Remove this in production:

```typescript
if (process.env.NODE_ENV === 'development') {
  // Mock data for testing
}
```

### Adding Student Face Encodings

Use the Python service to register student faces:

```bash
curl -X POST http://localhost:8000/register-student \
  -F "student_id=student123" \
  -F "file=@student_photo.jpg"
```

## Future Enhancements

1. **Mobile App**: React Native for mobile monitoring
2. **Batch Upload**: Register multiple students at once
3. **Attendance Reports**: Export to PDF/Excel
4. **Analytics Dashboard**: Attendance trends and insights
5. **QR Code Backup**: Alternative attendance method
6. **Geofencing**: Location-based class activation
7. **WebSocket**: Real-time updates without polling
8. **Cloud Storage**: Store face encodings in cloud database

## Support

For issues or questions, contact the development team or create an issue in the repository.
