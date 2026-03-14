import mongoose from 'mongoose';

const CameraSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    institutionId: {
      type: String,
      required: true,
      default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
      index: true,
    },
    rtspUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'error'],
      default: 'active',
    },
    lastHeartbeatAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

CameraSchema.index({ institutionId: 1, classroomId: 1 }, { unique: true });

export default mongoose.models.Camera || mongoose.model('Camera', CameraSchema);
