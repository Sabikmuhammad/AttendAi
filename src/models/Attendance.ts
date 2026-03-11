import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true,
  },
  detectedTime: {
    type: Date,
    default: Date.now,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: false,
  },
  method: {
    type: String,
    enum: ['face_recognition', 'manual', 'qr_code'],
    default: 'face_recognition',
  },
  imageUrl: String, // Optional: snapshot when detected
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one attendance record per student per class
AttendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
