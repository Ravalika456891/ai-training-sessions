import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: {
    countryCode: string;
    number: string;
  };
  googleId?: string;
  avatarUrl?: string;
  role: 'learner' | 'instructor' | 'admin' | 'support';
  userCategory?: 'student' | 'working_professional' | 'founder' | 'creator' | 'other';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  marketingConsent: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Do not return password hash by default
    },
    phone: {
      countryCode: { type: String, default: '+91' },
      number: { type: String, trim: true },
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['learner', 'instructor', 'admin', 'support'],
      default: 'learner',
      index: true,
    },
    userCategory: {
      type: String,
      enum: ['student', 'working_professional', 'founder', 'creator', 'other'],
      default: 'working_professional',
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);

