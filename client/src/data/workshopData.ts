import type {
  LearningOutcome,
  CurriculumDay,
  AITool,
  Mentor,
  Testimonial,
  FAQItem,
  BatchOption,
  AudiencePersona
} from '../types/workshop';

export const WORKSHOP_CONFIG = {
  brandName: 'AI Launchpad',
  edition: '2-Day Hands-On AI Bootcamp',
  tagline: 'Master Practical AI in Just One Weekend',
  subTagline: 'Build custom AI assistants, production-ready automations, and functional app prototypes. Guided by seasoned practitioners with 100% hands-on exercises.',
  formatBadge: 'Live Interactive Cohort',
  durationBadge: '2 Days • 10 Hours Live',
  experienceBadge: 'No Prior Coding Required',
  supportEmail: 'support@ailaunchpad.edu',
  guaranteeText: 'Verified completion certificate with cryptographic serial verification.',
};

export const BATCH_OPTIONS: BatchOption[] = [
  {
    id: 'batch-nov-14',
    batchCode: 'AILP-2026-NOV-14',
    dateRange: 'Nov 14 – Nov 15, 2026',
    days: 'Saturday & Sunday',
    timings: '10:00 AM – 3:00 PM IST',
    timezone: 'Asia/Kolkata (IST)',
    totalSeats: 60,
    availableSeats: 24,
    status: 'Open',
    pricing: {
      basePrice: 1999,
      currency: 'INR',
      taxPercentage: 18,
    }
  }
];

export const LEARNING_OUTCOMES: LearningOutcome[] = [
  {
    id: 'outcome-1',
    title: 'Generative AI & LLM Foundations',
    description: 'Demystify large language models, tokens, context windows, and hallucination guardrails for business and personal workflows.',
    iconName: 'Cpu',
    deliverable: 'Personalized AI Workflow Evaluation Matrix'
  },
  {
    id: 'outcome-2',
    title: 'Advanced Prompt Engineering',
    description: 'Master few-shot prompting, chain-of-thought, persona constraints, and structured output formatting (JSON/Markdown).',
    iconName: 'Terminal',
    deliverable: 'Battle-Tested Reusable Prompt Template Pack'
  },
  {
    id: 'outcome-3',
    title: 'Custom AI Assistants & GPTs',
    description: 'Configure and ground domain-specific AI assistants with customized instructions, uploaded knowledge documents, and guardrails.',
    iconName: 'Bot',
    deliverable: 'Functional Domain-Specific AI Assistant'
  },
  {
    id: 'outcome-4',
    title: 'Creative AI & Multimedia Storyboarding',
    description: 'Generate high-fidelity marketing visuals, conceptual mockups, and structured multimedia storyboards with responsible AI usage.',
    iconName: 'Palette',
    deliverable: 'Commercial-Grade Visual Campaign Storyboard'
  },
  {
    id: 'outcome-5',
    title: 'AI-Assisted App & Prototype Creation',
    description: 'Turn plain English problem statements into structured product requirements (PRD) and interactive web mockups in minutes.',
    iconName: 'Layers',
    deliverable: 'Deployable Interactive Web Application Mockup'
  },
  {
    id: 'outcome-6',
    title: 'End-to-End Workflow Automation',
    description: 'Connect AI models to webhooks, triggers, forms, and notification channels without writing complex backend infrastructure.',
    iconName: 'Zap',
    deliverable: 'Automated Multi-Step Lead/Content Pipeline'
  }
];

