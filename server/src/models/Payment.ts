import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  amount: number; // in INR
  amountInPaise: number; // in paise for Razorpay
  currency: string;
  provider: 'razorpay' | 'free_tier';
  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  idempotencyKey?: string;
  webhookEventsReceived: string[];
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    provider: {
      type: String,
      enum: ['razorpay', 'free_tier'],
      default: 'razorpay',
    },
    providerPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    providerOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    providerSignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'captured', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
    webhookEventsReceived: {
      type: [String],
      default: [],
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
