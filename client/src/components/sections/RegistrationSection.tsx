import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  LogIn,
  CreditCard,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SelectDropdown, type SelectDropdownOption } from '../ui/SelectDropdown';
import { MotionReveal } from '../ui/MotionPrimitives';
import { BATCH_OPTIONS } from '../../data/workshopData';
import { api } from '../../services/api';
import type { RegistrationFormData, FormErrors, BatchOption } from '../../types/workshop';
import { useAuth } from '../../context/AuthContext';

interface RegistrationSectionProps {
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  batches?: BatchOption[];
  onOpenCheckout?: (enrollmentId: string) => void;
}

const COUNTRY_CODE_OPTIONS: SelectDropdownOption[] = [
  { value: '+91', label: '🇮🇳 +91', sublabel: 'India' },
  { value: '+1', label: '🇺🇸 +1', sublabel: 'United States' },
  { value: '+44', label: '🇬🇧 +44', sublabel: 'United Kingdom' },
  { value: '+65', label: '🇸🇬 +65', sublabel: 'Singapore' },
  { value: '+971', label: '🇦🇪 +971', sublabel: 'UAE' },
];

const BACKGROUND_OPTIONS: SelectDropdownOption[] = [
  { value: 'working_professional', label: 'Working Professional', sublabel: 'Product, Ops, Marketing, or Tech teams' },
  { value: 'student', label: 'Student / Graduate', sublabel: 'College learners & early-career builders' },
  { value: 'founder', label: 'Founder / Business Owner', sublabel: 'Scaling operations with AI automations' },
  { value: 'creator', label: 'Creator / Consultant', sublabel: 'Freelancers & independent advisors' },
  { value: 'other', label: 'Other', sublabel: 'Exploring AI tools & workflows' },
];

