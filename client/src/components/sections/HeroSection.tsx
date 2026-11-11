import React from 'react';
import {
  Clock,
  MessageSquare,
  CreditCard,
  Calendar,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { BATCH_OPTIONS } from '../../data/workshopData';
import type { BatchOption } from '../../types/workshop';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onExploreCurriculum: () => void;
  batch?: BatchOption;
}

/** IIEM Institution-style full-width AI training hero banner + overlapping 4-column navy feature strip. */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onExploreCurriculum,
  batch,
}) => {
  const currentBatch = batch || BATCH_OPTIONS[0];

  const scrollTo = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const quickBoxes = [
    {
      icon: Clock,
      title: '10 HRS LIVE LABS',
      subtitle: currentBatch.days,
      bg: 'bg-[#1F386B] hover:bg-[#192e57]',
      onClick: onExploreCurriculum,
    },
    {
      icon: MessageSquare,
      title: 'LIVE MENTORSHIP',
      subtitle: 'Hands-On Q&A Support',
      bg: 'bg-[#1c325f] hover:bg-[#172a4f]',
      onClick: () => scrollTo('#mentors'),
    },
    {
      icon: CreditCard,
      title: 'ONLINE PAYMENT',
      subtitle: `₹${currentBatch.pricing.basePrice.toLocaleString('en-IN')} + ${currentBatch.pricing.taxPercentage || 18}% GST`,
      bg: 'bg-[#192e57] hover:bg-[#081e4a]',
      onClick: () => scrollTo('#pricing'),
    },
    {
      icon: Calendar,
      title: currentBatch.dateRange,
      subtitle: `${currentBatch.availableSeats} of ${currentBatch.totalSeats} Seats Open`,
      bg: 'bg-[#172a4f] hover:bg-[#081e4a]',
      onClick: onRegisterClick,
    },
  ];

  return (
    <section id="home" className="relative bg-[#F7F8FA]">
      {/* Full-Width Scrimmed AI Training Studio Hero Banner */}
      <div className="relative overflow-hidden bg-[#081e4a]">
        <img
          src="/assets/hero-cohort-showcase.jpg"
          alt="AI Launchpad Live AI Training Workshop"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#081e4a]/95 via-[#1F386B]/75 to-[#1F386B]/30"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 sm:pt-24 sm:pb-32">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/15 backdrop-blur-sm border border-white/25 text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Batch {currentBatch.batchCode} • {currentBatch.timings}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
              AI TRAINING
            </h1>

            <div className="inline-block bg-[#1F386B]/95 border-l-4 border-[#E41937] px-4 py-2 shadow-lg">
              <p className="text-sm sm:text-xl lg:text-2xl font-extrabold uppercase tracking-wide text-white">
                PRACTICAL AI BOOTCAMP FOR EVERYONE
              </p>
            </div>

            <p className="text-sm sm:text-base text-blue-100/95 leading-relaxed max-w-xl">
              Go from zero AI background to building custom AI assistants, multi-step automations, and functional web prototypes with live guided weekend mentorship.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreCurriculum}
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#1F386B] hover:bg-[#081e4a] border border-white/25 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#E41937] hover:bg-[#c5142f] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                <span>Reserve Seat — ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping 4-Box Institutional Action Strip (IIEM Stepped Navy Model) */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 shadow-2xl overflow-hidden rounded-sm">
          {quickBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <button
                key={box.title}
                type="button"
                onClick={box.onClick}
                className={`${box.bg} text-white px-4 py-6 sm:py-7 text-center transition-colors cursor-pointer group border-r border-white/10 last:border-r-0`}
              >
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-white mb-2.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  {box.title}
                </div>
                <div className="text-[11px] text-blue-200 mt-1 font-medium truncate">
                  {box.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
