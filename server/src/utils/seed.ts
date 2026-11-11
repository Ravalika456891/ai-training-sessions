import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Workshop } from '../models/Workshop.js';
import { WorkshopSession } from '../models/WorkshopSession.js';
import { Enrollment } from '../models/Enrollment.js';
import { Assignment } from '../models/Assignment.js';
import { LearningResource } from '../models/LearningResource.js';
import { env } from '../config/env.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Administrator Account if not present
    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await User.create({
        name: env.ADMIN_NAME,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
        userCategory: 'working_professional',
        experienceLevel: 'advanced',
        phone: { countryCode: '+91', number: '9999999999' },
      });
      console.log(`[Database Seed] Default Admin created: ${adminEmail}`);
    }

    // 2. Remove legacy/extra cohorts (AILP-2026-NOV-28, AILP-2026-DEC-12) so only 1 primary cohort exists
    await Workshop.deleteMany({
      batchCode: { $in: ['AILP-2026-NOV-28', 'AILP-2026-DEC-12'] },
    });
    await WorkshopSession.deleteMany({
      batchCode: { $in: ['AILP-2026-NOV-28', 'AILP-2026-DEC-12'] },
    });

    // 3. Ensure the primary published workshop cohort (AILP-2026-NOV-14) exists
    let primaryWorkshop = await Workshop.findOne({ batchCode: 'AILP-2026-NOV-14' });
    if (!primaryWorkshop) {
      primaryWorkshop = await Workshop.create({
        title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
        slug: 'ai-launchpad-nov-14-2026',
        batchCode: 'AILP-2026-NOV-14',
        description:
          'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
        instructor: {
          name: 'Vikram Malhotra',
          role: 'Staff AI Engineer & Former ML Lead',
          bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals in practical AI adoption.',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
      });
      console.log('[Database Seed] Primary workshop cohort AILP-2026-NOV-14 seeded.');
    }

    // 4. Ensure Day 1 & Day 2 WorkshopSession records exist for AILP-2026-NOV-14
    const existingSessionsCount = await WorkshopSession.countDocuments({
      batchCode: 'AILP-2026-NOV-14',
    });
    if (existingSessionsCount === 0 && primaryWorkshop) {
      const day1Start = new Date('2026-11-14T10:00:00+05:30');
      const day1End = new Date('2026-11-14T15:00:00+05:30');
      const day2Start = new Date('2026-11-15T10:00:00+05:30');
      const day2End = new Date('2026-11-15T15:00:00+05:30');

      await WorkshopSession.create([
        {
          workshopId: primaryWorkshop._id,
          batchCode: 'AILP-2026-NOV-14',
          dayNumber: 1,
          title: 'Day 1: LLM Foundations, Prompt Architecture & Custom Assistants',
          description:
            'Interactive live training on LLM architectures, prompt engineering, and custom AI assistants.',
          sessionDate: day1Start,
          startAt: day1Start,
          endAt: day1End,
          durationMinutes: 300,
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          timezone: 'Asia/Kolkata',
          instructorName: 'Vikram Malhotra',
          classType: 'live',
          meetingProvider: 'google_meet',
          liveSessionUrl: 'https://meet.google.com/ailp-ailp-2026-nov-14-day1',
          meetingPasscode: 'AILP2026',
          visibility: 'enrolled_only',
          capacity: 60,
          status: 'scheduled',
        },
        {
          workshopId: primaryWorkshop._id,
          batchCode: 'AILP-2026-NOV-14',
          dayNumber: 2,
          title: 'Day 2: Multi-Step AI Workflows, React Prototypes & Production Ship',
          description:
            'Hands-on lab building multi-step AI workflows, RAG pipelines, and full-stack web prototypes.',
          sessionDate: day2Start,
          startAt: day2Start,
          endAt: day2End,
          durationMinutes: 300,
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          timezone: 'Asia/Kolkata',
          instructorName: 'Vikram Malhotra',
          classType: 'live',
          meetingProvider: 'google_meet',
          liveSessionUrl: 'https://meet.google.com/ailp-ailp-2026-nov-14-day2',
          meetingPasscode: 'AILP2026',
          visibility: 'enrolled_only',
          capacity: 60,
          status: 'scheduled',
        },
      ]);
    }

    // 5. Seed Default Student & Preview User Accounts in MongoDB if not present
    await User.deleteOne({ email: 'ram@gmail.com' });
    const studentPwdHash = await bcrypt.hash('StudentLaunchpad2026!', 10);
    const simpleStudentHash = await bcrypt.hash('Student123!', 10);
    const ramyaPwdHash = await bcrypt.hash('mnopqrs123', 10);

    const defaultUsers = [
      {
        name: 'Aarav Mehta',
        email: 'student@ailaunchpad.edu',
        passwordHash: studentPwdHash,
        role: 'learner' as const,
        userCategory: 'working_professional' as const,
        experienceLevel: 'intermediate' as const,
        phone: { countryCode: '+91', number: '9876543210' },
        enrolled: true,
        enrollmentId: 'AILP-ENR-1001',
      },
      {
        name: 'Aarav Mehta',
        email: 'student@example.com',
        passwordHash: simpleStudentHash,
        role: 'learner' as const,
        userCategory: 'working_professional' as const,
        experienceLevel: 'intermediate' as const,
        phone: { countryCode: '+91', number: '9876543210' },
        enrolled: true,
        enrollmentId: 'AILP-ENR-1002',
      },
      {
        name: 'Priya Nair',
        email: 'user@ailaunchpad.edu',
        passwordHash: studentPwdHash,
        role: 'learner' as const,
        userCategory: 'student' as const,
        experienceLevel: 'beginner' as const,
        phone: { countryCode: '+91', number: '9876501234' },
        enrolled: false,
      },
      {
        name: 'Ramya',
        email: 'ramya@gmail.com',
        passwordHash: ramyaPwdHash,
        role: 'learner' as const,
        userCategory: 'student' as const,
        experienceLevel: 'beginner' as const,
        phone: { countryCode: '+91', number: '9876543210' },
        enrolled: false,
      },
    ];

    for (const u of defaultUsers) {
      let dbUser = await User.findOne({ email: u.email });
      if (!dbUser) {
        dbUser = await User.create({
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          accountStatus: 'active',
          userCategory: u.userCategory,
          experienceLevel: u.experienceLevel,
          phone: u.phone,
          marketingConsent: true,
        });
      }
      if (u.enrolled && primaryWorkshop && dbUser && u.enrollmentId) {
        const existingEnr = await Enrollment.findOne({
          $or: [
            { enrollmentId: u.enrollmentId },
            { userId: dbUser._id, workshopId: primaryWorkshop._id },
          ],
        });
        if (!existingEnr) {
          await Enrollment.create({
            enrollmentId: u.enrollmentId,
            userId: dbUser._id,
            workshopId: primaryWorkshop._id,
            status: 'confirmed',
            paymentStatus: 'captured',
            confirmedAt: new Date(),
            attendeeDetails: {
              fullName: u.name,
              email: u.email,
              phone: u.phone.number,
              countryCode: u.phone.countryCode,
              userCategory: u.userCategory,
              experienceLevel: u.experienceLevel,
            },
          });
        }
      }
    }

    // 6. Seed Default Assignments & Learning Resources if empty
    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0) {
      await Assignment.create([
        {
          title: 'Day 1 Deliverable: Custom Grounded AI Assistant & Prompt Library',
          description:
            'Configure a domain-specific AI assistant with system prompt instructions, structured JSON output schema, and knowledge base grounding.',
          dayNumber: 1,
          workshopBatchCode: 'ALL',
          isRequiredForCertificate: true,
        },
        {
          title: 'Day 2 Capstone: Multi-Step AI Workflow & Functional Web Prototype',
          description:
            'Build and deploy a working multi-step AI automation or full-stack web prototype and submit your repository and live demo links.',
          dayNumber: 2,
          workshopBatchCode: 'ALL',
          isRequiredForCertificate: true,
        },
      ]);
    }

    const resourceCount = await LearningResource.countDocuments();
    if (resourceCount === 0) {
      await LearningResource.create([
        {
          title: 'Module 1 & 2: Reusable 10-Prompt Enterprise Library',
          category: 'prompt_template',
          description:
            'Battle-tested system prompt templates for GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0.',
          url: 'https://ai-training-sessions-zeta.vercel.app/#curriculum',
          workshopBatchCode: 'ALL',
          accessLevel: 'enrolled_only',
          isPublished: true,
        },
        {
          title: 'Module 3: Custom Assistant Grounding & RAG PDF Guide',
          category: 'pdf',
          description:
            'Step-by-step architecture playbook for building hallucination-free enterprise AI assistants.',
          url: 'https://ai-training-sessions-zeta.vercel.app/#curriculum',
          workshopBatchCode: 'ALL',
          accessLevel: 'enrolled_only',
          isPublished: true,
        },
        {
          title: 'Module 5: React + Tailwind AI Prototype Starter Repository',
          category: 'code_repo',
          description:
            'Production-ready full-stack starter kit with streaming LLM responses and tool calling.',
          url: 'https://github.com/example/ai-prototype-starter',
          workshopBatchCode: 'ALL',
          accessLevel: 'enrolled_only',
          isPublished: true,
        },
      ]);
    }
  } catch (err: any) {
    console.warn(`[Database Seed Warning] ${err.message}`);
  }
};