export const AUDIENCE_PERSONAS: AudiencePersona[] = [
  {
    persona: 'Students & Beginners',
    tagline: 'Future-proof your career from day one',
    painPoint: 'Confused by theoretical math or superficial AI hype.',
    takeaway: 'Gain hands-on practical skills with real projects to showcase on your CV and GitHub.',
    iconName: 'GraduationCap'
  },
  {
    persona: 'Working Professionals',
    tagline: '10x your daily workplace output',
    painPoint: 'Drowning in repetitive reporting, emails, documentation, and data formatting.',
    takeaway: 'Automate daily tedious tasks, draft strategy documents faster, and lead AI adoption.',
    iconName: 'Briefcase'
  },
  {
    persona: 'Founders & Solopreneurs',
    tagline: 'Build MVP prototypes with lean budgets',
    painPoint: 'Spending weeks or thousands of dollars building initial product iterations.',
    takeaway: 'Ideate, scaffold, and test software prototypes and marketing funnels in hours.',
    iconName: 'Rocket'
  },
  {
    persona: 'Creators & Freelancers',
    tagline: 'Scale your creative deliverables seamlessly',
    painPoint: 'Creative burnout, slow turnaround times, and manual editing overhead.',
    takeaway: 'Produce high-converting copy, design assets, and automated distribution workflows.',
    iconName: 'Sparkles'
  }
];

export const CURRICULUM_DAYS: CurriculumDay[] = [
  {
    dayNumber: 1,
    title: 'Day 1 — Foundations, Prompting & Creative AI',
    subtitle: 'From core mechanics to custom-grounded assistants and multimodal generation.',
    scheduleTime: '5 Hours Live (Interactive Labs + Q&A)',
    modules: [
      {
        order: 1,
        moduleName: 'Module 1: Generative AI Architecture & Practical Landscape',
        duration: '75 mins',
        topics: [
          'How LLMs really work (tokens, probability, temperature, context limits)',
          'Privacy, intellectual property, and enterprise data hygiene',
          'Comparing modern models: reasoning models vs speed-optimized models',
          'Identifying high-ROI personal and organizational AI opportunities'
        ],
        handsOnOutput: 'Hands-on Output: Personal AI Opportunity Audit Sheet',
        toolsUsed: ['Claude 3.5 Sonnet', 'ChatGPT-4o', 'Perplexity']
      },
      {
        order: 2,
        moduleName: 'Module 2: Precision Prompt Engineering & Structured Context',
        duration: '75 mins',
        topics: [
          'The 5-part prompt architecture: Role, Objective, Context, Constraints, Format',
          'Few-shot learning and Chain-of-Thought (CoT) problem decomposition',
          'Preventing hallucination using explicit negative constraints and boundaries',
          'Extracting JSON, Markdown tables, and structured datasets reliably'
        ],
        handsOnOutput: 'Hands-on Output: Standardized 10-Prompt Reusable Enterprise Library',
        toolsUsed: ['Anthropic Workbench', 'OpenAI Playground']
      },
      {
        order: 3,
        moduleName: 'Module 3: Building Custom AI Assistants & Grounded Knowledge',
        duration: '75 mins',
        topics: [
          'Custom instructions and system prompts that maintain voice and guidelines',
          'Document grounding: Uploading PDFs, spreadsheets, and guideline manuals',
          'Configuring actionable tools and web browsing capabilities',
          'Stress-testing and red-teaming your assistant against edge cases'
        ],
        handsOnOutput: 'Hands-on Output: Deployed Custom Research/Support Assistant',
        toolsUsed: ['OpenAI Custom GPTs', 'Claude Projects']
      },
      {
        order: 4,
        moduleName: 'Module 4: Creative AI & Multimodal Generation',
        duration: '75 mins',
        topics: [
          'Text-to-image prompt syntax: lighting, camera angle, medium, and aspect ratio',
          'Creating cohesive brand assets and storyboard panels without erratic styles',
          'Audio synthesis and speech generation fundamentals',
          'Ethical guidelines, watermark disclosure, and copyright considerations'
        ],
        handsOnOutput: 'Hands-on Output: High-Fidelity 4-Panel Commercial Storyboard',
        toolsUsed: ['Midjourney / Ideogram', 'ElevenLabs (Optional Demo)']
      }
    ]
  },
  {
    dayNumber: 2,
    title: 'Day 2 — Prototyping, Automation & Capstone Showcase',
    subtitle: 'From concept to interactive prototypes, webhook pipelines, and live deployment.',
    scheduleTime: '5 Hours Live (Live Coding + Project Clinic)',
    modules: [
      {
        order: 5,
        moduleName: 'Module 5: AI-Assisted Rapid App & Prototype Creation',
        duration: '90 mins',
        topics: [
          'Drafting comprehensive Product Requirements Documents (PRD) using AI',
          'Translating design wireframes into clean React and Tailwind CSS components',
          'Pair programming with AI coding assistants: debugging, refactoring, and logic flow',
          'One-click cloud deployment for instant user testing'
        ],
        handsOnOutput: 'Hands-on Output: Functional Interactive Web Application Mockup',
        toolsUsed: ['v0.dev / Bolt.new', 'Claude Artifacts', 'GitHub / Netlify']
      },
      {
        order: 6,
        moduleName: 'Module 6: No-Code & Low-Code Workflow Automation',
        duration: '90 mins',
        topics: [
          'Core automation concepts: Triggers, Webhooks, Filters, and Actions',
          'Building AI-augmented pipelines: Ingest form → Summarize with LLM → Update Sheet → Send Email',
          'Handling API rate limits, error loops, and conditional fallbacks',
          'Scheduling recurring autonomous research digests'
        ],
        handsOnOutput: 'Hands-on Output: End-to-End Automated Customer Lead Intake System',
        toolsUsed: ['Make.com / n8n', 'Zapier', 'Google Sheets / Airtable']
      },
      {
        order: 7,
        moduleName: 'Module 7: Capstone Review, Portfolio Clinic & Next Steps',
        duration: '60 mins',
        topics: [
          'Live project showcase and peer review clinic',
          'Packaging bootcamp deliverables into an employer-ready AI portfolio',
          'Continuous learning roadmap: Local models, Ollama, API agents, and MCP',
          'Certificate eligibility verification and alumni network orientation'
        ],
        handsOnOutput: 'Hands-on Output: Completed Capstone Project & Verified Certificate',
        toolsUsed: ['AI Launchpad LMS', 'GitHub', 'LinkedIn Credential Portal']
      }
    ]
  }
];

