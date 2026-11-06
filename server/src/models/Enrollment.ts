import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  enrollmentId: string;
  userId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'attended' | 'completed';
  paymentStatus: 'created' | 'authorized' | 'captured' | 'pending' | 'completed' | 'failed' | 'refunded' | 'free';
  enrolledAt: Date;
  confirmedAt?: Date;
  reservedUntil?: Date;
  day1Attended?: boolean;
  day2Attended?: boolean;
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
      enum: ['pending_payment', 'pending', 'confirmed', 'cancelled', 'expired', 'attended', 'completed'],
      default: 'pending_payment',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'pending', 'completed', 'failed', 'refunded', 'free'],
      default: 'created',
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
    reservedUntil: {
      type: Date,
    },
    day1Attended: {
      type: Boolean,
      default: false,
    },
    day2Attended: {
      type: Boolean,
      default: false,
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

