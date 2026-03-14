import mongoose from 'mongoose';

const InstitutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    subdomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter',
      required: true,
    },
    planLimits: {
      students: { type: Number, default: 500 },
      faculty: { type: Number, default: 25 },
      cameras: { type: Number, default: 10 },
      classes: { type: Number, default: 50 },
    },
    domain: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: false,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial'],
      default: 'trial',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Institution ||
  mongoose.model('Institution', InstitutionSchema);
