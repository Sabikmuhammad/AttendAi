# Admin-Faculty-Student Connection System

## Overview
This document explains the complete connection system between Admins, Faculty, and Students through the class management system.

## Database Schema

### Class Model
```javascript
{
  _id: ObjectId,
  courseName: String (required),
  courseCode: String (optional),
  section: String (optional),
  classroomNumber: String (required),
  classroomLocation: {
    latitude: Number,
    longitude: Number
  },
  facultyName: String (required),
  facultyId: ObjectId (ref: 'User', required),
  department: String (required),
  startTime: Date (required),
  endTime: Date (required),
  studentIds: [ObjectId] (ref: 'Student'),
  status: 'scheduled' | 'active' | 'completed' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

**Key Points:**
- `facultyId` references the User collection (the faculty member's user account)
- `studentIds` is an array of ObjectIds referencing the Student collection
- All classes are linked through these references

## System Architecture

### 1. Admin Role
**Capabilities:**
- Create classes
- Assign faculty to classes
- Assign students to classes
- View all classes in the system
- Manage class details

**API Endpoints:**
- `GET /api/admin/classes` - Get all classes with filters
- `POST /api/classes` - Create new class
- `PATCH /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

**Query Parameters for GET:**
- `status` - Filter by class status (scheduled, active, completed, cancelled)
- `department` - Filter by department
- `facultyId` - Filter by faculty member

### 2. Faculty Role
**Capabilities:**
- View classes assigned to them
- Monitor attendance for their classes
- Cannot create or modify class assignments

**API Endpoints:**
- `GET /api/faculty/classes` - Get classes assigned to the logged-in faculty

**How it works:**
1. Faculty member logs in via NextAuth
2. Session contains their User ID
3. API finds Faculty record using `Faculty.find({ userId: session.user.id })`
4. API queries classes using `Class.find({ facultyId: session.user.id })`
5. Returns populated classes with student details

### 3. Student Role
**Capabilities:**
- View classes they are enrolled in
- See their attendance records
- Cannot modify any class data

**API Endpoints:**
- `GET /api/student/classes` - Get classes the student is enrolled in

**How it works:**
1. Student logs in via NextAuth
2. Session contains their User ID
3. API finds Student record using `Student.findOne({ userId: session.user.id })`
4. API queries classes using `Class.find({ studentIds: student._id })`
5. Returns populated classes with faculty details

## Data Flow

### Class Creation Flow (Admin)

```
Admin Dashboard
    ↓
Create Class Page
    ↓
Select Faculty (GET /api/faculty)
    ↓
Select Students (GET /api/students)
    ↓
POST /api/classes
    ↓
{
  courseName,
  classroomNumber,
  facultyId,      ← User ID of faculty
  studentIds[],   ← Array of Student document IDs
  startTime,
  endTime,
  ...
}
    ↓
Class Created in MongoDB
    ↓
Redirect to /admin/classes
```

### Faculty Class Retrieval

```
Faculty Login
    ↓
Session Created (contains User ID + role)
    ↓
Faculty Dashboard
    ↓
GET /api/faculty/classes
    ↓
auth() → session.user.id
    ↓
Faculty.findOne({ userId: session.user.id })
    ↓
Class.find({ facultyId: session.user.id })
    .populate('studentIds')
    .populate('studentIds.userId', 'name email')
    ↓
Returns Faculty's Classes
```

### Student Class Retrieval

```
Student Login
    ↓
Session Created (contains User ID + role)
    ↓
Student Dashboard
    ↓
GET /api/student/classes
    ↓
auth() → session.user.id
    ↓
Student.findOne({ userId: session.user.id })
    ↓
Class.find({ studentIds: student._id })
    .populate('facultyId', 'name email')
    ↓
Returns Student's Classes
```

## Implementation Details

### 1. API Routes

#### GET /api/admin/classes
**Purpose:** Fetch all classes for admin dashboard with filtering

**Authentication:** Admin only (protected by middleware)

