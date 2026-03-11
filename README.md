# AttendAI — AI Smart Classroom Attendance System

> **🎉 NEW: AI Attendance Monitoring System Now Available!**
> 
> Complete automated attendance tracking with webcam (development) and RTSP camera (production) support.
> See [SETUP_GUIDE.md](SETUP_GUIDE.md) and [AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md) for full documentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)
- Webcam (for development mode testing)

### 1. Configure Environment Variables

**Frontend** - Edit `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

**Backend (AI Service)** - Create `ai-service/.env`:
```bash
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=test
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd ai-service
pip install -r requirements.txt
```

**Note for macOS users:** Install cmake first:
```bash
brew install cmake
```

### 3. Start the System

**Terminal 1 - AI Service:**
```bash
cd ai-service
python main.py
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- AI Service: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎯 Features

### ✅ Phase 1: Student Enrollment (Completed)
- Student image upload via admin panel
- Face embedding generation (128-dimensional vectors)
- Cloudinary integration for image storage
- MongoDB storage for embeddings

### ✅ Phase 2: AI Attendance Monitoring (Completed)
- **Dual-mode operation:**
  - **Development**: Webcam-based monitoring for testing
  - **Production**: RTSP CCTV camera integration
- **Automatic class detection:**
  - AI service waits until class start time
  - Camera activates automatically
  - Monitoring stops at class end time
- **Real-time face recognition:**
  - 3-second detection intervals
  - Face matching against stored embeddings
  - Duplicate prevention
  - Class enrollment verification
- **Live statistics dashboard:**
  - Students present count
  - Attendance rate percentage
  - Total detections/recognitions
  - Auto-refreshes every 5 seconds
- **RESTful API:**
  - Start/stop monitoring endpoints
  - Attendance query endpoints
  - Real-time status endpoints

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       ATTENDAI PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   Next.js        │◄────────┤  Python AI       │            │
│  │   Frontend       │  API    │  Service v2.0    │            │
│  │  Port 3000       │         │  Port 8000       │            │
│  └──────────────────┘         └──────────────────┘            │
│         │                              │                       │
│         ├─ Admin Camera Page           ├─ Camera Service      │
│         ├─ Faculty Dashboard           ├─ Face Detection      │
│         ├─ Student Dashboard           ├─ Face Recognition    │
│         └─ Class Management            └─ Attendance Service   │
│                                                                 │
│                     ┌──────────────────┐                       │
│                     │   MongoDB        │                       │
│                     ├─ students        │                       │
│                     ├─ classes         │                       │
│                     ├─ attendances     │                       │
│                     └─ faculty         │                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow (Monitoring)

```
1. Admin Opens Camera Page → /admin/camera
2. Selects Class → Clicks "Start Monitoring"
3. Frontend → POST /monitor/start → AI Service
4. AI Service → Load class data from MongoDB
5. AI Service → Wait until class.startTime
6. Camera Activates → cv2.VideoCapture(0) or RTSP
7. Detection Loop:
   ├─ Capture Frame (every 3 seconds)
   ├─ Detect Faces → OpenCV
   ├─ Generate Encodings → face_recognition
   ├─ Match Against Embeddings → Compare with stored data
   ├─ Verify Student in Class
   ├─ Check Not Already Recorded
   └─ Create Attendance Record → MongoDB
8. Loop Continues → Until class.endTime
9. Monitoring Stops → Automatic cleanup
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| UI Components | ShadCN UI, Tailwind CSS |
| Authentication | Clerk (RBAC) |
| Database | MongoDB Atlas, Mongoose (Next.js), Motor (Python async) |
| AI Service | Python 3.8+, FastAPI, Uvicorn |
| Computer Vision | OpenCV, face_recognition (dlib) |
| Camera Integration | cv2.VideoCapture (webcam + RTSP) |
| Image Storage | Cloudinary |

---

## 📁 Project Structure

```
AttendAI/
├── src/                          # Next.js frontend
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/        # Admin overview
│   │   │   └── camera/           # 🆕 Camera monitoring page
│   │   ├── faculty/
│   │   │   ├── dashboard/
│   │   │   ├── create-class/
│   │   │   └── live-class/
│   │   ├── student/
│   │   │   └── dashboard/
│   │   └── api/
│   │       ├── attendance/       # Attendance routes
│   │       ├── classes/          # Class management
│   │       └── students/         # Student management
│   ├── components/ui/            # ShadCN components
│   ├── lib/                      # Utilities
│   └── models/                   # MongoDB schemas
│
├── ai-service/                   # Python AI service
│   ├── main.py                   # FastAPI app (v2.0.0)
│   ├── routes/                   # 🆕 API endpoints
│   │   ├── monitor.py            # Monitoring control
│   │   └── attendance.py         # Attendance queries
│   ├── services/                 # 🆕 Business logic
│   │   ├── camera_service.py     # Webcam + RTSP
│   │   ├── face_detection_service.py
│   │   ├── face_recognition_service.py
│   │   └── attendance_service.py # Core orchestration
│   ├── utils/                    # 🆕 Utilities
│   │   ├── database.py           # MongoDB operations
│   │   └── time_utils.py         # Class timing
│   └── [original files]
│       ├── embeddings.py
│       ├── face_detector.py
│       └── recognition.py
│
├── SETUP_GUIDE.md                # 🆕 Step-by-step setup
├── AI_MONITORING_GUIDE.md        # 🆕 Complete documentation
└── README.md                     # This file
```

---

## 👥 User Roles

| Role | Access | Features |
|------|--------|----------|
| `admin` | Full system access | User management, camera monitoring, all dashboards |
| `faculty` | Teaching tools | Create classes, start monitoring, view attendance |
| `student` | Personal data | View own attendance history, class schedule |

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete installation and testing guide
- **[AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md)** - Monitoring system documentation, API reference, troubleshooting
- **API Docs** - http://localhost:8000/docs (interactive Swagger UI)

---

## 🧪 Quick Test

1. **Start both services** (AI + Next.js)
2. **Navigate to camera page**: http://localhost:3000/admin/camera
3. **Select a test class** (ensure it has students with face embeddings)
4. **Click "Start Monitoring"**
5. **Position yourself** in front of webcam
6. **Watch live stats** update as you're recognized

**Expected Behavior:**
- System waits until class start time
- Webcam activates automatically
- Face detected and recognized
- Attendance recorded in MongoDB
- Stats update every 5 seconds

---

## 🚀 Production Deployment

### RTSP Camera Integration

```bash
curl -X POST http://localhost:8000/monitor/start \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "YOUR_CLASS_ID",
    "mode": "production",
    "rtspUrl": "rtsp://192.168.1.100:554/stream"
  }'
