import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
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
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  imageUrl: String,
  faceEmbedding: {
    type: [Number], // Array of numbers for face embedding vector
    required: false,
  },
  imageDataset: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

StudentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

StudentSchema.index({ institutionId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
