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
    <section id="register" className="py-20 bg-[#F8FAFC] relative scroll-mt-20 border-t border-slate-200">
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

        <div className="mt-10 max-w-5xl mx-auto">
          <Card className="p-0 border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden">
            {/* Top Integrated Smart Account Bar */}
            {!user && (
              <div className="px-6 sm:px-10 py-4 bg-gradient-to-r from-slate-50 via-blue-50/60 to-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                      Smart Workshop Preservation
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Selected Cohort: <strong className="text-[#0F172A]">{selectedBatch.batchCode}</strong> ({selectedBatch.dateRange}). Sign in or create an account, or complete the form below.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to={`/signin?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                    onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] shadow-2xs transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to={`/signup?redirect=${encodeURIComponent(`/dashboard?batch=${selectedBatch.id}`)}`}
                    onClick={() => sessionStorage.setItem('ailp_selected_batch', selectedBatch.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-10">
              {enrollmentSummary ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-200">
                    <CheckCircle2 className="w-9 h-9 text-blue-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
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
                        <div className="text-base sm:text-lg font-mono font-bold text-blue-600">
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
                <form onSubmit={handleSubmit} noValidate className="space-y-7">
                  {serverError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Enrollment Issue:</strong>
                        <span>{serverError}</span>
                      </div>
                    </div>
                  )}

                  {/* 1. Select Workshop Session (All sessions displayed for selection; once selected for payment, only selected session shown) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>1. Select Workshop Session</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {batches.length} session{batches.length > 1 ? 's' : ''} available
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {batches.map((batch) => {
                        const isSelected =
                          formData.selectedBatchId === batch.id ||
                          formData.selectedBatchId === batch.batchCode;
                        return (
                          <button
                            key={batch.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, selectedBatchId: batch.id });
                              onSelectBatch(batch.id);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/15 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                                  {batch.batchCode}
                                </span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                              <div className="text-sm font-bold text-[#0F172A] truncate">
                                {batch.dateRange}
                              </div>
                              <div className="text-xs text-slate-500">
                                {batch.days} • {batch.timings}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] w-full">
                              <span className="text-slate-500 font-medium">{batch.availableSeats} seats open</span>
                              <span className="font-bold text-[#0F172A]">
                                ₹{batch.pricing.basePrice.toLocaleString('en-IN')} + GST
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Participant Details (Aligned 2x2 Grid with Uniform h-12 Inputs) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <span>Full Name</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Rajesh Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full h-12 bg-slate-50 border ${
                          errors.fullName ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl px-4 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all`}
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
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Email Address</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-12 bg-slate-50 border ${
                          errors.email ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl px-4 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Unified Phone Input Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>Mobile Number</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div
                        className={`flex items-center h-12 bg-slate-50 border ${
                          errors.phoneNumber ? 'border-rose-500' : 'border-slate-300'
                        } rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all`}
                      >
                        <select
                          aria-label="Country code"
                          value={formData.phoneCountryCode}
                          onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                          className="h-full bg-slate-100/80 border-r border-slate-300 pl-3 pr-7 text-xs font-bold text-[#0F172A] focus:outline-none shrink-0 cursor-pointer"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+971">🇦🇪 +971</option>
                        </select>
                        <input
                          type="tel"
                          name="phoneNumber"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="tel-national"
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="flex-1 min-w-0 h-full bg-transparent px-3.5 text-sm font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none"
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
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span>Your Background</span>
                      </label>
                      <select
                        value={formData.userCategory}
                        onChange={(e) => setFormData({ ...formData, userCategory: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>AI Experience Level</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2.5 h-12">
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                            className={`h-full px-3 text-xs font-bold capitalize rounded-xl border transition-all cursor-pointer ${
                              formData.experienceLevel === lvl
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-300 text-[#475569] hover:text-[#0F172A] hover:bg-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transparent Pricing Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Workshop Tuition ({selectedBatch.batchCode}):</span>
                        <span className="font-semibold text-[#0F172A]">₹{basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>GST (18%):</span>
                        <span className="font-semibold text-[#0F172A]">₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold text-[#0F172A] pt-2 border-t border-slate-200">
                        <span>Total Payable:</span>
                        <span className="text-blue-600 text-base font-extrabold">
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
                        className="mt-0.5 w-4 h-4 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-600"
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
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      <span>
                        {isSubmitting
                          ? 'Reserving Your Seat...'
                          : 'Continue to Enrollment & Payment'}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>256-Bit Encrypted Razorpay Checkout • Instant Dashboard Access</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
