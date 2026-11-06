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
    phoneNumber: user?.phone?.number || '',
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

  // Sync batch if prop changes and persist in sessionStorage for smart redirection
  React.useEffect(() => {
    if (selectedBatchId) {
      setFormData((prev) => ({ ...prev, selectedBatchId }));
      sessionStorage.setItem('ailp_selected_batch', selectedBatchId);
    }
  }, [selectedBatchId]);

  // Pre-fill if authenticated user changes
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phoneCountryCode: user.phone?.countryCode || prev.phoneCountryCode,
        phoneNumber: user.phone?.number || prev.phoneNumber,
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

    // Preserve selected workshop batch
    sessionStorage.setItem('ailp_selected_batch', formData.selectedBatchId);

    setIsSubmitting(true);
    try {
      const response = await api.createEnrollment(formData);

      if (response.success && response.data) {
        await refreshUser();
        setEnrollmentSummary(response.data);

        // If payment is required and CheckoutModal callback is provided, open checkout immediately
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

  return (
    <section id="register" className="py-20 bg-slate-50 relative scroll-mt-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Workshop Enrollment
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Reserve Your Seat in AI Launchpad
          </h2>
          <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
            Choose your preferred weekend cohort below. Your selected workshop is saved automatically as you sign in, create an account, or proceed to payment.
          </p>
        </div>

        <div className="mt-10 max-w-4xl mx-auto space-y-6">
          {/* Smart Account Continuation Bar for Guests */}
          {!user && (
            <div className="p-5 rounded-2xl bg-blue-50/80 text-[#0F172A] border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Smart Workshop Preservation</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Selected Cohort: <strong className="text-[#0F172A]">{selectedBatch.batchCode}</strong> ({selectedBatch.dateRange}). Sign in or create an account to continue enrollment from your dashboard, or complete the form below.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to={`/signin?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                  onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-2xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to={`/signup?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                  onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <Card className="p-6 sm:p-10 border-slate-200 bg-white shadow-md rounded-3xl">
            {enrollmentSummary ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-200">
                  <CheckCircle2 className="w-9 h-9 text-indigo-600" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {enrollmentSummary.paymentRequired
                        ? 'Step 1 Complete — Seat Reserved'
                        : 'Official Enrollment Confirmed'}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                    Welcome, {enrollmentSummary.user?.name || formData.fullName}!
                  </h3>
                  <p className="text-[#475569] text-sm max-w-lg mx-auto leading-relaxed">
                    {enrollmentSummary.paymentRequired
                      ? 'Your workshop seat is reserved for 15 minutes. Complete your verified payment to unlock live classroom access and learning materials.'
                      : 'Your workshop enrollment is confirmed! Open your student dashboard to access your schedule and materials.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-500">Enrollment ID</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-indigo-600">
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
                      variant="primary"
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

                {/* Cohort Selection Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>1. Select Workshop Cohort</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.selectedBatchId}
                    onChange={(e) => {
                      setFormData({ ...formData, selectedBatchId: e.target.value });
                      onSelectBatch(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                  >
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchCode} — {batch.dateRange} ({batch.timings}) • {batch.availableSeats} seats open
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                      <span>Full Name</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Rajesh Kumar"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-slate-50 border ${
                        errors.fullName ? 'border-rose-500' : 'border-slate-300'
                      } rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span>Email Address</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-slate-50 border ${
                        errors.email ? 'border-rose-500' : 'border-slate-300'
                      } rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <span>Mobile Number</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.phoneCountryCode}
                        onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 shrink-0"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+971">🇦🇪 +971</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className={`flex-1 bg-slate-50 border ${
                          errors.phoneNumber ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Role / Background */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>Your Background</span>
                    </label>
                    <select
                      value={formData.userCategory}
                      onChange={(e) => setFormData({ ...formData, userCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    >
                      <option value="working_professional">Working Professional</option>
                      <option value="student">Student / Graduate</option>
                      <option value="founder">Founder / Business Owner</option>
                      <option value="creator">Creator / Consultant</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Experience Level & Transparent Pricing Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>AI Experience Level</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                          className={`py-2.5 px-2 text-xs font-semibold capitalize rounded-xl border transition-all cursor-pointer ${
                            formData.experienceLevel === lvl
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transparent Pricing Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Workshop Tuition:</span>
                      <span className="font-semibold text-[#0F172A]">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-[#0F172A]">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-[#0F172A] pt-2 border-t border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-indigo-600 text-base font-extrabold">
                        ₹{totalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-xs text-[#475569] leading-relaxed">
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

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>
                      {isSubmitting
                        ? 'Reserving Your Seat...'
                        : 'Continue to Enrollment & Payment'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>256-Bit Encrypted Razorpay Checkout • Instant Dashboard Access</span>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};
