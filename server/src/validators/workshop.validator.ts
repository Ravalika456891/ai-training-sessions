import { z } from 'zod';

export const createWorkshopSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3).toLowerCase(),
  batchCode: z.string().min(3).toUpperCase(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructor: z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    bio: z.string().min(10),
    avatarUrl: z.string().url('Avatar must be a valid URL'),
  }),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(10)),
  endDate: z.string().datetime({ offset: true }).or(z.string().min(10)),
  timings: z.string().default('10:00 AM – 3:00 PM IST'),
  timezone: z.string().default('Asia/Kolkata (IST)'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  price: z.object({
    basePrice: z.number().min(0),
    currency: z.string().default('INR'),
    taxPercentage: z.number().min(0).default(18),
    isFree: z.boolean().default(false),
  }),
  status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),
  curriculum: z.array(z.any()).optional(),
  learningOutcomes: z.array(z.any()).optional(),
  aiTools: z.array(z.any()).optional(),
  faqs: z.array(z.any()).optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;

