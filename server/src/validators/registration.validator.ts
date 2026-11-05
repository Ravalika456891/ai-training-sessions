import { z } from 'zod';

export const createRegistrationSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(25, 'Phone number cannot exceed 25 characters'),
  batchId: z
    .string({ required_error: 'Training batch ID is required' })
    .trim()
    .min(1, 'Please select a training batch'),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
