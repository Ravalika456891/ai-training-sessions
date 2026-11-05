import mongoose, { Document, Schema } from 'mongoose';

export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'waived';

export interface IRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  batchId: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    batchId: {
      type: String,
      required: [true, 'Training batch ID is required'],
      trim: true,
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'waived'],
      default: 'unpaid',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Unique Index: Enforce no duplicate registrations for the same student email and training batch
registrationSchema.index({ email: 1, batchId: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);
