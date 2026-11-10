import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionChangeEntry {
  action: string;
  summary: string;
  actorEmail: string;
  timestamp: Date;
}

export interface IRecurrenceRule {
  frequency: 'none' | 'daily' | 'weekly' | 'weekdays';
  daysOfWeek?: number[];
  untilDate?: string;
}

export interface IWorkshopSession extends Document {
  _id: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  batchId?: string;
  batchCode: string;
  instructorId?: string;
  dayNumber: number;
  title: string;
  description?: string;
  sessionDate: Date;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  timezone: string;
  instructorName: string;
  instructorEmail?: string;
  classType: 'live' | 'recorded' | 'hybrid';
  meetingProvider: 'google_meet' | 'zoom' | 'teams' | 'custom';
  liveSessionUrl: string;
  encryptedMeetingUrl?: string;
  meetingPasscode?: string;
  visibility: 'enrolled_only' | 'public_preview';
  capacity: number;
  maxAttendees?: number;
  registrationDeadline?: Date;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  recurrenceSeriesId?: string;
  recurrenceRule?: IRecurrenceRule;
  cancellationReason?: string;
  createdBy?: string;
  updatedBy?: string;
  changeHistory?: ISessionChangeEntry[];
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
    batchId: {
      type: String,
      trim: true,
      index: true,
    },
    batchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    instructorId: {
      type: String,
      trim: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      default: 1,
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
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 120,
      min: 15,
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '12:00 PM',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
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
    classType: {
      type: String,
      enum: ['live', 'recorded', 'hybrid'],
      default: 'live',
      index: true,
    },
    meetingProvider: {
      type: String,
      enum: ['google_meet', 'zoom', 'teams', 'custom'],
      default: 'google_meet',
    },
    liveSessionUrl: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedMeetingUrl: {
      type: String,
      trim: true,
    },
    meetingPasscode: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['enrolled_only', 'public_preview'],
      default: 'enrolled_only',
    },
    capacity: {
      type: Number,
      default: 60,
      min: 1,
    },
    maxAttendees: {
      type: Number,
      default: 60,
      min: 1,
    },
    registrationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    recurrenceSeriesId: {
      type: String,
      trim: true,
      index: true,
    },
    recurrenceRule: {
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'weekdays'],
        default: 'none',
      },
      daysOfWeek: [Number],
      untilDate: String,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
    changeHistory: [
      {
        action: String,
        summary: String,
        actorEmail: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

WorkshopSessionSchema.index({ workshopId: 1, startAt: 1 });
WorkshopSessionSchema.index({ batchCode: 1, startAt: 1 });
WorkshopSessionSchema.index({ instructorId: 1, startAt: 1 });

export const WorkshopSession = mongoose.model<IWorkshopSession>(
  'WorkshopSession',
  WorkshopSessionSchema
);