**Response:**
```json
{
  "success": true,
  "classes": [
    {
      "_id": "...",
      "courseName": "Machine Learning",
      "classroomNumber": "Room 101",
      "facultyId": {
        "_id": "...",
        "name": "Dr. John Doe",
        "email": "john@example.com"
      },
      "studentIds": [
        {
          "_id": "...",
          "studentId": "STU001",
          "userId": {
            "name": "Jane Smith",
            "email": "jane@example.com"
          }
        }
      ],
      "startTime": "2024-03-15T10:00:00Z",
      "endTime": "2024-03-15T11:30:00Z",
      "status": "scheduled"
    }
  ]
}
```

#### GET /api/faculty/classes
**Purpose:** Fetch classes assigned to logged-in faculty

**Authentication:** Faculty role required + valid session

**How it filters:**
```javascript
const session = await auth();
const classes = await Class.find({ facultyId: session.user.id })
  .populate('studentIds')
  .populate({ 
    path: 'studentIds', 
    populate: { path: 'userId', select: 'name email' } 
  });
```

**Response:** Same structure as admin classes, but filtered

#### GET /api/student/classes
**Purpose:** Fetch classes student is enrolled in

**Authentication:** Student role required + valid session

**How it filters:**
```javascript
const session = await auth();
const student = await Student.findOne({ userId: session.user.id });
const classes = await Class.find({ studentIds: student._id })
  .populate('facultyId', 'name email');
```

**Response:**
```json
{
  "success": true,
  "classes": [
    {
      "_id": "...",
      "courseName": "Data Structures",
      "classroomNumber": "Lab A",
      "facultyId": {
        "name": "Dr. Sarah Johnson",
        "email": "sarah@example.com"
      },
      "startTime": "2024-03-15T14:00:00Z",
      "endTime": "2024-03-15T15:30:00Z",
      "status": "scheduled"
    }
  ]
}
```

### 2. Frontend Components

#### Admin Create Class Page
**File:** `src/app/admin/create-class/page.tsx`

**Features:**
- Fetches all faculty from `/api/faculty`
- Fetches all students from `/api/students`
- Multi-select for students
- Single-select dropdown for faculty
- Form submission to `/api/classes`

**Key Fields:**
```tsx
const [formData, setFormData] = useState({
  courseName: '',
  classroomNumber: '',
  facultyId: '',        // Selected faculty User ID
  facultyName: '',
  department: '',
  startTime: '',
  endTime: '',
});
const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
// selectedStudents contains Student document IDs
```

#### Faculty Dashboard
**File:** `src/app/faculty/dashboard/page.tsx`

**Features:**
- Fetches classes from `/api/faculty/classes`
- Shows only classes assigned to logged-in faculty
- Displays student count per class
- Real-time status updates

**Usage:**
```tsx
const fetchClasses = async () => {
  const response = await fetch('/api/faculty/classes');
  const data = await response.json();
  if (data.success) {
    setClasses(data.classes);
  }
};
```

#### Student Dashboard
**File:** `src/app/student/dashboard/page.tsx`

**Features:**
- Uses `/api/student/stats` which internally calls student classes logic
- Shows today's classes
- Displays faculty names
- Shows class timings and locations

## Security Considerations

### Middleware Protection
**File:** `src/middleware.ts`

```typescript
// Admin routes
if (pathname.startsWith('/admin')) {
  if (token.role !== 'admin') redirect('/unauthorized');
}

// Faculty routes
if (pathname.startsWith('/faculty')) {
  if (token.role !== 'faculty' && token.role !== 'admin') redirect('/unauthorized');
}

// Student routes
if (pathname.startsWith('/student')) {
  if (token.role !== 'student' && token.role !== 'admin') redirect('/unauthorized');
}
```

### API Authentication
All role-specific API routes use NextAuth session:

