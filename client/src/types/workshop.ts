export interface LearningOutcome {
  id: string;
  title: string;
  description: string;
  iconName: string;
  deliverable: string;
}

export interface CurriculumModule {
  order: number;
  moduleName: string;
  duration: string;
  topics: string[];
  handsOnOutput: string;
  toolsUsed: string[];
}

export interface CurriculumDay {
  dayNumber: number;
  title: string;
  subtitle: string;
  scheduleTime: string;
  modules: CurriculumModule[];
}

export interface AITool {
  name: string;
  category: 'LLMs & Reasoning' | 'Creative & Media' | 'Code & Prototype' | 'Workflow & Automation';
  description: string;
  accessTier: 'Free Available' | 'Freemium / Free Trial' | 'Subscription Optional';
  icon: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  avatarUrl: string;
  expertise: string[];
  linkedinUrl?: string;
  isVerified: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  cohort: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  verifiedAttendee: boolean;
}

export interface FAQItem {
  id: string;
  category: 'General' | 'Curriculum' | 'Logistics' | 'Pricing & Policy';
  question: string;
  answer: string;
}

export interface BatchOption {
  id: string;
  batchCode: string;
  dateRange: string;
  days: string;
  timings: string;
  timezone: string;
  totalSeats: number;
  availableSeats: number;
  status: 'Open' | 'Filling Fast' | 'Sold Out';
  pricing: {
    basePrice: number;
    currency: string;
    taxPercentage: number;
    earlyBirdDiscount?: number;
  };
}

export interface AudiencePersona {
  persona: string;
  tagline: string;
  painPoint: string;
  takeaway: string;
  iconName: string;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  userCategory: string;
  experienceLevel: string;
  selectedBatchId: string;
  acceptTerms: boolean;
  marketingConsent: boolean;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  userCategory?: string;
  selectedBatchId?: string;
  acceptTerms?: string;
}