const EXPERIENCE_OPTIONS: SelectDropdownOption[] = [
  { value: 'beginner', label: 'Beginner', sublabel: 'New to AI prompts & automation tools' },
  { value: 'intermediate', label: 'Intermediate', sublabel: 'Use ChatGPT / Claude regularly' },
  { value: 'advanced', label: 'Advanced', sublabel: 'Familiar with workflows & APIs' },
];

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  selectedBatchId,
  onSelectBatch,
  batches = BATCH_OPTIONS,
  onOpenCheckout,
}) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneCountryCode: user?.phone?.countryCode || '+91',
    phoneNumber: (user?.phone?.number || '').replace(/\D/g, ''),
    userCategory: (user?.userCategory as any) || 'working_professional',
    experienceLevel: (user?.experienceLevel as any) || 'beginner',
    selectedBatchId: selectedBatchId || batches[0]?.id || BATCH_OPTIONS[0].id,
    acceptTerms: false,
    marketingConsent: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [enrollmentSummary, setEnrollmentSummary] = useState<any | null>(null);

  React.useEffect(() => {
    if (selectedBatchId) {
      setFormData((prev) => ({ ...prev, selectedBatchId }));
      sessionStorage.setItem('ailp_selected_batch', selectedBatchId);
    }
  }, [selectedBatchId]);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phoneCountryCode: user.phone?.countryCode || prev.phoneCountryCode,
        phoneNumber: (user.phone?.number || prev.phoneNumber || '').replace(/\D/g, ''),
      }));
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 7) {
      newErrors.phoneNumber = 'Please enter a valid mobile number (at least 7 digits)';
    }

    if (!formData.selectedBatchId) {
      newErrors.selectedBatchId = 'Please select a workshop cohort';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Please accept the Terms of Service and Refund Policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    sessionStorage.setItem('ailp_selected_batch', formData.selectedBatchId);

    setIsSubmitting(true);
    try {
      const response = await api.createEnrollment(formData);

      if (response.success && response.data) {
        await refreshUser();
        setEnrollmentSummary(response.data);

        if (response.data.paymentRequired && onOpenCheckout && response.data.enrollment?.enrollmentId) {
          onOpenCheckout(response.data.enrollment.enrollmentId);
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'Enrollment could not be completed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBatch =
    batches.find((b) => b.id === formData.selectedBatchId || b.batchCode === formData.selectedBatchId) ||
    batches[0] ||
    BATCH_OPTIONS[0];

  const basePrice = selectedBatch.pricing.basePrice;
  const gstAmount = Math.round(basePrice * ((selectedBatch.pricing.taxPercentage || 18) / 100));
  const totalPayable = basePrice + gstAmount;

  const batchDropdownOptions: SelectDropdownOption[] = batches.map((batch) => ({
    value: batch.id,
    label: `${batch.batchCode} • ${batch.dateRange}`,
    sublabel: `${batch.days} • ${batch.timings}`,
    badge: `${batch.availableSeats} seats open`,
    rightPrimary: `₹${batch.pricing.basePrice.toLocaleString('en-IN')}`,
    rightSecondary: '+ 18% GST',
    icon: <Calendar className="w-4 h-4" />,
  }));

  return (
    <section id="register" className="py-16 sm:py-20 bg-white relative scroll-mt-20 border-b border-slate-200/80 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
            ONLINE <span className="text-[#E41937]">REGISTRATION</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            Pick your weekend cohort from the dropdown menu and fill in your participant details to continue to verified Razorpay checkout.
          </p>
        </MotionReveal>

        <MotionReveal className="mt-10 max-w-5xl mx-auto">
          <Card glow accentTop className="p-0 border-slate-200/90 bg-white shadow-xl shadow-[#1F386B]/10 overflow-hidden">
            {!user && (
              <div className="px-5 sm:px-9 py-4 sm:py-5 bg-[#1F386B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E41937]">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 text-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-blue-100 uppercase tracking-wider">
                      Smart Workshop Preservation
                    </div>
                    <p className="text-xs text-blue-100/95 mt-0.5">
                      Selected Cohort: <strong className="text-white">{selectedBatch.batchCode}</strong> ({selectedBatch.dateRange}). Sign in or create an account, or complete enrollment below.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to={`/signin?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                    onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-100" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to={`/signup?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                    onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-xs font-extrabold text-[#081e4a] shadow-sm transition-all"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-10">
              {enrollmentSummary ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <Badge variant="success" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
                      {enrollmentSummary.paymentRequired
                        ? 'Step 1 Complete — Seat Reserved'
                        : 'Official Enrollment Confirmed'}
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                      Welcome, {enrollmentSummary.user?.name || formData.fullName}!
                    </h3>
                    <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
                      {enrollmentSummary.paymentRequired
                        ? 'Your workshop seat is reserved for 15 minutes. Complete your verified payment to unlock live classroom access and learning materials.'
                        : 'Your workshop enrollment is confirmed! Open your student dashboard to access your schedule and materials.'}
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-xl mx-auto space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-500">Enrollment ID</span>
                        <div className="text-base sm:text-lg font-mono font-bold text-[#081e4a]">
                          {enrollmentSummary.enrollment?.enrollmentId}
                        </div>
                      </div>
                      <Badge variant="primary" size="md">
                        {enrollmentSummary.paymentRequired ? 'PAYMENT PENDING' : 'CONFIRMED'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Selected Cohort:</span>
                        <span className="text-[#0F172A] font-semibold">{selectedBatch.batchCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Schedule:</span>
                        <span className="text-[#0F172A] font-semibold">
                          {selectedBatch.dateRange} • {selectedBatch.timings}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    {enrollmentSummary.paymentRequired && onOpenCheckout && (
                      <Button
                        variant="gradient"
                        size="md"
                        onClick={() => onOpenCheckout(enrollmentSummary.enrollment.enrollmentId)}
                        rightIcon={<CreditCard className="w-4 h-4" />}
                      >
                        Complete Payment (₹{totalPayable.toLocaleString('en-IN')})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => navigate('/dashboard')}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Go to My Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {serverError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Enrollment Issue:</strong>
                        <span>{serverError}</span>
                      </div>
                    </div>
                  )}

                  {/* 1. Workshop Session Dropdown Selector (Replaces Radio Card Selection) */}
                  <SelectDropdown
                    label="1. Select Workshop Session"
                    required
                    hintRight={`${batches.length} Session${batches.length > 1 ? 's' : ''} Available`}
                    icon={<Calendar className="w-4 h-4" />}
                    variant="rich"
                    value={selectedBatch.id}
                    onValueChange={(batchId) => {
                      setFormData((prev) => ({ ...prev, selectedBatchId: batchId }));
                      onSelectBatch(batchId);
                    }}
                    options={batchDropdownOptions}
                    placeholder="Choose your training cohort..."
                    error={errors.selectedBatchId}
                  />

                  {/* 2. Participant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#081e4a]" />
                        <span>Full Name</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Rajesh Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full h-[46px] bg-white border ${
                          errors.fullName ? 'border-rose-400' : 'border-slate-200'
                        } rounded-xl px-4 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#081e4a]/15 focus:border-[#081e4a] shadow-sm transition-all`}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#081e4a]" />
                        <span>Email Address</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-[46px] bg-white border ${
                          errors.email ? 'border-rose-400' : 'border-slate-200'
                        } rounded-xl px-4 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#081e4a]/15 focus:border-[#081e4a] shadow-sm transition-all`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Unified Phone Row with Radix Dial Code Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#081e4a]" />
                        <span>Mobile Number</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-stretch gap-2">
                        <div className="w-[108px] shrink-0">
                          <SelectDropdown
                            ariaLabel="Country code"
                            variant="compact"
                            value={formData.phoneCountryCode}
                            onValueChange={(val) => setFormData({ ...formData, phoneCountryCode: val })}
                            options={COUNTRY_CODE_OPTIONS}
                            triggerClassName="h-[46px] min-h-[46px] bg-slate-50/70"
                          />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="tel-national"
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                            })
                          }
                          className={`flex-1 min-w-0 h-[46px] bg-white border ${
                            errors.phoneNumber ? 'border-rose-400' : 'border-slate-200'
                          } rounded-xl px-3.5 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#081e4a]/15 focus:border-[#081e4a] shadow-sm transition-all`}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* Background Role Dropdown */}
                    <SelectDropdown
                      label="Your Background"
                      icon={<Briefcase className="w-3.5 h-3.5" />}
                      value={formData.userCategory}
                      onValueChange={(val) => setFormData({ ...formData, userCategory: val })}
                      options={BACKGROUND_OPTIONS}
                      triggerClassName="h-[46px] min-h-[46px]"
                    />
                  </div>

                  {/* 3. Experience Level Dropdown + Transparent Pricing Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start pt-1">
                    <SelectDropdown
                      label="AI Experience Level"
                      icon={<Layers className="w-3.5 h-3.5" />}
                      value={formData.experienceLevel}
                      onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                      options={EXPERIENCE_OPTIONS}
                      triggerClassName="h-[46px] min-h-[46px]"
                    />

                    <div className="p-4 sm:p-5 rounded-lg bg-[#F7F8FA] border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Workshop Tuition ({selectedBatch.batchCode})</span>
                        <span className="font-bold text-[#0F172A]">₹{basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>GST ({selectedBatch.pricing.taxPercentage || 18}%)</span>
                        <span className="font-bold text-[#0F172A]">₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-extrabold text-[#1F386B] pt-2 border-t border-slate-200">
                        <span>Total Payable</span>
                        <span className="text-lg font-black text-[#E41937]">
                          ₹{totalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded bg-white border-slate-300 text-[#1F386B] focus:ring-[#1F386B] cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        I agree to the Terms of Service, Privacy Policy, and 100% Refund Guarantee.{' '}
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.acceptTerms}
                      </p>
                    )}
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-1">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full py-4 rounded-md text-sm sm:text-base uppercase tracking-wide"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      {isSubmitting
                        ? 'Reserving Your Seat...'
                        : 'Continue to Enrollment & Payment'}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
                      <ShieldCheck className="w-4 h-4 text-[#1F386B]" />
                      <span>256-Bit Encrypted Razorpay Checkout • Instant Dashboard Access</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </MotionReveal>
      </div>
    </section>
  );
};