```typescript
const session = await auth();
if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Data Isolation
- Faculty can ONLY see their own classes
- Students can ONLY see classes they're enrolled in
- Admins can see and manage all classes

## Common Operations

### 1. Admin Creates a Class

```javascript
// 1. Admin selects faculty and students in UI
const classData = {
  courseName: "Machine Learning",
  classroomNumber: "Room 101",
  facultyId: "user123",           // Faculty's User ID
  facultyName: "Dr. John Doe",
  department: "Computer Science",
  startTime: "2024-03-15T10:00",
  endTime: "2024-03-15T11:30",
  studentIds: [                   // Array of Student document IDs
    "student001",
    "student002",
    "student003"
  ]
};

// 2. POST to /api/classes
fetch('/api/classes', {
  method: 'POST',
  body: JSON.stringify(classData)
});

// 3. Class created in MongoDB with references
```

### 2. Faculty Views Their Classes

```javascript
// 1. Faculty logs in, session contains User ID
// 2. Dashboard calls API
const response = await fetch('/api/faculty/classes');

// 3. API finds Faculty record
const faculty = await Faculty.findOne({ userId: session.user.id });

// 4. API queries classes
const classes = await Class.find({ facultyId: session.user.id });

// 5. Classes returned with student details populated
```

### 3. Student Views Their Classes

```javascript
// 1. Student logs in, session contains User ID
// 2. Dashboard calls API
const response = await fetch('/api/student/classes');

// 3. API finds Student record
const student = await Student.findOne({ userId: session.user.id });

// 4. API queries classes where student is enrolled
const classes = await Class.find({ studentIds: student._id });

// 5. Classes returned with faculty details populated
```

## Mongoose Populate Explained

### Faculty Classes Population
```javascript
Class.find({ facultyId: userId })
  .populate('studentIds', 'studentId')  // Get Student docs
  .populate({
    path: 'studentIds',
    populate: {
      path: 'userId',                   // Nested populate
      select: 'name email'              // Get User details
    }
  });
```

**Result:**
- Each class includes full student array
- Each student includes their User info (name, email)

### Student Classes Population
```javascript
Class.find({ studentIds: studentId })
  .populate('facultyId', 'name email');  // Get faculty User info
```

**Result:**
- Each class includes faculty member's name and email

## Testing the System

### 1. Create Test Data

```javascript
// Run: node scripts/create-verified-user.js
// Creates: admin@attendai.com / admin123

// Then register students and faculty via /register
```

### 2. Test Admin Flow

```bash
1. Login as admin
2. Go to /admin/create-class
3. Select faculty from dropdown
4. Select students from list
5. Fill in class details
6. Submit form
7. Verify class appears in /admin/classes
```

### 3. Test Faculty Flow

```bash
1. Login as faculty member
2. Go to /faculty/dashboard
3. Verify only assigned classes appear
4. Check student count matches
```

### 4. Test Student Flow

```bash
1. Login as student
2. Go to /student/dashboard
3. Verify only enrolled classes appear
4. Check faculty name is displayed
```

## Troubleshooting

### Issue: Faculty sees no classes
**Cause:** Classes might be assigned to wrong facultyId
**Solution:** Check that `facultyId` in Class matches faculty member's `User._id`

### Issue: Student sees no classes
**Cause:** Student document ID not in `studentIds` array
**Solution:** Verify `studentIds` contains Student `_id` (not User `_id`)

### Issue: Population returns null
**Cause:** Referenced documents don't exist
**Solution:** Check that all IDs reference existing documents

## Key Takeaways

✅ **Admin** controls all class creation and assignments
✅ **Faculty** sees only their assigned classes via facultyId
✅ **Students** see only their enrolled classes via studentIds[]
✅ **References** use proper ObjectIds (facultyId → User, studentIds → Student)
✅ **Population** handles nested references automatically
✅ **Security** enforced via middleware and API session checks
✅ **Isolation** ensured through proper query filters

## Next Steps

1. ✅ Class creation working
2. ✅ Faculty class retrieval working
3. ✅ Student class retrieval working
4. ⏳ Implement attendance marking system
5. ⏳ Add class analytics
6. ⏳ Enable class notifications
