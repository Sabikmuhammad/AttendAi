# 🚀 Quick Setup Guide - AI Attendance Monitoring System

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (local or MongoDB Atlas)
- **Webcam** (for development mode testing)

---

## 🔧 Installation Steps

### 1. Install Frontend Dependencies

```bash
npm install
```

This installs all Next.js dependencies including:
- React, Next.js
- ShadCN UI components
- Clerk authentication
- Mongoose for MongoDB
- All other dependencies from package.json

### 2. Install Python Dependencies

**Important for macOS users - Use Virtual Environment:**

macOS requires using a virtual environment for Python packages. Here's the complete setup:

```bash
cd ai-service

# Install cmake (required for dlib/face_recognition)
brew install cmake

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Your prompt should now show (venv) at the start

# Install requirements
pip install -r requirements.txt
```

**For Linux/Windows users:**
```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- OpenCV (computer vision)
- face_recognition (face detection/recognition)
- Motor (async MongoDB driver)
- NumPy (numerical operations)
- python-dotenv (environment variables)

**Note:** Installing `face_recognition` may take 5-10 minutes as it compiles dlib from source.

### 3. Configure Environment Variables

#### Backend (.env in ai-service/)

Create `ai-service/.env`:

```bash
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

# Database Name (optional, defaults to 'test')
DATABASE_NAME=test
```

**Get your MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

#### Frontend (.env.local in root/)

Create `.env.local` (if not exists):

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

# Clerk Authentication (you should already have this)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Service URL (optional, defaults to http://localhost:8000)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

### 4. Verify MongoDB Connection

**Option A: Test via Python**

```bash
cd ai-service
python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test():
    client = AsyncIOMotorClient('YOUR_MONGODB_URI')
    db = client.test
    result = await db.command('ping')
    print('✅ MongoDB connected!' if result.get('ok') else '❌ Connection failed')
    client.close()

asyncio.run(test())
"
```

**Option B: Use MongoDB Compass**
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Paste your connection string
3. Verify you can see your database

---

## 🎬 Running the System

### Terminal 1: Start AI Service

```bash
cd ai-service

# Activate virtual environment (if not already activated)
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Start the service
python main.py
```

**Expected Output:**
```
🚀 AttendAI service starting...
✅ MongoDB connectedActivate virtual environment first (`source venv/bin/activate`), then r
✅ Loaded embeddings for 5 students
🎉 AttendAI service ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**If you see errors:**
- `ModuleNotFoundError`: Run `pip install -r requirements.txt`
- `MongoDB connection failed`: Check your MONGODB_URI in .env
- `No embeddings loaded`: Ensure students have face embeddings (see Phase 1)

### Terminal 2: Start Next.js Frontend

```bash
# In root directory
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## ✅ Verification Checklist

### Backend Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "AttendAI Face Recognition & Monitoring Service",
  "version": "2.0.0",
  "students_loaded": 5
}
```

### Frontend Access

Visit: http://localhost:3000/admin/camera

**You should see:**
- Class selection dropdown
- Start Monitoring button
- Status section
- Instructions panel

---

## 🧪 Quick Test (Development Mode)

### Step 1: Prepare Test Data

You need at least one class and one student with a face embedding in MongoDB.

**Required Collections Structure:**

```javascript
// students collection
{
  "_id": ObjectId("..."),
  "clerkId": "user_...",
  "name": "John Doe",
  "email": "john@example.com",
  "faceEmbedding": [0.123, -0.456, ...],  // 128 numbers (from Phase 1)
  "studentId": "ST12345",
  "createdAt": ISODate("...")
}

// classes collection
{
  "_id": ObjectId("..."),
  "courseName": "Computer Science 101",
  "classroomNumber": "A101",
  "facultyId": ObjectId("..."),
  "studentIds": [ObjectId("...")],  // Array of student ObjectIds
  "startTime": ISODate("2024-01-15T10:00:00Z"),
  "endTime": ISODate("2024-01-15T11:00:00Z"),
  "status": "scheduled"
}
```

**If you don't have face embeddings yet**, complete Phase 1 first:
- Upload student images via admin panel
- Generate face embeddings
- Verify embeddings are stored in MongoDB

### Step 2: Create a Test Class

**Set startTime to 2 minutes from now:**

```javascript
// In MongoDB Compass or CLI
db.classes.insertOne({
  courseName: "Test Class",
  classroomNumber: "Test-101",
  facultyId: ObjectId("YOUR_FACULTY_ID"),
  studentIds: [ObjectId("YOUR_STUDENT_ID")],
  startTime: new Date(Date.now() + 2 * 60 * 1000),  // 2 minutes from now
  endTime: new Date(Date.now() + 30 * 60 * 1000),   // 30 minutes from now
  status: "scheduled"
})
```

