import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  projectTitle: string;
  repositoryUrl?: string;
  liveDemoUrl?: string;
  notes?: string;
  status: 'submitted' | 'under_review' | 'approved';
  feedback?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSubmissionSchema = new Schema<IProjectSubmission>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
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
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    repositoryUrl: {
      type: String,
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved'],
      default: 'submitted',
    },
    feedback: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectSubmission = mongoose.model<IProjectSubmission>(
  'ProjectSubmission',
  ProjectSubmissionSchema
);

