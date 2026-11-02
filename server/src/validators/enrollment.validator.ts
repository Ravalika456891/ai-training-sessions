import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  workshopId: z.string().min(1, 'Workshop ID is required'),
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required').toLowerCase(),
  phoneCountryCode: z.string().default('+91'),
  phoneNumber: z.string().min(7, 'Phone number must be at least 7 digits'),
  userCategory: z
    .enum(['student', 'working_professional', 'founder', 'creator', 'other'])
    .default('working_professional'),
  experienceLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('beginner'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms and Privacy Policy to register' }),
  }),
  marketingConsent: z.boolean().optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

