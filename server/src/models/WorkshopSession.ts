import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshopSession extends Document {
  _id: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  batchCode: string;
  dayNumber: 1 | 2;
  title: string;
  description?: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
  timezone: string;
  instructorName: string;
  instructorEmail?: string;
  liveSessionUrl: string;
  meetingPasscode?: string;
  capacity: number;
  registrationDeadline?: Date;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const WorkshopSessionSchema = new Schema<IWorkshopSession>(
  {
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
      index: true,
    },
    batchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sessionDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '3:00 PM',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata (IST)',
    },
    instructorName: {
      type: String,
      required: true,
      trim: true,
    },
    instructorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    liveSessionUrl: {
      type: String,
      required: true,
      trim: true,
    },
    meetingPasscode: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 60,
      min: 1,
    },
    registrationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

WorkshopSessionSchema.index({ workshopId: 1, dayNumber: 1 }, { unique: true });

export const WorkshopSession = mongoose.model<IWorkshopSession>(
  'WorkshopSession',
  WorkshopSessionSchema
);

