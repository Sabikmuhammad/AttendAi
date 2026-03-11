# Registration System Implementation

## Overview
Implemented a complete registration system where students and faculty must provide their IDs during signup. Authentication data is stored in the User collection, while role-specific data is stored in separate Student and Faculty collections.

## Database Schema

### 1. User Collection (Authentication)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  role: 'admin' | 'faculty' | 'student',
  isVerified: Boolean,
  imageUrl?: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Student Collection (Role-Specific Data)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  studentId: String (unique, required),
  department: String (required),
  section: String (optional),
  imageUrl: String,
  faceEmbedding: [Number],
  imageDataset: [{
    url: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Faculty Collection (Role-Specific Data)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  facultyId: String (unique, required),
  department: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Details

### 1. Models Updated

#### Student Model (`src/models/Student.ts`)
- **Changed**: Removed `name`, `email`, `registerNumber` fields
- **Added**: `userId` reference to User collection
- **Added**: `studentId` field (unique)
- **Kept**: `department`, `section`, face recognition fields

#### Faculty Model (`src/models/Faculty.ts`)
- **Created**: New model for faculty-specific data
- **Fields**: `userId` (ref), `facultyId` (unique), `department`

### 2. Registration API (`src/app/api/auth/register/route.ts`)

**Student Registration Flow:**
1. Validate: name, email, password, studentId, department
2. Check if email exists
3. Check if studentId is unique
4. Hash password with bcrypt (12 rounds)
5. Create User record with `role: 'student'`, `isVerified: false`
6. Create Student record with `userId`, `studentId`, `department`, `section`
7. Generate 6-digit OTP and send verification email
8. Return success with `requiresVerification: true`

**Faculty Registration Flow:**
1. Validate: name, email, password, facultyId, department
2. Check if email exists
3. Check if facultyId is unique
4. Hash password with bcrypt (12 rounds)
5. Create User record with `role: 'faculty'`, `isVerified: false`
6. Create Faculty record with `userId`, `facultyId`, `department`
7. Generate 6-digit OTP and send verification email
8. Return success with `requiresVerification: true`

**Validation Rules:**
- Password must be at least 8 characters
- Student must provide: studentId, department
- Faculty must provide: facultyId, department
- Section is optional for students
- Only 'student' and 'faculty' roles can self-register (admin created manually)

### 3. Registration UI (`src/app/register/page.tsx`)

**Form Fields:**
- Full Name (required)
- Email Address (required)
- Role Selection (Student/Faculty cards - required)
- **Student ID** (shown only for students - required)
- **Faculty ID** (shown only for faculty - required)
- **Department** (required for both)
- **Section** (shown only for students - optional)
- Password (required, min 8 chars)
- Confirm Password (required, must match)

**Dynamic Form Behavior:**
- Role selection changes visible fields
- Student sees: studentId, department, section
- Faculty sees: facultyId, department
- Real-time validation and error messages
- Premium UI with Framer Motion animations

### 4. Students API (`src/app/api/students/route.ts`)

**GET /api/students**
- Fetches all students with populated user data
- Returns transformed data including name, email from User collection
- Maintains backward compatibility with `registerNumber` field

**POST /api/students** (Admin creating students manually)
- Creates both User and Student records
- Auto-verifies admin-created users
- Validates studentId uniqueness
- Default password: 'ChangeMe@123' if not provided

### 5. Faculty API (`src/app/api/faculty/route.ts`)

**GET /api/faculty**
- Fetches all faculty with populated user data
- Returns transformed data including name, email from User collection

**POST /api/faculty** (Admin creating faculty manually)
- Creates both User and Faculty records
- Auto-verifies admin-created users
- Validates facultyId uniqueness
- Default password: 'ChangeMe@123' if not provided

## Key Features

✅ **Separation of Concerns**: Authentication data separate from role-specific data
✅ **Unique IDs**: studentId and facultyId are unique across the system
✅ **Validation**: Comprehensive server-side validation
✅ **Security**: bcrypt password hashing, email verification
✅ **Relational Design**: userId references maintain data integrity
✅ **Backward Compatibility**: API responses include legacy field names
✅ **Admin Override**: Admins can create pre-verified users manually
✅ **Premium UI**: Modern, animated registration form with role-based fields

## API Endpoints

### Registration
```
POST /api/auth/register
Body (Student): {
  name, email, password, role: 'student',
  studentId, department, section (optional)
}
Body (Faculty): {
  name, email, password, role: 'faculty',
  facultyId, department
}
Response: { success, message, requiresVerification }
```

### Students
```
GET /api/students?department=xxx
Response: { success, students: [{
  _id, studentId, name, email, registerNumber,
  department, section, imageUrl, createdAt
}]}

POST /api/students (Admin only)
Body: { name, email, studentId, department, section, imageUrl, password }
Response: { success, message, student }
```

### Faculty
```
GET /api/faculty
Response: { success, faculty: [{
  _id, facultyId, name, email, department, imageUrl, createdAt
}]}

POST /api/faculty (Admin only)
Body: { name, email, facultyId, department, imageUrl, password }
Response: { success, message, faculty }
```

## Error Handling

- **400**: Missing required fields
- **409**: Duplicate email, studentId, or facultyId
- **500**: Server/database errors

Error messages are descriptive and user-friendly.

## Testing

Use the test script at `scripts/test-registration.js`:

```javascript
const studentData = {
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123",
  role: "student",
  studentId: "STU2024001",
  department: "Computer Science",
  section: "A"
};

const facultyData = {
  name: "Dr. Jane Smith",
  email: "jane@example.com",
  password: "SecurePass123",
  role: "faculty",
  facultyId: "FAC2024001",
  department: "Computer Science"
};
```

## Migration Notes

If you have existing students/faculty data:
1. Existing Student records need `userId` field populated
2. Add `studentId` based on existing `registerNumber`
3. Create Faculty records for existing faculty users
4. Run data migration script (create if needed)

## Next Steps

1. ✅ Registration form collects IDs and departments
2. ✅ Separate collections for Student and Faculty
3. ✅ Unique validation for studentId/facultyId
4. ✅ User data stored in User collection
5. ✅ Role-specific data in respective collections
6. ✅ API endpoints updated with population
7. ✅ Build successful with no errors

**Ready for testing!** Try registering new students and faculty at:
- http://localhost:3000/register
