import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Workshop } from '../models/Workshop.js';
import { env } from '../config/env.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Administrator Account if not present
    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: 'admin',
        userCategory: 'working_professional',
        experienceLevel: 'advanced',
        phone: { countryCode: '+91', number: '9999999999' },
      });
      console.log(`[Database Seed] Default Admin created: ${env.ADMIN_EMAIL}`);
    }

    // 2. Seed Default Published Workshops if collection is empty
    const workshopCount = await Workshop.countDocuments();
    if (workshopCount === 0) {
      await Workshop.create([
        {
          title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
          slug: 'ai-launchpad-nov-14-2026',
          batchCode: 'AILP-2026-NOV-14',
          description: 'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
          instructor: {
            name: 'Vikram Malhotra',
            role: 'Staff AI Engineer & Former ML Lead',
            bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals in practical AI adoption.',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          },
          startDate: new Date('2026-11-14T10:00:00+05:30'),
          endDate: new Date('2026-11-15T15:00:00+05:30'),
          timings: '10:00 AM – 3:00 PM IST',
          timezone: 'Asia/Kolkata (IST)',
          capacity: 60,
          enrolledCount: 36,
          reservedCount: 0,
          price: {
            basePrice: 1999,
            currency: 'INR',
            taxPercentage: 18,
            isFree: false,
          },
          status: 'published',
        },
        {
          title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
          slug: 'ai-launchpad-nov-28-2026',
          batchCode: 'AILP-2026-NOV-28',
          description: 'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
          instructor: {
            name: 'Ananya Sharma',
            role: 'Head of Product Design & AI Workflows',
            bio: 'Specializes in human-AI interaction, generative UI, and multimodal creative automation.',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          },
          startDate: new Date('2026-11-28T10:00:00+05:30'),
          endDate: new Date('2026-11-29T15:00:00+05:30'),
          timings: '10:00 AM – 3:00 PM IST',
          timezone: 'Asia/Kolkata (IST)',
          capacity: 60,
          enrolledCount: 12,
          reservedCount: 0,
          price: {
            basePrice: 1999,
            currency: 'INR',
            taxPercentage: 18,
            isFree: false,
          },
          status: 'published',
        },
        {
          title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
          slug: 'ai-launchpad-dec-12-2026',
          batchCode: 'AILP-2026-DEC-12',
          description: 'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
          instructor: {
            name: 'Vikram Malhotra',
            role: 'Staff AI Engineer & Former ML Lead',
            bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations.',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          },
          startDate: new Date('2026-12-12T10:00:00+05:30'),
          endDate: new Date('2026-12-13T15:00:00+05:30'),
          timings: '10:00 AM – 3:00 PM IST',
          timezone: 'Asia/Kolkata (IST)',
          capacity: 60,
          enrolledCount: 2,
          reservedCount: 0,
          price: {
            basePrice: 2499,
            currency: 'INR',
            taxPercentage: 18,
            isFree: false,
          },
          status: 'published',
        },
      ]);
      console.log('[Database Seed] Default workshop cohorts seeded successfully.');
    }
  } catch (err: any) {
    console.warn(`[Database Seed Warning] ${err.message}`);
  }
};

