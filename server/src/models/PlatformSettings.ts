import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  branding: {
    siteName: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    primaryColor: string;
  };
  registration: {
    allowPublicRegistration: boolean;
    requireEmailVerification: boolean;
    maxSeatsPerBatch: number;
    reservationHoldMinutes: number;
    waitlistEnabled: boolean;
  };
  workshopDefaults: {
    defaultBasePrice: number;
    defaultCurrency: string;
    defaultTaxPercentage: number;
    defaultTimezone: string;
    defaultTimings: string;
  };
  emailTemplates: {
    registrationConfirmationSubject: string;
    paymentReceiptSubject: string;
    certificateIssuedSubject: string;
    reminderHoursBeforeSession: number;
  };
  instructorPermissions: {
    canMarkAttendance: boolean;
    canReviewSubmissions: boolean;
    canUploadMaterials: boolean;
    canViewStudentEmails: boolean;
  };
  notifications: {
    notifyAdminOnNewEnrollment: boolean;
    notifyAdminOnPaymentFailure: boolean;
    notifyStudentOnCertificateIssue: boolean;
  };
  updatedBy?: string;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_settings',
      index: true,
    },
    branding: {
      siteName: { type: String, default: 'AI Launchpad' },
      tagline: { type: String, default: '2-Day Hands-On AI Bootcamp' },
      supportEmail: { type: String, default: 'admissions@ailaunchpad.edu' },
      supportPhone: { type: String, default: '+91 98765 43210' },
      primaryColor: { type: String, default: '#2563EB' },
    },
    registration: {
      allowPublicRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      maxSeatsPerBatch: { type: Number, default: 60, min: 1 },
      reservationHoldMinutes: { type: Number, default: 15, min: 5 },
      waitlistEnabled: { type: Boolean, default: true },
    },
    workshopDefaults: {
      defaultBasePrice: { type: Number, default: 1999, min: 0 },
      defaultCurrency: { type: String, default: 'INR' },
      defaultTaxPercentage: { type: Number, default: 18, min: 0, max: 100 },
      defaultTimezone: { type: String, default: 'Asia/Kolkata (IST)' },
      defaultTimings: { type: String, default: '10:00 AM – 3:00 PM IST' },
    },
    emailTemplates: {
      registrationConfirmationSubject: {
        type: String,
        default: 'Welcome to AI Launchpad — Your Cohort Registration Details',
      },
      paymentReceiptSubject: {
        type: String,
        default: 'Confirmed: Your AI Launchpad Bootcamp Seat & Payment Receipt',
      },
      certificateIssuedSubject: {
        type: String,
        default: 'Congratulations! Your Official AI Launchpad Certificate is Ready',
      },
      reminderHoursBeforeSession: { type: Number, default: 24 },
    },
    instructorPermissions: {
      canMarkAttendance: { type: Boolean, default: true },
      canReviewSubmissions: { type: Boolean, default: true },
      canUploadMaterials: { type: Boolean, default: true },
      canViewStudentEmails: { type: Boolean, default: true },
    },
    notifications: {
      notifyAdminOnNewEnrollment: { type: Boolean, default: true },
      notifyAdminOnPaymentFailure: { type: Boolean, default: true },
      notifyStudentOnCertificateIssue: { type: Boolean, default: true },
    },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>(
  'PlatformSettings',
  PlatformSettingsSchema
);

