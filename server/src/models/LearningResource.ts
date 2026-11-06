import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResource extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: 'pdf' | 'prompt_template' | 'code_repo' | 'assignment' | 'faq' | 'testimonial' | 'workshop_description';
  description: string;
  url?: string;
  content?: string;
  workshopBatchCode?: string;
  accessLevel: 'enrolled_only' | 'public';
  isPublished: boolean;
  authorName?: string;
  authorRole?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['pdf', 'prompt_template', 'code_repo', 'assignment', 'faq', 'testimonial', 'workshop_description'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    workshopBatchCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ['enrolled_only', 'public'],
      default: 'enrolled_only',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    authorName: {
      type: String,
      trim: true,
    },
    authorRole: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const LearningResource = mongoose.model<ILearningResource>(
  'LearningResource',
  LearningResourceSchema
);

