import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { HeroSection } from '../../components/sections/HeroSection';
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
import { BATCH_OPTIONS } from '../../data/workshopData';
import { ArrowRight, X } from 'lucide-react';
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
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
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
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-[#081e4a] selection:text-white relative">
      {/* Top Cohort & Signed-In Status Bar */}
      {showSampleBanner && (
        <aside
          aria-label="Upcoming Cohort Announcement"
          className="bg-[#081e4a] border-b border-white/10 py-2 px-4 text-xs text-blue-100 relative z-50"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="font-medium text-blue-100 truncate">
                Next Live Cohort:{' '}
                <span className="font-extrabold text-white">{currentNextBatch.dateRange}</span>
                <span className="hidden sm:inline"> • Limited to {currentNextBatch.totalSeats} Seats</span>
              </p>
              <button
                type="button"
                onClick={scrollToRegister}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] border border-white/20 transition-colors shrink-0 cursor-pointer"
              >
                <span>Reserve Seat</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              {user && (
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-md bg-white text-[#081e4a] font-bold text-[11px] shrink-0">
                  Signed in: {user.name} ({user.role})
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSampleBanner(false)}
              className="text-blue-200 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 1. Sticky Navigation Bar */}
      <Navbar
        onRegisterClick={scrollToRegister}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLearnerDashboard={() => navigate('/dashboard')}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
      />

      {/* Main Public Page Content */}
      <main className="flex-1 min-w-0">
        {/* 2. Hero Section */}
        <HeroSection
          onRegisterClick={scrollToRegister}
          onExploreCurriculum={scrollToCurriculum}
          batch={currentNextBatch}
        />

        {/* 3. Learning Outcomes & Beginner-Friendly Fit */}
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
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-blue-200/80 shadow-2xl shadow-blue-950/15 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-semibold truncate">
                {currentNextBatch.batchCode}:{' '}
                <span className="text-[#081e4a] font-bold">
                  {currentNextBatch.dateRange.split('–')[0]}
                </span>
              </div>
              <div className="text-sm font-black text-[#081e4a]">
                ₹{currentNextBatch.pricing.basePrice.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] text-slate-500 font-medium">+ 18% GST</span>
              </div>
            </div>
            <button
              onClick={scrollToRegister}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#081e4a] hover:bg-[#0c2d6e] text-white text-xs font-bold shadow-md shadow-[#081e4a]/20 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
