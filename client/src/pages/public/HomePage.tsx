import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { HeroSection } from '../../components/sections/HeroSection';
import { BenefitsSection } from '../../components/sections/BenefitsSection';
import { CurriculumSection } from '../../components/sections/CurriculumSection';
import { AIToolsSection } from '../../components/sections/AIToolsSection';
import { MentorSection } from '../../components/sections/MentorSection';
import { PricingSection } from '../../components/sections/PricingSection';
import { RegistrationSection } from '../../components/sections/RegistrationSection';
import { FAQSection } from '../../components/sections/FAQSection';
import { CheckoutModal } from '../../components/checkout/CheckoutModal';
import { AuthModal } from '../../components/auth/AuthModal';
import { AdminConsoleModal } from '../../components/admin/AdminConsoleModal';
import { CertificateVerifyModal } from '../../components/certificate/CertificateVerifyModal';
import { BATCH_OPTIONS } from '../../data/workshopData';
import { ArrowRight, X } from 'lucide-react';
import '../../styles/3dBackground.css';
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
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-blue-600 selection:text-white relative body-3d">
      {/* Top Cohort & Signed-In Status Bar */}
      {showSampleBanner && (
        <aside
          aria-label="Upcoming Cohort Announcement"
          className="bg-blue-50/80 border-b border-blue-100 py-2 px-4 text-xs text-slate-700 relative z-50"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <p className="font-medium text-slate-700 truncate">
                Next Live Cohort:{' '}
                <span className="font-bold text-blue-700">{currentNextBatch.dateRange}</span> • Limited to{' '}
                {currentNextBatch.totalSeats} Seats
              </p>
              {user && (
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-md bg-white text-blue-700 font-semibold text-[11px] border border-blue-200">
                  Signed in: {user.name} ({user.role})
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSampleBanner(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors shrink-0 cursor-pointer"
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
      <main className="flex-1">
        {/* 2. Hero Section (Dark Navy & Purple) */}
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

        {/* 7. Transparent Pricing & Batch Selector */}
        <PricingSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={handleSelectBatchAndProceed}
          onProceedToRegister={scrollToRegister}
        />

        {/* 8. Smart Workshop Registration & Account Continuation */}
        <RegistrationSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={updateSelectedBatch}
          onOpenCheckout={(enrollmentId: string) => {
            setActiveCheckoutEnrollmentId(enrollmentId);
          }}
        />

        {/* 9. Frequently Asked Questions */}
        <FAQSection />
      </main>

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
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
          <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentNextBatch.batchCode}:{' '}
                <span className="text-[#0F172A] font-bold">
                  {currentNextBatch.dateRange.split('–')[0]}
                </span>
              </div>
              <div className="text-sm font-black text-blue-600">
                ₹{currentNextBatch.pricing.basePrice.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] text-slate-500 font-normal">+ 18% GST</span>
              </div>
            </div>
            <button
              onClick={scrollToRegister}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
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
