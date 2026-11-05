import React from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Terminal,
  Zap,
  Code2,
  Layers,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Button } from '../common/Button';
import { BATCH_OPTIONS } from '../../data/workshopData';
import type { BatchOption } from '../../types/workshop';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onExploreCurriculum: () => void;
  batch?: BatchOption;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onExploreCurriculum,
  batch,
}) => {
  const currentBatch = batch || BATCH_OPTIONS[0];
  const seatsClaimed = currentBatch.totalSeats - currentBatch.availableSeats;
  const fillPercentage = Math.round((seatsClaimed / currentBatch.totalSeats) * 100);

  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Main Hero Block */}
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          
          {/* 1. Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[#0F172A] font-bold">2-Day Hands-On AI Bootcamp</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-medium">Live Cohort Registration Open</span>
          </div>

          {/* 2. Main Bold Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0F172A] leading-[1.15]">
            Master Practical AI in{' '}
            <span className="text-blue-600 block sm:inline">
              Just One Weekend
            </span>
          </h1>

          {/* 3. Subtitle Description */}
          <p className="text-base sm:text-lg md:text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto font-normal">
            Build custom AI assistants, production-ready automations, and functional app prototypes. Guided by seasoned practitioners with 100% hands-on exercises.
          </p>

          {/* 4. Four Key Value Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-sm">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Saturday & Sunday</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-sm">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>10 Hours of Live Labs</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-sm">
              <Terminal className="w-4 h-4 text-blue-600 shrink-0" />
              <span>6 Hands-On Deliverables</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-sm">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verifiable Certificate</span>
            </div>
          </div>

          {/* 5. Primary and Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onRegisterClick}
              className="w-full sm:w-auto text-base px-8 py-3.5 shadow-md hover:shadow-lg font-bold"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Register for Next Batch
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onExploreCurriculum}
              className="w-full sm:w-auto text-base px-7 py-3.5 bg-white border-2 border-slate-200 hover:border-blue-600 text-[#0F172A] font-semibold"
            >
              Explore 2-Day Curriculum
            </Button>
          </div>

          {/* 6. Three Risk-Free Trust Proof Points */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Refund Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Lifetime Recording Access</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>No Prior Coding Experience Needed</span>
            </div>
          </div>

        </div>

        {/* 7. Live Cohort Quick Pass & Project Deliverables Banner */}
        <div className="mt-12 max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Upcoming Batch Info */}
            <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-5 md:pb-0 md:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Upcoming Cohort
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {currentBatch.batchCode}
                </span>
              </div>
              <div className="text-lg font-black text-[#0F172A]">
                {currentBatch.dateRange}
              </div>
              <div className="text-xs text-[#475569] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentBatch.timings}</span>
              </div>
              
              {/* Capacity Progress Bar */}
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Seat Reservation</span>
                  <span className="text-blue-700 font-bold">{currentBatch.availableSeats} of {currentBatch.totalSeats} seats open</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, fillPercentage))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Middle: Deliverables Built */}
            <div className="md:col-span-4 space-y-2">
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                Live Labs You Will Build:
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Enterprise RAG Assistant (LangChain)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Autonomous AI Workflow (n8n + Claude)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Interactive AI Full-Stack App</span>
                </div>
              </div>
            </div>

            {/* Right: Price & Quick Action */}
            <div className="md:col-span-3 flex flex-col justify-center items-start md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-[11px] text-slate-500">Early-Bird Tuition</div>
                <div className="text-2xl font-black text-[#0F172A]">
                  ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">+ 18% GST</div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={onRegisterClick}
                className="w-full py-2.5 font-bold shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Claim Seat
              </Button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