export const AI_TOOLS_DATA: AITool[] = [
  {
    name: 'Claude 3.5 Sonnet',
    category: 'LLMs & Reasoning',
    description: 'Premier model for structured coding, nuanced copy, and interactive Artifacts.',
    accessTier: 'Free Available',
    icon: 'Brain'
  },
  {
    name: 'ChatGPT-4o',
    category: 'LLMs & Reasoning',
    description: 'Omni-modal powerhouse for reasoning, voice dialog, and web research.',
    accessTier: 'Free Available',
    icon: 'MessageSquare'
  },
  {
    name: 'v0 by Vercel',
    category: 'Code & Prototype',
    description: 'Generative UI system rendering production-ready React and Tailwind components.',
    accessTier: 'Freemium / Free Trial',
    icon: 'Code'
  },
  {
    name: 'Midjourney / Ideogram',
    category: 'Creative & Media',
    description: 'High-fidelity visual synthesis and typography-accurate graphic generation.',
    accessTier: 'Subscription Optional',
    icon: 'Image'
  },
  {
    name: 'Make.com / n8n',
    category: 'Workflow & Automation',
    description: 'Visual workflow builder connecting AI models to hundreds of SaaS APIs.',
    accessTier: 'Free Available',
    icon: 'Workflow'
  },
  {
    name: 'Perplexity AI',
    category: 'LLMs & Reasoning',
    description: 'Real-time cited knowledge engine for deep research and competitive audits.',
    accessTier: 'Free Available',
    icon: 'Search'
  }
];

