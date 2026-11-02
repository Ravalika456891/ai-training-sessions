import React, { useState } from 'react';
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
  Clock,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BATCH_OPTIONS } from '../../data/workshopData';
import { api, type EnrollmentApiResponse } from '../../services/api';
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
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentApiResponse['data'] | null>(null);

  // Sync batch if prop changes
  React.useEffect(() => {
    if (selectedBatchId) {
      setFormData((prev) => ({ ...prev, selectedBatchId }));
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
      newErrors.fullName = 'Please enter your full legal name (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address for session access';
    }

    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 7) {
      newErrors.phoneNumber = 'Please enter a valid mobile number (at least 7 digits)';
    }

    if (!formData.selectedBatchId) {
      newErrors.selectedBatchId = 'Please select a bootcamp cohort';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy to register';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await api.createEnrollment(formData);
      if (response.success && response.data) {
        setEnrollmentResult(response.data);
        await refreshUser();
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBatch =
    batches.find((b) => b.id === formData.selectedBatchId || b.batchCode === formData.selectedBatchId) ||
    batches[0] ||
    BATCH_OPTIONS[0];

  const taxAmount = Math.round(selectedBatch.pricing.basePrice * (selectedBatch.pricing.taxPercentage / 100));
  const totalAmount = selectedBatch.pricing.basePrice + taxAmount;

  return (
    <section id="register" className="py-20 bg-navy-950 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="purple" size="md">
            Direct Enrollment
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Reserve Your Seat in AI Launchpad
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Fill in your participant details below. Live session links and calendar invites will be dispatched to your registered email.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <Card glow className="p-6 sm:p-10 border-indigo-500/30">
            {enrollmentResult ? (
              <div className="text-center py-8 space-y-6 animate-in fade-in-50 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MongoDB Atomic Reservation Confirmed</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Registration Successfully Recorded!
                  </h3>
                  <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
                    Welcome aboard, <strong className="text-white">{enrollmentResult.enrollment.attendeeDetails.fullName}</strong>. Your seat has been allocated in the database.
                  </p>
                </div>

                {/* Enrollment Summary Card */}
                <div className="p-6 rounded-2xl bg-navy-900 border border-slate-700/80 text-left max-w-xl mx-auto space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400">Enrollment ID</span>
                      <div className="text-lg font-mono font-bold text-brand-cyan">
                        {enrollmentResult.enrollment.enrollmentId}
                      </div>
                    </div>
                    <Badge variant={enrollmentResult.paymentRequired ? 'warning' : 'success'} size="md">
                      {enrollmentResult.paymentRequired ? 'Seat Reserved (15 Min Hold)' : 'Confirmed'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Cohort Batch:</span>
                      <span className="text-white font-semibold">{enrollmentResult.workshop.batchCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Registered Email:</span>
                      <span className="text-white font-semibold">{enrollmentResult.enrollment.attendeeDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Schedule & Timings:</span>
                      <span className="text-white font-semibold">{enrollmentResult.workshop.timings}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Investment:</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        ₹{enrollmentResult.orderSummary.totalAmount.toLocaleString('en-IN')} (incl. GST)
                      </span>
                    </div>
                  </div>

                  {enrollmentResult.paymentRequired && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>15-Minute Seat Hold Active:</strong> Finalize checkout with Razorpay to secure your confirmed seat.
                        </div>
                      </div>
                      {onOpenCheckout && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => onOpenCheckout(enrollmentResult.enrollment.enrollmentId)}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="shrink-0"
                        >
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {enrollmentResult.paymentRequired && onOpenCheckout && (
                    <Button
                      variant="gradient"
                      size="md"
                      onClick={() => onOpenCheckout(enrollmentResult.enrollment.enrollmentId)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Pay Securely via Razorpay (₹{enrollmentResult.orderSummary.totalAmount.toLocaleString('en-IN')})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEnrollmentResult(null);
                      setServerError(null);
                    }}
                  >
                    Register Another Participant
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Server Error Alert Banner */}
                {serverError && (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in-50 duration-200">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Registration Issue:</strong>
                      <span>{serverError}</span>
                    </div>
                  </div>
                )}

                {/* Cohort Selection Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-violet" />
                    <span>Select Workshop Cohort</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.selectedBatchId}
                    onChange={(e) => {
                      setFormData({ ...formData, selectedBatchId: e.target.value });
                      onSelectBatch(e.target.value);
                    }}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition-all"
                  >
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchCode} — {batch.dateRange} ({batch.timings}) • {batch.availableSeats} seats open
                      </option>
                    ))}
                  </select>
                  {errors.selectedBatchId && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.selectedBatchId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-brand-cyan" />
                      <span>Full Legal Name</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Rajesh Kumar"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-navy-900 border ${
                        errors.fullName ? 'border-rose-500' : 'border-slate-700'
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition-all`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span>Email Address</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="rajesh@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-navy-900 border ${
                        errors.email ? 'border-rose-500' : 'border-slate-700'
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition-all`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone with Country Code */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp / Mobile Number</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.phoneCountryCode}
                        onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                        className="bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-violet shrink-0"
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
                        className={`flex-1 bg-navy-900 border ${
                          errors.phoneNumber ? 'border-rose-500' : 'border-slate-700'
                        } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition-all`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Persona Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span>Current Profile Category</span>
                    </label>
                    <select
                      value={formData.userCategory}
                      onChange={(e) => setFormData({ ...formData, userCategory: e.target.value })}
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-violet transition-all"
                    >
                      <option value="working_professional">Working Professional (Product, Eng, Mktg)</option>
                      <option value="student">Student / Fresh Graduate</option>
                      <option value="founder">Founder / Business Owner</option>
                      <option value="creator">Creator / Freelancer</option>
                      <option value="other">Other Explorer</option>
                    </select>
                  </div>
                </div>

                {/* Experience Level & Transparent Pricing Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand-cyan" />
                      <span>Current AI Exposure Level</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                          className={`py-2 px-2 text-xs font-semibold capitalize rounded-xl border transition-all ${
                            formData.experienceLevel === lvl
                              ? 'bg-brand-violet/20 border-brand-violet text-white'
                              : 'bg-navy-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Base Registration:</span>
                      <span className="font-semibold text-white">₹{selectedBatch.pricing.basePrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-white">₹{taxAmount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-slate-700/80 mt-1">
                      <span>Total Payable:</span>
                      <span className="text-emerald-400 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded bg-navy-900 border-slate-700 text-brand-violet focus:ring-brand-violet"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I agree to the <span className="text-brand-cyan hover:underline">Terms of Service</span>, <span className="text-brand-cyan hover:underline">Privacy Policy</span>, and <span className="text-brand-cyan hover:underline">100% Refund Policy</span>. <span className="text-rose-400">*</span>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.acceptTerms}
                    </p>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded bg-navy-900 border-slate-700 text-brand-violet focus:ring-brand-violet"
                    />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      Send me cohort preparation reminders and prompt engineering cheat-sheets via WhatsApp/Email. (Optional, unsubscribe anytime).
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full text-base py-4 shadow-xl shadow-indigo-600/30"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Proceed to Reserve Seat (₹{totalAmount.toLocaleString('en-IN')})
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>256-Bit SSL Encrypted • 100% Satisfaction Guarantee</span>
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
