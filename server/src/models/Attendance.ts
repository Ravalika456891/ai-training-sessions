import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  dayNumber: number; // 1 or 2
  status: 'present' | 'absent';
  markedBy: mongoose.Types.ObjectId;
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
      index: true,
    },
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'present',
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: only one attendance record per enrollment per day
AttendanceSchema.index({ enrollmentId: 1, dayNumber: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