export const MENTORS_DATA: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Vikram Malhotra',
    role: 'Staff AI Engineer & Former ML Lead',
    company: 'Ex-Tech Unicorn • AI Consultant',
    bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals in practical AI adoption.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    expertise: ['Prompt Architecture', 'Autonomous Agents', 'Product Prototyping'],
    linkedinUrl: '#',
    isVerified: true
  },
  {
    id: 'mentor-2',
    name: 'Ananya Sharma',
    role: 'Head of Product Design & AI Workflows',
    company: 'SaaS Studio • Creative Director',
    bio: 'Specializes in human-AI interaction, generative UI, and multimodal creative automation. Passionate about empowering non-technical builders with AI superpowers.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    expertise: ['Generative UI', 'Creative AI Storyboards', 'No-Code Automation'],
    linkedinUrl: '#',
    isVerified: true
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Karthik Ramanathan',
    role: 'Senior Product Manager',
    company: 'Fintech Scaleup',
    cohort: 'October 2026 Batch',
    quote: 'Before this bootcamp, AI was just a chatbot I asked occasional questions to. By Sunday afternoon, I had built a custom internal research assistant and automated my weekly sprint summaries. Incredible ROI.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verifiedAttendee: true
  },
  {
    id: 'test-2',
    name: 'Pooja Deshmukh',
    role: 'Founder & Brand Strategist',
    company: 'Studio Lumos',
    cohort: 'October 2026 Batch',
    quote: 'The hands-on pace was phenomenal. No academic fluff or confusing math. We literally built something tangible in every single module. The prompt engineering framework alone saved me 15 hours this past week.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    verifiedAttendee: true
  },
  {
    id: 'test-3',
    name: 'Rohit Kulkarni',
    role: 'Full-Stack Developer',
    company: 'Enterprise Cloud',
    cohort: 'September 2026 Batch',
    quote: 'As a developer, I was skeptical about whether a 2-day workshop could teach me anything new. Module 5 and 6 on AI-driven rapid prototyping and n8n webhooks completely revamped how I deliver client MVPs.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    verifiedAttendee: true
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'Do I need prior programming or mathematical experience to attend?',
    answer: 'No coding experience is required. The curriculum is intentionally designed for working professionals, founders, creators, and students. We focus on natural language prompt architecture, visual workflow builders, and AI-assisted prototyping tools that require zero syntax memorization.'
  },
  {
    id: 'faq-2',
    category: 'Logistics',
    question: 'What are the workshop timings and where is it held?',
    answer: 'The bootcamp is 100% live and online over Saturday and Sunday, running from 10:00 AM to 3:00 PM IST on both days. Sessions take place in an interactive virtual classroom with live screen-sharing, guided lab exercises, and continuous Q&A support.'
  },
  {
    id: 'faq-3',
    category: 'Curriculum',
    question: 'Will I get access to session recordings and workshop materials?',
    answer: 'Yes! All confirmed registrants receive lifetime access to the recorded live sessions, downloadable prompt template packs, project starter repositories, and step-by-step automation guides via our Learner Portal.'
  },
  {
    id: 'faq-4',
    category: 'General',
    question: 'Do I need to buy expensive paid subscriptions to AI tools?',
    answer: 'No. All exercises can be completed using free tiers or free trial access of the recommended tools (Claude, ChatGPT, Make.com, v0). We transparently disclose any optional tool upgrades in advance and demonstrate free alternative equivalents.'
  },
  {
    id: 'faq-5',
    category: 'Pricing & Policy',
    question: 'How do certificates work? Is the certificate verifiable?',
    answer: 'Upon completing Day 1 and Day 2 exercises and submitting the capstone deliverable, an official AI Launchpad Certificate of Completion is issued. Each certificate features a unique cryptographic serial number and QR code verifiable on our public verification portal.'
  },
  {
    id: 'faq-6',
    category: 'Pricing & Policy',
    question: 'What is the refund and cancellation policy?',
    answer: 'We provide a transparent 100% money-back guarantee if you submit a cancellation request at least 24 hours prior to the Day 1 batch start time. If you attend Day 1 and feel the bootcamp did not deliver practical value, notify our support team before Day 2 for a full refund.'
  }
];
