import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Users,
  Sparkles,
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

/** IIEM-styled transparent cohort tuition breakdown & Radix dropdown selector. */
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
      className="py-16 sm:py-20 bg-[#F7F8FA] relative scroll-mt-20 border-b border-slate-200/80 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
            BOOTCAMP <span className="text-[#E41937]">TUITION &amp; BATCHES</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            Transparent all-inclusive institutional pricing. Select your preferred cohort session from the dropdown below with zero hidden charges.
          </p>
        </MotionReveal>

        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Everything Included */}
          <MotionBentoCard className="lg:col-span-5 p-6 sm:p-7 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#E41937]">
                <Sparkles className="w-4 h-4" />
                <span>Full Bootcamp Pass</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#222222]">
                Everything Included
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Lifetime ownership of all templates, prototype repos, recordings, and your verifiable completion certificate.
              </p>
            </div>

            <ul className="space-y-2.5">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-[#1F386B]/10 border border-[#1F386B]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E41937]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded bg-[#1F386B] text-white text-xs flex items-start gap-3 shadow-md border-l-4 border-[#E41937]">
              <div className="w-8 h-8 rounded-full bg-white text-[#E41937] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-0.5 uppercase tracking-wide">
                  100% Refund Guarantee
                </strong>
                <p className="text-blue-100/90 leading-relaxed">
                  Cancel up to 24 hours before start, or attend Day 1 and request a full refund if you aren&apos;t delighted.
                </p>
              </div>
            </div>
          </MotionBentoCard>

          {/* Right Column: Dropdown + Detailed Tuition Breakdown */}
          <MotionBentoCard className="lg:col-span-7 p-6 sm:p-8 space-y-6">
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

            <div className="rounded-lg bg-[#F7F8FA] border border-slate-200/90 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-[#1F386B] text-white tracking-wide">
                    {selectedBatch.batchCode}
                  </span>
                  <Badge variant="success" size="sm">
                    {selectedBatch.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F386B]">
                  <Users className="w-4 h-4 text-[#E41937]" />
                  <span>
                    {selectedBatch.availableSeats} of {selectedBatch.totalSeats} seats open
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Cohort Seat Availability</span>
                  <span className="text-[#E41937]">{fillPercent}% reserved</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200/90 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1F386B] to-[#E41937] transition-all duration-500"
                    style={{ width: `${Math.max(fillPercent, 18)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E41937]" />
                    <span>Cohort Dates</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#222222] mt-1">
                    {selectedBatch.dateRange}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedBatch.days}
                  </div>
                </div>

                <div className="p-3.5 rounded bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#E41937]" />
                    <span>Live Session Timings</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#222222] mt-1">
                    {selectedBatch.timings}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    10 Hours Live + Q&amp;A
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1F386B] tracking-tight">
                      ₹{selectedBatch.pricing.basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      + ₹{taxAmount} ({selectedBatch.pricing.taxPercentage}% GST)
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-[#E41937] mt-0.5">
                    Total Payable: ₹{totalAmount.toLocaleString('en-IN')} INR
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleEnrollClick}
                  className="w-full sm:w-auto uppercase tracking-wider text-xs"
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
