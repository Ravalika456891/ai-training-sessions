import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Terminal,
  Bot,
  Palette,
  Layers,
  Zap,
  GraduationCap,
  Briefcase,
  Rocket,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import { LEARNING_OUTCOMES, AUDIENCE_PERSONAS } from '../../data/workshopData';

interface BenefitsSectionProps {
  onRegisterClick: () => void;
}

/** IIEM Part 4 full-bleed split section: Dark navy "Why Choose Us?" left column + light Audience Fit right column. */
export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onRegisterClick }) => {
  const [activePersona, setActivePersona] = useState(AUDIENCE_PERSONAS[0].persona);

  const getOutcomeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#E41937]" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-[#E41937]" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-[#E41937]" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-[#E41937]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#E41937]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#E41937]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#E41937]" />;
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 shrink-0" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  const personaTabs: SegmentedTabItem[] = AUDIENCE_PERSONAS.map((item) => ({
    value: item.persona,
    label: item.persona,
    icon: getPersonaIcon(item.iconName),
  }));

  const currentPersona =
    AUDIENCE_PERSONAS.find((p) => p.persona === activePersona) || AUDIENCE_PERSONAS[0];

  return (
    <section id="outcomes" className="scroll-mt-20 border-b border-slate-200/80 overflow-hidden">
      {/* Top Full-Width Band: Deep IIEM Navy Panel with Side-by-Side Outcome Cards ("WHY CHOOSE US?") */}
      <div className="bg-[#1F386B] text-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white iiem-line-bottom-center">
              WHY CHOOSE <span className="text-[#E41937] bg-white px-2.5 py-0.5 rounded-xs">US?</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Move beyond basic chat prompts. Walk away with 6 concrete, production-ready AI deliverables built step-by-step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEARNING_OUTCOMES.map((outcome) => (
              <div
                key={outcome.id}
                className="rounded-lg bg-white/[0.06] border border-white/15 hover:border-[#E41937]/80 p-5 flex flex-col justify-between gap-3 transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {getOutcomeIcon(outcome.iconName)}
                    </div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide leading-snug text-white">
                      {outcome.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
                <div className="inline-flex items-start gap-1.5 text-xs font-bold text-emerald-300 pt-2.5 border-t border-white/10">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{outcome.deliverable}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Band Directly Under "WHY CHOOSE US?": Audience Alignment ("WHO IS THIS FOR?") */}
      <div className="bg-[#F7F8FA] py-14 sm:py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E41937] block mb-1.5">
              Program Fit &amp; Outcomes
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
              WHO IS THIS <span className="text-[#E41937]">FOR?</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Select your background profile below to see how this 2-day institutional training elevates your workflow.
            </p>
          </div>

          <SegmentedTabs
            value={activePersona}
            onValueChange={setActivePersona}
            items={personaTabs}
            layoutId="audiencePersonaTabs"
            listClassName="sm:whitespace-nowrap"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPersona.persona}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg bg-white border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-md p-6 sm:p-8 space-y-5 max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#222222]">
                    {currentPersona.persona}
                  </h3>
                  <p className="text-sm font-bold text-[#E41937] mt-0.5">
                    {currentPersona.tagline}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRegisterClick}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Enroll Now
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider block">
                    Current Challenge
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentPersona.painPoint}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded bg-[#1F386B]/5 border border-[#1F386B]/20 space-y-1.5">
                  <span className="text-[11px] uppercase font-extrabold text-[#1F386B] tracking-wider block">
                    Bootcamp Transformation
                  </span>
                  <p className="text-sm font-semibold text-[#222222] leading-relaxed">
                    {currentPersona.takeaway}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
