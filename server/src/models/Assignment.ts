import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  workshopBatchCode: string;
  dayNumber: 1 | 2;
  deliverableType: string;
  maxScore: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    workshopBatchCode: {
      type: String,
      default: 'ALL',
      uppercase: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      enum: [1, 2],
      default: 2,
    },
    deliverableType: {
      type: String,
      default: 'GitHub Repository + Live Demo URL',
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
