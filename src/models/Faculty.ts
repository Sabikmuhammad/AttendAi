import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  facultyId: {
    type: String,
    required: true,
  },
  institutionId: {
    type: String,
    required: true,
    default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
    index: true,
  },
  departmentId: {
    type: String,
    required: false,
  },
  department: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: false,
  },
  semester: {
    type: String,
    required: false,
  },
  designation: {
    type: String,
    required: false,
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

FacultySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

FacultySchema.index({ institutionId: 1, facultyId: 1 }, { unique: true });

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