```

See [AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md) for:
- Production mode setup
- RTSP camera configuration
- Automatic monitoring scheduler
- Performance optimization
- Security best practices

---

## 🔧 API Endpoints

### Monitoring
- `POST /monitor/start` - Start monitoring session
- `POST /monitor/stop` - Stop monitoring session
- `GET /monitor/status/{classId}` - Get real-time stats
- `GET /monitor/active` - List active sessions

### Attendance
- `GET /attendance/class/{classId}` - Get attendance records
- `GET /attendance/class/{classId}/stats` - Get statistics
- `POST /attendance/manual` - Manual attendance override

### Health
- `GET /health` - Service health check
- `GET /docs` - Interactive API documentation

---

## 🎓 Workflow

### Development Mode (Manual Testing)

1. **Admin creates class** with course details and enrolled students
2. **Admin opens camera page** at `/admin/camera`
3. **Selects class** from dropdown
4. **Clicks "Start Monitoring"**
5. **AI service waits** until class `startTime`
6. **Webcam activates** automatically
7. **Detection loop begins** (every 3 seconds):
   - Capture frame
   - Detect faces
   - Generate encodings
   - Match against student embeddings
   - Verify student enrollment
   - Record attendance (if not already recorded)
8. **Live stats update** on admin page (every 5 seconds)
9. **Monitoring stops** automatically at `endTime` or manually

### Production Mode (Automatic)

1. **System scheduler** queries MongoDB for active classes
2. **Automatically calls** `POST /monitor/start` with RTSP URL
3. **Connects to CCTV camera** in classroom
4. **Same detection/recognition** workflow
5. **No manual intervention** required
6. **Attendance recorded** automatically

---

## ⚡ Performance

- **Detection Interval**: 3 seconds (configurable)
- **Recognition Tolerance**: 0.55 (0.5 = strict, 0.6 = default)
- **Frame Resolution**: 640x480 (configurable)
- **Detection Model**: HOG (CPU) or CNN (GPU)
- **Concurrent Classes**: Multiple cameras supported via singleton manager

---

## 🛡️ Security

- **Authentication**: Clerk-based role-based access control (RBAC)
- **Privacy**: Only face embeddings stored, not actual images
- **API Security**: Protected endpoints require authentication (future enhancement)
- **RTSP Security**: Support for authenticated RTSP streams
- **Database**: MongoDB Atlas with encryption at rest

---

## 🐛 Troubleshooting

### Webcam not detected
```bash
# macOS: Grant camera permissions
System Preferences → Security & Privacy → Camera

# Linux: Install v4l-utils
sudo apt-get install v4l-utils
```

### No face detected
- Improve lighting conditions
- Position camera at eye level
- Move closer to camera (1-3 feet optimal)
- Try CNN model for better accuracy (requires GPU)

### Student not recognized
- Check face embedding exists in database
- Verify student enrolled in class
- Adjust recognition tolerance (increase for more lenient matching)
- Upload multiple photos from different angles

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting steps.

---

## 📊 Future Enhancements

- [ ] Real-time video streaming to frontend
- [ ] Face bounding box visualization
- [ ] Confidence score display per student
- [ ] Late arrival tracking
- [ ] Attendance reports (PDF/CSV export)
- [ ] Email notifications for absent students
- [ ] Mobile app for admin control
- [ ] Docker containerization
- [ ] Redis caching for embeddings
- [ ] Prometheus metrics and monitoring

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for modern classrooms**
