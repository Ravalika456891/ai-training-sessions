import React from 'react';
import { Calendar, ArrowRight, CheckCircle2, Layers, Cpu, Award } from 'lucide-react';
import { SelectDropdown, type SelectDropdownOption } from '../ui/SelectDropdown';
import { BATCH_OPTIONS, WORKSHOP_CONFIG } from '../../data/workshopData';
import type { BatchOption } from '../../types/workshop';

interface WelcomeSectionProps {
  batches?: BatchOption[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  onRegisterClick: () => void;
  onExploreCurriculum: () => void;
}

/** IIEM Part 3 institutional Welcome split: 8-col About + Day Tracks & 4-col Navy Quick Enrollment Card. */
export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  batches = BATCH_OPTIONS,
  selectedBatchId,
  onSelectBatch,
  onRegisterClick,
  onExploreCurriculum,
}) => {
  const selectedBatch =
    batches.find((b) => b.id === selectedBatchId || b.batchCode === selectedBatchId) ||
    batches[0] ||
    BATCH_OPTIONS[0];

  const basePrice = selectedBatch.pricing.basePrice;
  const gstAmount = Math.round(basePrice * ((selectedBatch.pricing.taxPercentage || 18) / 100));
  const totalAmount = basePrice + gstAmount;

  const batchOptions: SelectDropdownOption[] = batches.map((b) => ({
    value: b.id,
    label: `${b.batchCode} • ${b.dateRange}`,
    sublabel: `${b.days} • ${b.timings}`,
    badge: `${b.availableSeats} open`,
    rightPrimary: `₹${b.pricing.basePrice.toLocaleString('en-IN')}`,
    rightSecondary: '+ GST',
    icon: <Calendar className="w-4 h-4" />,
  }));

  return (
    <section id="about" className="py-16 sm:py-20 bg-white scroll-mt-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left 8 Columns: Welcome Overview + Day 1 & Day 2 Highlight Cards */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom">
                WELCOME TO <span className="text-[#E41937]">AI LAUNCHPAD</span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed">
                {WORKSHOP_CONFIG.subTagline} Every session combines live instructor demonstrations, guided lab sandboxes, and real deliverables so you leave with functional AI workflows rather than passive slides.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="rounded-lg border border-slate-200 border-b-[3px] border-b-[#1F386B] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-[#1F386B] to-[#081e4a] px-5 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-sky-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Day 01 • Saturday</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/15 text-blue-100">
                    5 Hrs Live
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-[#222222]">
                    AI &amp; PROMPT <span className="text-[#E41937]">FOUNDATIONS</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Master structured prompt architectures, custom GPT assistants grounded on documents, and multimedia creative generation.
                  </p>
                  <button
                    type="button"
                    onClick={onExploreCurriculum}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1F386B] hover:bg-[#E41937] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Explore Day 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 border-b-[3px] border-b-[#1F386B] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-[#192e57] to-[#1F386B] px-5 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-sky-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Day 02 • Sunday</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/15 text-blue-100">
                    5 Hrs Live
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-[#222222]">
                    APPS &amp; AGENT <span className="text-[#E41937]">AUTOMATION</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Build interactive prototype web apps in minutes and connect multi-step Make.com / n8n workflow automations with APIs.
                  </p>
                  <button
                    type="button"
                    onClick={onExploreCurriculum}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1F386B] hover:bg-[#E41937] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Explore Day 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: IIEM Navy Quick Admission & Batch Card */}
          <div className="lg:col-span-4">
            <div className="rounded-md bg-[#1F386B] p-6 sm:p-7 text-white shadow-xl border-t-4 border-[#E41937] space-y-5">
              <div className="border-l-[3px] border-[#E41937] pl-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                  Talk With Admissions Desk
                </span>
                <h3 className="text-xl font-extrabold uppercase tracking-tight text-white mt-0.5">
                  Quick Cohort Admission
                </h3>
              </div>

              <div className="text-slate-900">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-1.5">
                  Choose Upcoming Session
                </label>
                <SelectDropdown
                  ariaLabel="Choose upcoming cohort session"
                  variant="compact"
                  value={selectedBatch.id}
                  onValueChange={onSelectBatch}
                  options={batchOptions}
                />
              </div>

              <div className="rounded bg-white/10 border border-white/15 p-4 space-y-2 text-xs text-blue-100">
                <div className="flex items-center justify-between">
                  <span>Selected Batch:</span>
                  <span className="font-mono font-bold text-white">{selectedBatch.batchCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dates &amp; Timings:</span>
                  <span className="font-semibold text-white">{selectedBatch.dateRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats Remaining:</span>
                  <span className="font-bold text-emerald-300">
                    {selectedBatch.availableSeats} / {selectedBatch.totalSeats} Open
                  </span>
                </div>
                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Total Tuition (incl. GST):</span>
                  <span className="font-black text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Lifetime HD session recordings &amp; templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                  <span>Verifiable completion certificate included</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={onRegisterClick}
                className="w-full py-3 px-4 rounded bg-[#E41937] hover:bg-[#c5142f] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply &amp; Reserve Seat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
