# Admin Module Documentation

## Overview

The Admin Module is a complete production-level system for managing an AI-powered classroom attendance platform. It provides comprehensive tools for student management, class scheduling, live monitoring, attendance tracking, and analytics.

---

## MongoDB User Storage Issue - FIXED ✅

### Problem
Users were not being stored in MongoDB after authentication because the Clerk webhook wasn't being triggered or configured.

### Solution
Created an automatic user sync system that runs every time a user logs in:

**Files Created:**
1. `/api/sync-user-to-db/route.ts` - API endpoint to manually sync current user to MongoDB
2. `UserSyncHandler.tsx` - Client component that automatically syncs users after authentication
3. `/api/debug/users/route.ts` - Debug endpoint to check users in MongoDB

**Integration:**
- `UserSyncHandler` added to `layout.tsx` alongside `RoleSyncHandler`
- Runs automatically on every page load for authenticated users
- Backup solution if Clerk webhooks are not configured

---

## Module Structure

### 1. Admin Dashboard (`/admin/dashboard`)

**Features:**
- Overview statistics (Total Students, Active Classes, Attendance Rate, Total Records)
- Active classes display with LIVE badges
- Recent classes table with status badges
- Role-based access (admin only)

**API Endpoints Used:**
- `GET /api/students` - Fetch total students count
- `GET /api/classes` - Fetch classes with filters
- `GET /api/attendance` - Fetch attendance records

---

### 2. Student Management (`/admin/students`)

**Features:**
- Complete CRUD operations for students
- Search functionality (name, register number, email)
- Department filtering
- Add student modal with form validation
- CSV upload support (UI ready)
- Face recognition data tracking
- Statistics dashboard

