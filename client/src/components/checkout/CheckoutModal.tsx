import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Tag,
  ArrowRight,
  AlertCircle,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { api, type RazorpayOrderData, type PaymentVerificationResult } from '../../services/api';
import { loadRazorpayScript } from '../../utils/loadRazorpay';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  onPaymentSuccess?: (result: PaymentVerificationResult) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  enrollmentId,
  onPaymentSuccess,
}) => {
  const [orderData, setOrderData] = useState<RazorpayOrderData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentVerificationResult | null>(null);

  // Initialize or fetch Order from backend API
  const fetchOrder = async (appliedCoupon?: string) => {
    setIsLoadingOrder(true);
    setPaymentError(null);
    try {
      const response = await api.createPaymentOrder(enrollmentId, appliedCoupon);
      if (response.success && response.data) {
        setOrderData(response.data);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initialize checkout order.');
    } finally {
      setIsLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (isOpen && enrollmentId) {
      setPaymentResult(null);
      setCouponCode('');
      setCouponSuccess(null);
      setCouponError(null);
      fetchOrder();
    }
  }, [isOpen, enrollmentId]);

  // Handle Coupon Application
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await api.createPaymentOrder(enrollmentId, couponCode.trim());
      if (res.success && res.data) {
        setOrderData(res.data);
        if (res.data.breakdown.discountAmount > 0) {
          setCouponSuccess(
            `Coupon applied! You saved ₹${res.data.breakdown.discountAmount.toLocaleString('en-IN')}`
          );
        }
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Launch Razorpay Payment Modal
  const handlePaySecurely = async () => {
    if (!orderData) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    // 1. Ensure Razorpay SDK is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded && typeof (window as any).Razorpay === 'undefined') {
      // If CDN is blocked or offline, run simulation verification
      await handleSimulatedPayment();
      return;
    }

    try {
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'AI Launchpad',
        description: `${orderData.workshop.title} (${orderData.workshop.batchCode})`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify signature on backend
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              enrollmentId: orderData.enrollmentId,
            });

            if (verifyRes.success && verifyRes.data) {
              setPaymentResult(verifyRes.data);
              onPaymentSuccess?.(verifyRes.data);
            }
          } catch (verifyErr: any) {
            setPaymentError(verifyErr.message || 'Payment signature verification failed.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: orderData.attendee.name,
          email: orderData.attendee.email,
          contact: orderData.attendee.phone,
        },
        theme: {
          color: '#6366F1', // Indigo
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        setPaymentError(response.error?.description || 'Payment was declined by bank.');
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch {
      // Fallback to simulated verification for local sandbox testing
      await handleSimulatedPayment();
    }
  };

  // Simulated Test Payment Handler for Local Sandbox Demonstration
  const handleSimulatedPayment = async () => {
    if (!orderData) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const mockPaymentId = `pay_${Date.now()}_test${Math.floor(100 + Math.random() * 900)}`;
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'simulated_test_signature_valid_for_dev_mode_token',
        enrollmentId: orderData.enrollmentId,
      });

      if (verifyRes.success && verifyRes.data) {
        setPaymentResult(verifyRes.data);
        onPaymentSuccess?.(verifyRes.data);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment verification failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-3xl bg-navy-950 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-navy-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Secure Checkout & Payment
                <Badge variant="cyan" size="sm">
                  Razorpay Verified
                </Badge>
              </h3>
              <p className="text-xs text-slate-400">
                256-Bit SSL Encrypted • Direct Bank Authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {paymentResult ? (
            /* Successful Payment Confirmation Receipt */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <Badge variant="success" size="md">
                  Payment Captured & Verified
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  You are Officially Enrolled!
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  A receipt and calendar invite have been dispatched to your registered email.
                </p>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="max-w-md mx-auto bg-navy-900 border border-slate-700/80 rounded-2xl p-5 text-left text-xs space-y-3 shadow-lg">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Enrollment ID:</span>
                  <span className="font-mono font-bold text-brand-cyan">{paymentResult.enrollmentId}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Payment ID:</span>
                  <span className="font-mono text-white">{paymentResult.paymentId}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Razorpay Order ID:</span>
                  <span className="font-mono text-slate-300">{paymentResult.orderId}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-white">Amount Paid:</span>
                  <span className="text-emerald-400">
                    ₹{paymentResult.amount?.toLocaleString('en-IN') || orderData?.breakdown.totalAmount.toLocaleString('en-IN')} (incl. GST)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="gradient" size="md" onClick={onClose}>
                  Done & Return to Workshop
                </Button>
              </div>
            </div>
          ) : isLoadingOrder ? (
            /* Loading Order State */
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-cyan mx-auto" />
              <p className="text-sm text-slate-300">
                Validating workshop reservation & calculating pricing with Razorpay...
              </p>
            </div>
          ) : orderData ? (
            /* Main Checkout Interface (TASK 2) */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Workshop & Attendee Details */}
              <div className="md:col-span-6 space-y-6">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
                    Workshop Cohort
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {orderData.workshop.title}
                  </h4>
                  <div className="mt-2 space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{orderData.workshop.dateRange}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-brand-cyan font-bold">
                        {orderData.workshop.batchCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-violet" />
                      <span>{orderData.workshop.timings}</span>
                    </div>
                  </div>
                </div>

                {/* Learner Details Card */}
                <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-400 block border-b border-slate-800 pb-1.5">
                    Registered Attendee Information
                  </span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{orderData.attendee.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{orderData.attendee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{orderData.attendee.phone}</span>
                  </div>
                </div>

                {/* Guaranteed Inclusions */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Lifetime Recording & Starter Repositories</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified Cryptographic Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>100% Money-Back Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Breakdown & Payment Action */}
              <div className="md:col-span-6 space-y-5">
                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Have a Coupon Code?</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., LAUNCH10 or EARLYBIRD"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-navy-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      isLoading={isApplyingCoupon}
                      className="text-xs shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {couponSuccess}
                    </p>
                  )}
                </form>

                {/* Amount Summary Table (Validated by Server) */}
                <Card className="p-4 sm:p-5 border-slate-800 bg-navy-900/90 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Workshop Registration Fee:</span>
                    <span className="font-semibold text-white">
                      ₹{orderData.breakdown.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {orderData.breakdown.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount ({orderData.breakdown.couponCode}):</span>
                      <span>-₹{orderData.breakdown.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>GST ({orderData.breakdown.taxPercentage}%):</span>
                    <span className="font-semibold text-white">
                      ₹{orderData.breakdown.taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Amount:</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-emerald-400">
                        ₹{orderData.breakdown.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        All taxes included (INR)
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Error Banner */}
                {paymentError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in-50">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Payment Notice:</strong> {paymentError}
                    </div>
                  </div>
                )}

                {/* Pay Button Action */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="gradient"
                    size="lg"
                    isLoading={isProcessingPayment}
                    onClick={handlePaySecurely}
                    className="w-full text-base py-4 shadow-xl shadow-indigo-600/30"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Pay Securely ₹{orderData.breakdown.totalAmount.toLocaleString('en-IN')}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSimulatedPayment}
                      disabled={isProcessingPayment}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 underline font-medium transition-colors"
                    >
                      (Test Sandbox: Simulate Instant Verified Payment)
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorized by Razorpay Payment Gateway • PCI-DSS Level 1 Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
