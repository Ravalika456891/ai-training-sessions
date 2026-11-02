import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { BenefitsSection } from './components/sections/BenefitsSection';
import { CurriculumSection } from './components/sections/CurriculumSection';
import { AIToolsSection } from './components/sections/AIToolsSection';
import { MentorSection } from './components/sections/MentorSection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { PricingSection } from './components/sections/PricingSection';
import { RegistrationSection } from './components/sections/RegistrationSection';
import { FAQSection } from './components/sections/FAQSection';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { LearnerDashboardModal } from './components/learner/LearnerDashboardModal';
import { AdminConsoleModal } from './components/admin/AdminConsoleModal';
import { CertificateVerifyModal } from './components/certificate/CertificateVerifyModal';
import { BATCH_OPTIONS } from './data/workshopData';
import { ArrowRight, X } from 'lucide-react';
import { Button } from './components/common/Button';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, type ApiWorkshop } from './services/api';
import type { BatchOption } from './types/workshop';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchOption[]>(BATCH_OPTIONS);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(BATCH_OPTIONS[0].id);
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
  const [backendSynced, setBackendSynced] = useState<boolean>(false);
  const [activeCheckoutEnrollmentId, setActiveCheckoutEnrollmentId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLearnerDashboardOpen, setIsLearnerDashboardOpen] = useState<boolean>(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [verifySerial, setVerifySerial] = useState<string>('');

  // Fetch real workshop batches from MongoDB Atlas API on load
  useEffect(() => {
    let isMounted = true;
    api
      .getWorkshops()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data && res.data.length > 0) {
          const apiBatches: BatchOption[] = res.data.map((w: ApiWorkshop) => ({
            id: w._id,
            batchCode: w.batchCode,
            dateRange: `${new Date(w.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} – ${new Date(w.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`,
            days: 'Saturday & Sunday',
            timings: w.timings || '10:00 AM – 3:00 PM IST',
            timezone: w.timezone || 'Asia/Kolkata (IST)',
            totalSeats: w.capacity,
            availableSeats: w.availableSeats,
            status: w.availableSeats <= 5 ? 'Filling Fast' : 'Open',
            pricing: {
              basePrice: w.price.basePrice,
              currency: w.price.currency || 'INR',
              taxPercentage: w.price.taxPercentage || 18,
            },
          }));
          setBatches(apiBatches);
          setSelectedBatchId(apiBatches[0].id);
          setBackendSynced(true);
        }
      })
      .catch(() => {
        // Keeps BATCH_OPTIONS fallback if backend API is booting up
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToRegister = () => {
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCurriculum = () => {
    const element = document.getElementById('curriculum');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBatchAndProceed = (batchId: string) => {
    setSelectedBatchId(batchId);
    scrollToRegister();
  };

  const currentNextBatch = batches[0] || BATCH_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-brand-violet selection:text-white relative">
      {/* Ambient Global Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[650px] h-[450px] bg-gradient-to-br from-violet-600/12 to-indigo-600/6 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-1/4 w-[550px] h-[450px] bg-gradient-to-bl from-cyan-500/10 to-blue-600/6 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* High-Converting Promotional Announcement Banner */}
      {showSampleBanner && (
        <aside
          aria-label="Upcoming Cohort Announcement"
          className="bg-gradient-to-r from-violet-900/60 via-indigo-900/50 to-cyan-900/60 border-b border-indigo-500/20 py-2.5 px-4 text-xs text-slate-200 backdrop-blur-md relative z-50 shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap mx-auto text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                <span className={`w-1.5 h-1.5 rounded-full ${backendSynced ? 'bg-emerald-400' : 'bg-brand-cyan'} animate-pulse`} />
                Live Cohort Open
              </span>
              <p className="font-medium text-slate-200">
                <strong>Next Weekend Masterclass:</strong> Limited to 25 learners per cohort for personalized code reviews & labs.
              </p>
              {user && (
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30">
                  Signed in: {user.name} ({user.role})
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSampleBanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 1. Sticky Navigation Bar */}
      <Navbar
        onRegisterClick={scrollToRegister}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLearnerDashboard={() => setIsLearnerDashboardOpen(true)}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
        onOpenVerifyModal={() => {
          setVerifySerial('');
          setIsVerifyModalOpen(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection
          onRegisterClick={scrollToRegister}
          onExploreCurriculum={scrollToCurriculum}
          batch={currentNextBatch}
        />

        {/* 3. Learning Outcomes & Audience Fit */}
        <BenefitsSection onRegisterClick={scrollToRegister} />

        {/* 4. Interactive 2-Day Curriculum (Day 1 / Day 2 Tabs) */}
        <CurriculumSection onRegisterClick={scrollToRegister} />

        {/* 5. AI Tools Showcase & Transparent Caveats */}
        <AIToolsSection />

        {/* 6. Mentors & Direct Instructors */}
        <MentorSection onRegisterClick={scrollToRegister} />

        {/* 7. Verified Reviews & Testimonials */}
        <TestimonialsSection />

        {/* 8. Transparent Pricing & Cohort Selector */}
        <PricingSection
          selectedBatchId={selectedBatchId}
          onSelectBatch={handleSelectBatchAndProceed}
          onProceedToRegister={scrollToRegister}
        />

        {/* 9. Direct Enrollment & Registration Form (Backend Connected) */}
        <RegistrationSection
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          batches={batches}
          onOpenCheckout={(enrollmentId) => setActiveCheckoutEnrollmentId(enrollmentId)}
        />

        {/* 10. FAQ Accordion */}
        <FAQSection />
      </main>

      {/* 11. Razorpay Secure Checkout Modal */}
      <CheckoutModal
        isOpen={Boolean(activeCheckoutEnrollmentId)}
        enrollmentId={activeCheckoutEnrollmentId || ''}
        onClose={() => setActiveCheckoutEnrollmentId(null)}
      />

      {/* 12. Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 13. Learner Self-Service Dashboard Modal */}
      <LearnerDashboardModal
        isOpen={isLearnerDashboardOpen}
        onClose={() => setIsLearnerDashboardOpen(false)}
        onOpenCertificateVerify={(serial) => {
          setIsLearnerDashboardOpen(false);
          setVerifySerial(serial);
          setIsVerifyModalOpen(true);
        }}
      />

      {/* 14. Admin Operations Console */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        workshops={batches}
      />

      {/* 15. Public Certificate Verification Modal */}
      <CertificateVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialSerial={verifySerial}
      />

      {/* 12. Footer */}
      <Footer />

      {/* Mobile Sticky Register Pill (Floating on mobile viewports) */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="p-2.5 rounded-2xl bg-navy-900/95 backdrop-blur-lg border border-indigo-500/30 shadow-2xl flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              Next Cohort:{' '}
              <span className="text-white font-bold">
                {currentNextBatch.dateRange.split('–')[0]}
              </span>
            </div>
            <div className="text-xs font-black text-emerald-400">
              ₹{currentNextBatch.pricing.basePrice}{' '}
              <span className="text-[10px] text-slate-400 font-normal">+ GST</span>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={scrollToRegister}
            className="text-xs py-2 px-4 shadow-lg shadow-indigo-600/30"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Claim Seat
          </Button>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