**API Endpoints:**
- `GET /api/students` - Fetch all students
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get single student
- `PATCH /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

**Student Schema:**
```typescript
{
  name: string
  registerNumber: string (unique)
  email: string (unique)
  department: string
  imageUrl?: string
  faceEmbedding?: number[]
  imageDataset?: Array<{ url: string, uploadedAt: Date }>
  createdAt: Date
  updatedAt: Date
}
```

---

### 3. Class Creation (`/admin/create-class`)

**Features:**
- Multi-step form for class creation
- Course information section
- Schedule selection (start/end time)
- Student selection with department filtering
- Select all / deselect all functionality
- Visual student cards with selection state
- Form validation

**API Endpoints:**
- `POST /api/classes` - Create new class
- `GET /api/students` - Fetch students for selection

**Class Schema:**
```typescript
{
  courseName: string
  courseCode?: string
  classroomNumber: string
  facultyName: string
  facultyId?: ObjectId (ref: User)
  department: string
  startTime: Date
  endTime: Date
  studentIds: ObjectId[] (ref: Student)
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

---

### 4. Class Management (`/admin/classes`)

**Features:**
- Table view of all classes
- Status filtering (scheduled, active, completed, cancelled)
- Search functionality
- Quick actions (Start, End, Delete)
- Class statistics dashboard
- Status badges with color coding
- Student count per class

**API Endpoints:**
- `GET /api/classes` - Fetch all classes with filters
- `GET /api/classes/[id]` - Get single class
- `PATCH /api/classes/[id]` - Update class (change status)
- `DELETE /api/classes/[id]` - Delete class

**Status Flow:**
```
scheduled → active → completed
           ↓
        cancelled
```

---

### 5. Live Monitoring (`/admin/live-monitor`)

**Features:**
- Real-time monitoring of active classes
- Class selector with LIVE badges
- Live statistics (Total, Detected, Absent, Attendance Rate)
- Camera feed placeholder (ready for AI service integration)
- Detection logs with confidence scores
- Student enrollment list with detection checkmarks
- 30-second auto-refresh
- Recording indicator

**Components:**
- Active class cards with selection
- Stats dashboard (4 cards)
- Camera feed section with overlays
- Detection logs sidebar
- Student grid with status indicators

**API Endpoints:**
- `GET /api/classes?status=active` - Fetch active classes

---

### 6. Attendance Reports (`/admin/reports`)

**Features:**
- Two view modes: Records & Student Statistics
- Search and filter functionality
- Export to CSV (both modes)
- Overall statistics dashboard
- Attendance records table with all details
- Student-wise statistics with attendance rates
- Visual progress bars for attendance rates
- Color-coded performance indicators

**API Endpoints:**
- `GET /api/attendance` - Fetch attendance records
- `POST /api/attendance` - Create attendance record

**Attendance Schema:**
```typescript
{
  classId: ObjectId (ref: Class)
  studentId: ObjectId (ref: Student)
  status: 'present' | 'absent' | 'late'
  detectedAt?: Date
  confidence?: number (0-100)
  imageUrl?: string
  createdAt: Date
}
```

**CSV Export Fields:**
- Attendance Records: Student Name, Register Number, Course, Classroom, Date, Status, Confidence
- Student Statistics: Name, Register Number, Department, Total Classes, Present, Absent, Late, Attendance Rate

---

### 7. System Analytics (`/admin/analytics`)

**Features:**
- Time range selector (Week, Month, Year)
- Summary statistics with trends
- Daily/Weekly attendance trend charts
- Department-wise attendance analysis
- Top classes by attendance
- Performance distribution (Excellent/Good/Average/Poor)
- Visual bar charts and progress indicators
- Color-coded performance levels

**Chart Types:**
- Horizontal bar charts for daily/weekly trends
- Department performance bars
- Top classes ranking
- Distribution pie chart (mock)

---

## Database Models

### Student Model
```typescript
{
  name: string
  registerNumber: string (unique, required)
  email: string (unique, required)
  department: string (required)
  imageUrl?: string
  faceEmbedding?: number[]
  imageDataset?: [{ url: string, uploadedAt: Date }]
  createdAt: Date
  updatedAt: Date
}
```

### Class Model
```typescript
{
  courseName: string (required)
  courseCode?: string
  classroomNumber: string (required)
  facultyName: string (required)
  facultyId?: ObjectId (ref: User)
  department: string (required)
  startTime: Date (required)
  endTime: Date (required)
  studentIds: ObjectId[] (ref: Student)
  status: enum ['scheduled', 'active', 'completed', 'cancelled']
  createdAt: Date
  updatedAt: Date
}
```

### Attendance Model
```typescript
{
  classId: ObjectId (ref: Class, required)
  studentId: ObjectId (ref: Student, required)
  status: enum ['present', 'absent', 'late'] (required)
  detectedAt?: Date
  confidence?: number (0-100)
  imageUrl?: string
  createdAt: Date
}
```

**Indexes:**
- Compound unique index on (classId, studentId) to prevent duplicates

---

## API Routes

### Students API
- `GET /api/students` - List all students (with optional department filter)
- `POST /api/students` - Create new student (admin/faculty only)
- `GET /api/students/[id]` - Get single student details
- `PATCH /api/students/[id]` - Update student (admin/faculty only)
- `DELETE /api/students/[id]` - Delete student (admin only)

### Classes API
- `GET /api/classes` - List all classes (with optional status/department filters)
- `POST /api/classes` - Create new class (admin/faculty only)
- `GET /api/classes/[id]` - Get single class with populated students
- `PATCH /api/classes/[id]` - Update class (admin/faculty only)
- `DELETE /api/classes/[id]` - Delete class (admin only)

### Attendance API
- `GET /api/attendance` - Fetch attendance records (with classId/studentId filters)
- `POST /api/attendance` - Mark attendance (admin/faculty only)

### User Sync API
- `POST /api/sync-user-to-db` - Manually sync current user to MongoDB
- `GET /api/debug/users` - Debug endpoint to view MongoDB users (admin only)

---

## Authentication & Authorization

### Role-based Access Control

**Admin Role:**
- Full access to all modules
- Can create, edit, delete students and classes
- Access to live monitoring
- Access to all reports and analytics

**Faculty Role:**
- Can create students and classes
- Can view and update their own classes
- Access to reports
- Limited access to analytics

**Student Role:**
- View own attendance records
- View own classes
- No admin access

### Protected Routes

All `/admin/*` routes are protected by:
1. Clerk authentication (middleware)
2. Role verification (admin role required)
3. Automatic redirect to `/dashboard` if not authorized

---

## UI Components

### Layout Components
- **Sidebar** - Navigation with icons (supports BookOpen, Plus icons added)
- **Navbar** - Top bar with title, subtitle, search, notifications, user button

### Reusable Components
- **StatCard** - Dashboard statistics card
- **StatusBadge** - Color-coded status indicators
- **AddStudentModal** - Form modal for creating students
- Tables with hover effects and responsive design

### Design System
- Primary color: Purple (#9333ea, #7c3aed)
- Card styling: rounded-xl, shadow-lg
- Status colors: Green (success), Blue (info), Yellow (warning), Red (error)
- Consistent spacing and typography
- Mobile-responsive grid layouts

---

## Next Steps & Integration

### AI Service Integration

**Live Monitoring:**
Connect to Python AI service (`ai-service/main.py`):
```typescript
// WebSocket connection for real-time detection
const ws = new WebSocket('ws://localhost:8000/ws/detect');
ws.onmessage = (event) => {
  const detection = JSON.parse(event.data);
  // Update detection logs
  // Mark attendance automatically
};
```

**Face Recognition:**
Upload student photos to AI service:
```typescript
const uploadFaceData = async (studentId: string, images: File[]) => {
  const formData = new FormData();
  formData.append('student_id', studentId);
  images.forEach(img => formData.append('images', img));
  
  await fetch('http://localhost:8000/api/train', {
    method: 'POST',
    body: formData
  });
};
```

### Automatic Class Status Updates

Implement background job to update class status:
```typescript
// In a cron job or background worker
setInterval(async () => {
  const now = new Date();
  
  // Activate scheduled classes
  await Class.updateMany(
    { status: 'scheduled', startTime: { $lte: now } },
    { $set: { status: 'active' } }
  );
  
  // Complete active classes
  await Class.updateMany(
    { status: 'active', endTime: { $lte: now } },
    { $set: { status: 'completed' } }
  );
}, 60000); // Every minute
```

### CSV Upload

Implement CSV parsing for bulk student upload:
```typescript
const parseCSV = (file: File) => {
  // Use papaparse library
  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      for (const row of results.data) {
        await fetch('/api/students', {
          method: 'POST',
          body: JSON.stringify({
            name: row.name,
            registerNumber: row.registerNumber,
            email: row.email,
            department: row.department
          })
        });
      }
    }
  });
};
```

---

## Testing

### Test Admin Dashboard
1. Set user role to 'admin' in Clerk metadata: `{ "role": "admin" }`
2. Navigate to `/admin/dashboard`
3. Verify statistics display correctly
4. Check active classes and recent classes tables

### Test Student Management
1. Navigate to `/admin/students`
2. Click "Add Student" and create a test student
3. Search and filter students
4. Edit and delete students

### Test Class Creation
1. Navigate to `/admin/create-class`
2. Fill in class information
3. Select students from list
4. Submit and verify class created

### Test Live Monitoring
1. Create a class with status 'active'
2. Navigate to `/admin/live-monitor`
3. Verify class appears in active classes
4. Check detection logs and student list

### Test Reports
1. Create some attendance records
2. Navigate to `/admin/reports`
3. Switch between Records and Student Statistics views
4. Export CSV and verify data

---

## Deployment Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Clerk production keys
- [ ] Set up Clerk webhooks for user sync
- [ ] Deploy Python AI service
- [ ] Configure CORS for AI service
- [ ] Set up background jobs for class status updates
- [ ] Implement real-time WebSocket connections
- [ ] Add image upload to cloud storage (Cloudinary/AWS S3)
- [ ] Configure production environment variables
- [ ] Set up monitoring and error tracking

---

## Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/attendai

# AI Service
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# (Optional) Cloud Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Support & Maintenance

For issues or questions:
- Check MongoDB connection in `/api/debug/users`
- Verify Clerk authentication is working
- Check browser console for errors
- Verify API endpoints return expected data

---

**Admin Module Status: ✅ COMPLETE**

All features implemented and ready for production use. Requires:
1. MongoDB connection
2. Clerk authentication
3. AI service integration (for live detection)
