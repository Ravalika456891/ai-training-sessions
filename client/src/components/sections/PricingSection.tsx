import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Users,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SelectDropdown, type SelectDropdownOption } from '../ui/SelectDropdown';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
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

  const selectedBatch =
    batches.find((b: BatchOption) => b.id === selectedBatchId || b.batchCode === selectedBatchId) ||
    batches[0] ||
    BATCH_OPTIONS[0];

  const taxAmount = Math.round(
    selectedBatch.pricing.basePrice * ((selectedBatch.pricing.taxPercentage || 18) / 100)
  );
  const totalAmount = selectedBatch.pricing.basePrice + taxAmount;
  const filledSeats = Math.max(selectedBatch.totalSeats - selectedBatch.availableSeats, 0);
  const fillPercent = Math.min(
    100,
    Math.round((filledSeats / Math.max(selectedBatch.totalSeats, 1)) * 100)
  );

  const dropdownOptions: SelectDropdownOption[] = batches.map((batch) => {
    const gst = Math.round(batch.pricing.basePrice * ((batch.pricing.taxPercentage || 18) / 100));
    return {
      value: batch.id,
      label: `${batch.batchCode} • ${batch.dateRange}`,
      sublabel: `${batch.days} • ${batch.timings}`,
      badge: `${batch.availableSeats} seats open`,
      rightPrimary: `₹${batch.pricing.basePrice.toLocaleString('en-IN')}`,
      rightSecondary: `+ ₹${gst} GST`,
      icon: <Calendar className="w-4 h-4" />,
    };
  });

  const handleEnrollClick = () => {
    onSelectBatch(selectedBatch.id);
    onProceedToRegister();
  };

  return (
    <section
      id="pricing"
      className="py-20 sm:py-24 bg-[#F4F7FE] relative scroll-mt-20 border-b border-slate-200/80 overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 ui-canvas-gradient opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<Layers className="w-3.5 h-3.5 text-[#081e4a]" />}>
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Invest in High-Leverage{' '}
            <span className="text-[#081e4a]">
              AI Skills
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            One weekend can save hundreds of hours of manual workplace effort. Choose your preferred session from the dropdown below with zero hidden charges.
          </p>
        </MotionReveal>

        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Everything Included Bento */}
          <MotionBentoCard className="lg:col-span-5 p-6 sm:p-7 space-y-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#081e4a]">
                <Sparkles className="w-4 h-4" />
                <span>Full Bootcamp Pass</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                Everything Included
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Lifetime ownership of all templates, prototype repos, recordings, and your verifiable completion credential.
              </p>
            </div>

            <ul className="space-y-2.5">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-50 border border-[#081e4a]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#081e4a]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-2xl bg-[#081e4a] text-white text-xs flex items-start gap-3 shadow-md shadow-[#081e4a]/15">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-0.5">
                  Risk-Free 100% Refund Policy
                </strong>
                <p className="text-blue-100/90 leading-relaxed">
                  Cancel up to 24 hours before start, or attend Day 1 and request a full refund if you aren&apos;t delighted.
                </p>
              </div>
            </div>
          </MotionBentoCard>

          {/* Right Column: Cohort Dropdown Selector + Detailed Tuition Breakdown */}
          <MotionBentoCard delay={0.08} className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <SelectDropdown
              label="Select Training Session"
              hintRight={`${batches.length} Session${batches.length > 1 ? 's' : ''} Available`}
              icon={<Calendar className="w-3.5 h-3.5" />}
              variant="rich"
              value={selectedBatch.id}
              onValueChange={(val) => onSelectBatch(val)}
              options={dropdownOptions}
              placeholder="Choose a weekend cohort..."
            />

            {/* Cohort Overview Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-white border border-slate-200/90 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#081e4a] text-white tracking-wide">
                    {selectedBatch.batchCode}
                  </span>
                  <Badge variant="success" size="sm">
                    {selectedBatch.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#081e4a]">
                  <Users className="w-4 h-4 text-[#081e4a]" />
                  <span>
                    {selectedBatch.availableSeats} of {selectedBatch.totalSeats} seats open
                  </span>
                </div>
              </div>

              {/* Seat Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Cohort Seat Availability</span>
                  <span>{fillPercent}% reserved</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/90 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#081e4a] transition-all duration-500"
                    style={{ width: `${Math.max(fillPercent, 18)}%` }}
                  />
                </div>
              </div>

              {/* 2-Tile Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#081e4a]" />
                    <span>Cohort Dates</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] mt-1">
                    {selectedBatch.dateRange}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedBatch.days}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#081e4a]" />
                    <span>Live Session Timings</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] mt-1">
                    {selectedBatch.timings}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    10 Hours Live + Q&amp;A
                  </div>
                </div>
              </div>

              {/* Fee & Checkout Bar */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#0F172A] tracking-tight">
                      ₹{selectedBatch.pricing.basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      + ₹{taxAmount} ({selectedBatch.pricing.taxPercentage}% GST)
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#081e4a] mt-0.5">
                    Total Payable: ₹{totalAmount.toLocaleString('en-IN')} INR
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleEnrollClick}
                  className="w-full sm:w-auto rounded-xl"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enroll &amp; Pay ₹{totalAmount.toLocaleString('en-IN')}
                </Button>
              </div>
            </div>
          </MotionBentoCard>
        </div>
      </div>
    </section>
  );
};
