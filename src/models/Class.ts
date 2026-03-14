import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: false,
  },
  institutionId: {
    type: String,
    required: true,
    default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
    index: true,
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: false,
  },
  section: {
    type: String,
    required: false,
  },
  classroomNumber: {
    type: String,
    required: true,
  },
  classroomLocation: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  facultyName: {
    type: String,
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  monitoringMode: {
    type: String,
    enum: ['development', 'production'],
    default: 'development',
    required: false,
  },
  rtspUrl: {
    type: String,
    required: false,
  },
  autoMonitoring: {
    type: Boolean,
    default: false,
    required: false,
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ClassSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ClassSchema.index({ institutionId: 1, startTime: -1 });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
