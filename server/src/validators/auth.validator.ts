import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z
    .union([
      z.object({
        countryCode: z.string().default('+91'),
        number: z.string().optional().default(''),
      }),
      z.string().transform((val) => ({ countryCode: '+91', number: val })),
    ])
    .optional(),
  userCategory: z
    .enum(['student', 'working_professional', 'founder', 'creator', 'other'])
    .optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  marketingConsent: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

