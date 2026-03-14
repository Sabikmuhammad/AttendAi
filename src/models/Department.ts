import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
    },
    institutionId: {
      type: String,
      required: true,
      default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

DepartmentSchema.index({ institutionId: 1, name: 1 }, { unique: true });

export default mongoose.models.Department ||
  mongoose.model('Department', DepartmentSchema);