### Step 3: Start Monitoring

1. **Open Camera Page:**
   ```
   http://localhost:3000/admin/camera
   ```

2. **Select Test Class** from dropdown

3. **Click "Start Monitoring"**

4. **Expected Behavior:**
   - Status changes to "Waiting for class to start..."
   - AI service logs: `⏳ Class starts in 2.0 minutes...`
   - After 2 minutes: `🚀 Class ... starting NOW!`
   - Webcam activates automatically
   - Status changes to "Active"

5. **Position Yourself:**
   - Sit in front of webcam
   - Ensure good lighting
   - Look at camera

6. **Watch Live Stats:**
   - "Students Present" should increment
   - "Attendance Rate" should update
   - "Total Recognitions" should count up
   - Stats refresh every 5 seconds

7. **Verify Attendance Record:**
   ```bash
   curl http://localhost:8000/attendance/class/YOUR_CLASS_ID/stats
   ```

   Expected:
   ```json
   {
     "success": true,
     "classId": "...",
     "total_students": 1,
     "present": 1,
     "absent": 0,
     "attendance_rate": 100.0
   }
   ```

---

## 🐛 Common Issues & Solutions

### Issue: Webcam not detected

**macOS:**
```bash
# Grant camera permissions
System Preferences → Security & Privacy → Camera → Check Terminal/VS Code

# Test webcam
python -c "import cv2; cap = cv2.VideoCapture(0); print('✅ Webcam OK' if cap.isOpened() else '❌ No webcam'); cap.release()"
```

**Linux:**
```bash
# Install v4l-utils
sudo apt-get install v4l-utils

# List cameras
v4l2-ctl --list-devices
```

### Issue: No face detected

**Possible Causes:**
1. **Poor lighting** → Improve room lighting
2. **Camera angle** → Position camera at eye level
3. **Distance** → Move closer to camera (1-3 feet optimal)
4. **Detection model** → Try CNN model (requires GPU):
   ```python
   # In face_detection_service.py
   model="cnn"  # More accurate but slower
   ```

### Issue: Student not recognized

**Debugging Steps:**

1. **Check embedding exists:**
   ```bash
   # MongoDB query
   db.students.find({ faceEmbedding: { $exists: true } })
   ```

2. **Check student in class:**
   ```bash
   # MongoDB query
   db.classes.findOne({ _id: ObjectId("CLASS_ID") }).studentIds
   ```

3. **Lower recognition tolerance:**
   ```python
   # In face_recognition_service.py
   tolerance=0.6  # Increase from 0.55 for more lenient matching
   ```

4. **Check AI service logs:**
   ```
   👤 Detected 1 face(s)
   ✅ Recognized 1 student(s) (confidence: 78.45%)
   ⚠️ Student ... is not in this class  # Check class enrollment
   ℹ️ Attendance already recorded for student ...  # Already marked
   ```

### Issue: Python packages not found

```bash
# Verify Python version
python --version  # Should be 3.8+

# Verify pip
pip --version

# Reinstall requirements
cd ai-service
pip install --upgrade pip
pip install -r requirements.txt

# If using virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## 📊 Next Steps After Setup

### 1. Production Mode Setup

See [AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md) for:
- RTSP camera integration
- Automatic monitoring scheduler
- Production deployment

### 2. Add More Students

1. Upload student images at `/admin/upload` (from Phase 1)
2. Generate face embeddings
3. Add students to classes

### 3. Create Real Classes

1. Navigate to `/faculty/create-class`
2. Fill in course details
3. Add enrolled students
4. Set class schedule

### 4. Monitor Dashboard

View attendance analytics at:
- `/admin/dashboard` - Overall statistics
- `/faculty/dashboard` - Faculty view
- `/student/dashboard` - Student attendance history

---

## 📚 Additional Documentation

- **[AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md)** - Complete monitoring system documentation
- **[README.md](README.md)** - Project overview
- **API Documentation**: http://localhost:8000/docs (when AI service is running)

---

## 🎉 Success!

If you reached this point and:
- ✅ AI service running on port 8000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Webcam activates
- ✅ Face detected and recognized
- ✅ Attendance recorded

**Congratulations! Your AI attendance monitoring system is fully operational! 🚀**

---

## 💡 Tips

1. **Keep logs visible** - Watch AI service terminal for real-time detection logs
2. **Good lighting** - Drastically improves recognition accuracy
3. **Multiple angles** - Upload student photos from different angles (Phase 1)
4. **Test before class** - Run a test 5 minutes before actual class
5. **Backup plan** - Use manual attendance override if needed

---

For production deployment and advanced features, refer to [AI_MONITORING_GUIDE.md](AI_MONITORING_GUIDE.md).
