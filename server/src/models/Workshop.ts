import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshop extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  batchCode: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    bio: string;
    avatarUrl: string;
  };
  startDate: Date;
  endDate: Date;
  timings: string;
  timezone: string;
  capacity: number;
  enrolledCount: number;
  reservedCount: number;
  price: {
    basePrice: number;
    currency: string;
    taxPercentage: number;
    isFree: boolean;
  };
  status: 'draft' | 'published' | 'archived' | 'completed';
  thumbnailUrl?: string;
  registrationDeadline?: Date;
  liveSessionUrl?: string;
  meetingPasscode?: string;
  day1Session?: {
    title?: string;
    startTime?: string;
    endTime?: string;
    liveUrl?: string;
    instructorName?: string;
  };
  day2Session?: {
    title?: string;
    startTime?: string;
    endTime?: string;
    liveUrl?: string;
    instructorName?: string;
  };
  curriculum?: any[];
  learningOutcomes?: any[];
  aiTools?: any[];
  faqs?: any[];
  createdAt: Date;
  updatedAt: Date;
  availableSeats: number;
}

const WorkshopSchema = new Schema<IWorkshop>(
  {
    title: {
      type: String,
      required: [true, 'Workshop title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    batchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Workshop description is required'],
    },
    instructor: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      bio: { type: String, required: true },
      avatarUrl: { type: String, required: true },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    timings: {
      type: String,
      default: '10:00 AM – 3:00 PM IST',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata (IST)',
    },
    capacity: {
      type: Number,
      required: [true, 'Workshop capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      basePrice: { type: Number, required: true, default: 1999 },
      currency: { type: String, default: 'INR' },
      taxPercentage: { type: Number, default: 18 },
      isFree: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'completed'],
      default: 'draft',
      index: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    registrationDeadline: {
      type: Date,
    },
    liveSessionUrl: {
      type: String,
      trim: true,
    },
    meetingPasscode: {
      type: String,
      trim: true,
    },
    day1Session: {
      title: { type: String, default: 'Day 1: LLM Foundations, Prompt Engineering & Custom Assistants' },
      startTime: { type: String, default: '10:00 AM IST' },
      endTime: { type: String, default: '3:00 PM IST' },
      liveUrl: { type: String, default: 'https://meet.google.com/ailp-day1-cohort' },
      instructorName: { type: String },
    },
    day2Session: {
      title: { type: String, default: 'Day 2: Multi-Step AI Workflows, Prototypes & Deployment' },
      startTime: { type: String, default: '10:00 AM IST' },
      endTime: { type: String, default: '3:00 PM IST' },
      liveUrl: { type: String, default: 'https://meet.google.com/ailp-day2-cohort' },
      instructorName: { type: String },
    },
    curriculum: { type: [Schema.Types.Mixed] as any, default: [] },
    learningOutcomes: { type: [Schema.Types.Mixed] as any, default: [] },
    aiTools: { type: [Schema.Types.Mixed] as any, default: [] },
    faqs: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for real-time available seats
WorkshopSchema.virtual('availableSeats').get(function (this: any) {
  const seats = this.capacity - (this.enrolledCount + this.reservedCount);
  return Math.max(0, seats);
});

// Compound index for querying published upcoming workshops
WorkshopSchema.index({ status: 1, startDate: 1 });

export const Workshop = mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

