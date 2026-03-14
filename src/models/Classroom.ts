import mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true,
    default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    required: false,
  },
  floor: {
    type: String,
    required: false,
  },
  capacity: {
    type: Number,
    required: false,
  },
  location: {
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  hasCamera: {
    type: Boolean,
    default: false,
  },
  cameraType: {
    type: String,
    enum: ['webcam', 'cctv', 'none'],
    default: 'none',
  },
  rtspUrl: {
    type: String,
    required: false,
  },
  rtspUsername: {
    type: String,
    required: false,
  },
  rtspPassword: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
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

ClassroomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ClassroomSchema.index({ institutionId: 1, roomNumber: 1 }, { unique: true });

export default mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);
