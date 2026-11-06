import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: 'user' | 'workshop' | 'session' | 'enrollment' | 'payment' | 'certificate' | 'content' | 'settings' | 'instructor';
  entityId?: string;
  summary: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['user', 'workshop', 'session', 'enrollment', 'payment', 'certificate', 'content', 'settings', 'instructor'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

