import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  password?: string;
  role:
    | 'super_admin'
    | 'institution_admin'
    | 'department_admin'
    | 'admin'
    | 'faculty'
    | 'student';
  institutionId: string;
  departmentIds?: string[];
  isVerified: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: false,
      minlength: [8, 'Password must be at least 8 characters'],
      select: true,
    },
    // Backward compatibility with legacy records.
    password: {
      type: String,
      required: false,
      minlength: [8, 'Password must be at least 8 characters'],
      select: true,
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'institution_admin',
        'department_admin',
        'admin',
        'faculty',
        'student',
      ],
      required: [true, 'Role is required'],
    },
    institutionId: {
      type: String,
      required: true,
      default: () => process.env.DEFAULT_INSTITUTION_ID || 'default-institution',
      index: true,
    },
    departmentIds: {
      type: [String],
      default: [],
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', function normalizePassword(next) {
  if (!this.passwordHash && this.password) {
    this.passwordHash = this.password;
  }
  if (!this.password && this.passwordHash) {
    this.password = this.passwordHash;
  }
  next();
});

UserSchema.index({ institutionId: 1, email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
