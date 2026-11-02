import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  enrollmentId: string;
  userId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'free';
  enrolledAt: Date;
  reservedUntil?: Date;
  attendeeDetails: {
    fullName: string;
    email: string;
    phone: string;
    userCategory: string;
    experienceLevel: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    enrollmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'attended'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'free'],
      default: 'pending',
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    reservedUntil: {
      type: Date,
    },
    attendeeDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      userCategory: { type: String, default: 'working_professional' },
      experienceLevel: { type: String, default: 'beginner' },
    },
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One user cannot have multiple active enrollments in the same workshop!
EnrollmentSchema.index({ userId: 1, workshopId: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

