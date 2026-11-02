import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId;
  serialNumber: string;
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  recipientName: string;
  workshopTitle: string;
  completionDate: Date;
  verificationHash: string;
  issuedAt: Date;
  isRevoked: boolean;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
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
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    workshopTitle: {
      type: String,
      required: true,
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    verificationHash: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedReason: String,
  },
  {
    timestamps: true,
  }
);

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

