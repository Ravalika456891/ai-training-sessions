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
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { api, type ApiWorkshop } from '../../services/api';
import type { BatchOption } from '../../types/workshop';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchOption[]>(BATCH_OPTIONS);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(BATCH_OPTIONS[0].id);
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
  const [activeCheckoutEnrollmentId, setActiveCheckoutEnrollmentId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [verifySerial] = useState<string>('');

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
        }
      })
      .catch(() => {});

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* High-Converting Clean Announcement Banner */}
      {showSampleBanner && (
        <aside
          aria-label="Upcoming Cohort Announcement"
          className="bg-slate-50 border-b border-slate-200 py-2 px-4 text-xs text-slate-600 relative z-50 shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <p className="font-medium text-[#0F172A] truncate">
                Upcoming Cohort Starting{' '}
                <span className="font-bold text-blue-700">{currentNextBatch.dateRange}</span> • Strictly Capped at 60 Seats
              </p>
              {user && (
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                  Signed in: {user.name} ({user.role})
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSampleBanner(false)}
              className="text-slate-400 hover:text-[#0F172A] p-1 rounded transition-colors shrink-0 cursor-pointer"
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

        {/* 4. Interactive 2-Day Curriculum */}
        <CurriculumSection onRegisterClick={scrollToRegister} />

        {/* 5. Production AI Tools & Stack */}
        <AIToolsSection />

        {/* 6. Lead Instructors & Industry Credentials */}
        <MentorSection onRegisterClick={scrollToRegister} />

        {/* 7. Student Testimonials */}
        <TestimonialsSection />

        {/* 8. Transparent Pricing & Cohort Selector */}
        <PricingSection
          selectedBatchId={selectedBatchId}
          onSelectBatch={handleSelectBatchAndProceed}
          onProceedToRegister={scrollToRegister}
        />

        {/* 9. Live Registration Form */}
        <RegistrationSection
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          onOpenCheckout={(enrollmentId: string) => {
            setActiveCheckoutEnrollmentId(enrollmentId);
          }}
        />

        {/* 10. Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* 11. Footer */}
      <Footer />

      {/* 12. Checkout & Payment Modal */}
      {activeCheckoutEnrollmentId && (
        <CheckoutModal
          isOpen={Boolean(activeCheckoutEnrollmentId)}
          onClose={() => setActiveCheckoutEnrollmentId(null)}
          enrollmentId={activeCheckoutEnrollmentId}
          onPaymentSuccess={() => {
            navigate('/dashboard/workshops');
          }}
        />
      )}

      {/* 13. Interactive Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />

      {/* 14. Admin Operations Console Modal */}
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

      {/* Mobile Sticky Register Pill */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              Next Cohort:{' '}
              <span className="text-[#0F172A] font-bold">
                {currentNextBatch.dateRange.split('–')[0]}
              </span>
            </div>
            <div className="text-xs font-black text-blue-600">
              ₹{currentNextBatch.pricing.basePrice}{' '}
              <span className="text-[10px] text-slate-500 font-normal">+ GST</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={scrollToRegister}
            className="text-xs py-2 px-4"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Claim Seat
          </Button>
        </div>
      </div>
    </div>
  );
};
