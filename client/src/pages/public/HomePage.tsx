import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { HeroSection } from '../../components/sections/HeroSection';
import { WelcomeSection } from '../../components/sections/WelcomeSection';
import { BenefitsSection } from '../../components/sections/BenefitsSection';
import { CurriculumSection } from '../../components/sections/CurriculumSection';
import { AIToolsSection } from '../../components/sections/AIToolsSection';
import { MentorSection } from '../../components/sections/MentorSection';
import { TestimonialsSection } from '../../components/sections/TestimonialsSection';
import { PricingSection } from '../../components/sections/PricingSection';
import { RegistrationSection } from '../../components/sections/RegistrationSection';
import { FAQSection } from '../../components/sections/FAQSection';
import { CheckoutModal } from '../../components/checkout/CheckoutModal';
import { AuthModal } from '../../components/auth/AuthModal';
import { AdminConsoleModal } from '../../components/admin/AdminConsoleModal';
import { CertificateVerifyModal } from '../../components/certificate/CertificateVerifyModal';
import { BATCH_OPTIONS, WORKSHOP_CONFIG } from '../../data/workshopData';
import { ArrowRight, Clock, Mail, ShieldCheck, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, type ApiWorkshop } from '../../services/api';
import type { BatchOption } from '../../types/workshop';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get('batch');
  const [batches, setBatches] = useState<BatchOption[]>(BATCH_OPTIONS);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    () => batchFromUrl || sessionStorage.getItem('ailp_selected_batch') || BATCH_OPTIONS[0].id
  );
  const [activeCheckoutEnrollmentId, setActiveCheckoutEnrollmentId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [verifySerial] = useState<string>('');

  const updateSelectedBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    sessionStorage.setItem('ailp_selected_batch', batchId);
  };

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
          const savedBatch = batchFromUrl || sessionStorage.getItem('ailp_selected_batch');
          const matchedBatch = savedBatch
            ? apiBatches.find((b) => b.id === savedBatch || b.batchCode === savedBatch)
            : null;
          const nextId = matchedBatch ? matchedBatch.id : apiBatches[0].id;
          setSelectedBatchId(nextId);
          sessionStorage.setItem('ailp_selected_batch', nextId);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [batchFromUrl]);

  const scrollToRegister = () => {
    sessionStorage.setItem('ailp_selected_batch', selectedBatchId);
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
    updateSelectedBatch(batchId);
    scrollToRegister();
  };

  const currentNextBatch =
    batches.find((b) => b.id === selectedBatchId) || batches[0] || BATCH_OPTIONS[0];

  return (
    <div className="min-h-screen bg-white text-[#1E293B] flex flex-col font-sans selection:bg-[#1F386B] selection:text-white relative">
      {/* IIEM-Style Crimson Top Institutional Utility Bar */}
      <aside
        aria-label="Training Utility & Verification Bar"
        className="bg-[#E41937] text-white text-xs relative z-50 border-b border-white/15"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/95">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Sat &amp; Sun • 10:00 AM – 3:00 PM IST</span>
            </span>
            <a
              href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
              className="hidden md:inline-flex items-center gap-1.5 font-medium hover:underline text-white/95"
            >
              <Mail className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{WORKSHOP_CONFIG.supportEmail}</span>
            </a>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/15 text-white font-semibold">
              Next Cohort: {currentNextBatch.dateRange}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-white hover:text-blue-100 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Online Verification</span>
            </button>
            <span className="text-white/40 hidden sm:inline">|</span>
            <a
              href="#pricing"
              className="text-white hover:text-blue-100 transition-colors"
            >
              Cohort Status
            </a>
            <span className="text-white/40 hidden sm:inline">|</span>
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1F386B] hover:bg-[#192e57] text-white font-bold transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{user.name} ({user.role})</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 text-white hover:text-blue-100 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#1F386B] hover:bg-[#192e57] text-white font-bold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 1. Sticky Navigation Bar */}
      <Navbar
        onRegisterClick={scrollToRegister}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLearnerDashboard={() => navigate('/dashboard')}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
      />

      {/* Main Public Page Content */}
      <main className="flex-1 min-w-0">
        {/* 2. Hero Section + Overlapping 4-Card Navy Action Strip */}
        <HeroSection
          onRegisterClick={scrollToRegister}
          onExploreCurriculum={scrollToCurriculum}
          batch={currentNextBatch}
        />

        {/* 3. IIEM Split Welcome Overview + Quick Cohort Admission Box */}
        <WelcomeSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={updateSelectedBatch}
          onRegisterClick={scrollToRegister}
          onExploreCurriculum={scrollToCurriculum}
        />

        {/* 4. Learning Outcomes (Why Choose Us) & Audience Switcher */}
        <BenefitsSection onRegisterClick={scrollToRegister} />

        {/* 4. Day 1 & Day 2 Curriculum */}
        <CurriculumSection onRegisterClick={scrollToRegister} />

        {/* 5. Practical AI Tools Covered */}
        <AIToolsSection />

        {/* 6. Instructor Details */}
        <MentorSection onRegisterClick={scrollToRegister} />

        {/* 7. Alumni Outcomes & Reviews */}
        <TestimonialsSection />

        {/* 8. Transparent Pricing & Batch Selector */}
        <PricingSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={handleSelectBatchAndProceed}
          onProceedToRegister={scrollToRegister}
        />

        {/* 9. Smart Workshop Registration & Account Continuation */}
        <RegistrationSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={updateSelectedBatch}
          onOpenCheckout={(enrollmentId: string) => {
            setActiveCheckoutEnrollmentId(enrollmentId);
          }}
        />

        {/* 10. Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* 11. Site Footer */}
      <Footer
        onRegisterClick={scrollToRegister}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
      />

      {/* 11. Checkout & Payment Modal */}
      {activeCheckoutEnrollmentId && (
        <CheckoutModal
          isOpen={Boolean(activeCheckoutEnrollmentId)}
          onClose={() => setActiveCheckoutEnrollmentId(null)}
          enrollmentId={activeCheckoutEnrollmentId}
          onPaymentSuccess={() => {
            setActiveCheckoutEnrollmentId(null);
            navigate('/dashboard');
          }}
        />
      )}

      {/* 12. Interactive Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />

      {/* 13. Admin Operations Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        workshops={batches}
      />

      {/* 14. Public Certificate Verification Modal */}
      <CertificateVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialSerial={verifySerial}
      />

      {/* Mobile Sticky Register Pill for Guests */}
      {!user && (
        <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40">
          <div className="p-3 rounded-lg bg-[#1F386B]/95 backdrop-blur-md border border-white/15 border-b-2 border-b-[#E41937] shadow-2xl shadow-blue-950/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-blue-100 font-semibold truncate">
                {currentNextBatch.batchCode}:{' '}
                <span className="text-white font-bold">
                  {currentNextBatch.dateRange.split('–')[0]}
                </span>
              </div>
              <div className="text-sm font-black text-white">
                ₹{currentNextBatch.pricing.basePrice.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] text-blue-200 font-medium">+ 18% GST</span>
              </div>
            </div>
            <button
              onClick={scrollToRegister}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-md bg-[#E41937] hover:bg-[#c5122d] text-white text-xs font-extrabold uppercase tracking-wide shadow-md cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
