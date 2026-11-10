import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Users,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BATCH_OPTIONS } from '../../data/workshopData';
import type { BatchOption } from '../../types/workshop';

interface PricingSectionProps {
  batches?: BatchOption[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  onProceedToRegister: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  batches = BATCH_OPTIONS,
  selectedBatchId,
  onSelectBatch,
  onProceedToRegister,
}) => {
  const [selectedForPayment, setSelectedForPayment] = React.useState<string | null>(null);

  const inclusions = [
    '10 Hours of Live, Interactive Guided Labs',
    'Full Lifetime Access to HD Session Recordings',
    'Standardized Reusable 10-Prompt Template Library',
    'Deployable Code Starters for React/Vite Prototypes',
    'Automated Multi-Step Lead Intake Pipeline Template',
    'Official Verifiable Certificate of Completion',
    'Dedicated Q&A Support & Community Access',
    '100% Money-Back Satisfaction Guarantee',
  ];

  const handleSelectForPayment = (batchId: string) => {
    setSelectedForPayment(batchId);
    onSelectBatch(batchId);
    onProceedToRegister();
  };

  const selectedBatch =
    batches.find((b: BatchOption) => b.id === (selectedForPayment || selectedBatchId)) ||
    batches[0] ||
    BATCH_OPTIONS[0];

  return (
    <section id="pricing" className="py-20 bg-[#F8FAFC] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Invest in High-Leverage AI Skills
          </h2>
          <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
            One weekend can save you hundreds of hours of manual workplace effort. Zero hidden fees. All taxes and inclusions explicitly detailed.
          </p>
        </div>

        {/* Pricing & Batch Selection Container */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: What's Included */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Everything Included
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                You get lifetime ownership of all deliverables, code templates, prompt libraries, and certified credentials.
              </p>
            </div>

            <ul className="space-y-3">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[#475569]">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs text-[#475569] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0F172A] block mb-0.5">
                  Risk-Free 100% Refund Policy
                </strong>
                Cancel anytime up to 24 hours before the bootcamp starts, or attend Day 1 and request a full refund if not completely satisfied.
              </div>
            </div>
          </div>

          {/* Right Column: Live Batch Selection Cards */}
          <div className="lg:col-span-7 space-y-4">
            {/* If a selection for payment has been made, only show the selected session */}
            {selectedForPayment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Selected Session for Payment
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedForPayment(null)}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All Sessions
                  </button>
                </div>

                {(() => {
                  const taxAmount = Math.round(
                    selectedBatch.pricing.basePrice * (selectedBatch.pricing.taxPercentage / 100)
                  );
                  const totalAmount = selectedBatch.pricing.basePrice + taxAmount;

                  return (
                    <Card
                      key={selectedBatch.id}
                      className="p-6 transition-all border-2 border-blue-600 bg-white shadow-lg ring-2 ring-blue-600/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              {selectedBatch.batchCode}
                            </span>
                            <Badge variant="primary" size="sm">
                              {selectedBatch.status}
                            </Badge>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Selected for Checkout
                            </span>
                          </div>

                          <div className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{selectedBatch.dateRange}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm font-normal text-slate-500">
                              {selectedBatch.days}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {selectedBatch.timings}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-700 font-medium">
                              <Users className="w-3 h-3" />
                              {selectedBatch.availableSeats} of {selectedBatch.totalSeats} seats open
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-2xl font-black text-[#0F172A]">
                            ₹{selectedBatch.pricing.basePrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            + ₹{taxAmount} (18% GST) ={' '}
                            <span className="text-[#0F172A] font-semibold">
                              ₹{totalAmount.toLocaleString('en-IN')} Total
                            </span>
                          </div>
                          <div className="mt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                onSelectBatch(selectedBatch.id);
                                onProceedToRegister();
                              }}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            >
                              Proceed to Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </div>
            ) : (
              /* All sessions displayed before payment selection */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Available Training Sessions ({batches.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Choose a session to proceed to payment
                  </span>
                </div>

                {batches.map((batch: BatchOption) => {
                  const isSelected = selectedBatchId === batch.id;
                  const taxAmount = Math.round(
                    batch.pricing.basePrice * (batch.pricing.taxPercentage / 100)
                  );
                  const totalAmount = batch.pricing.basePrice + taxAmount;

                  return (
                    <Card
                      key={batch.id}
                      onClick={() => onSelectBatch(batch.id)}
                      className={`p-5 sm:p-6 cursor-pointer transition-all border-2 bg-white ${
                        isSelected
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-600/10'
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="font-mono text-xs text-blue-700 font-bold">
                              {batch.batchCode}
                            </span>
                            <Badge variant="primary" size="sm">
                              {batch.status}
                            </Badge>
                          </div>

                          <div className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{batch.dateRange}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm font-normal text-slate-500">
                              {batch.days}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {batch.timings}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-700 font-medium">
                              <Users className="w-3 h-3" />
                              {batch.availableSeats} of {batch.totalSeats} seats open
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-2xl font-black text-[#0F172A]">
                            ₹{batch.pricing.basePrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            + ₹{taxAmount} (18% GST) ={' '}
                            <span className="text-[#0F172A] font-semibold">
                              ₹{totalAmount.toLocaleString('en-IN')} Total
                            </span>
                          </div>
                          <div className="mt-2">
                            <Button
                              variant={isSelected ? 'primary' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectForPayment(batch.id);
                              }}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            >
                              {isSelected ? 'Enroll & Pay (Selected)' : 'Select & Pay'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
