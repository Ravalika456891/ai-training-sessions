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
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 6 Columns: Deep IIEM Navy Panel with Side-by-Side Outcome Cards ("WHY CHOOSE US?") */}
        <div className="lg:col-span-6 bg-[#1F386B] text-white py-12 sm:py-14 px-6 sm:px-8 xl:px-12 flex flex-col justify-center">
          <div className="max-w-2xl lg:ml-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white iiem-line-bottom">
                WHY CHOOSE <span className="text-[#E41937] bg-white px-2 py-0.5 rounded-xs text-2xl sm:text-[1.7rem]">US?</span>
              </h2>
              <p className="mt-4 text-sm text-blue-100/90 leading-relaxed">
                Move beyond basic chat prompts. Walk away with 6 concrete, production-ready AI deliverables built step-by-step.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LEARNING_OUTCOMES.map((outcome) => (
                <div
                  key={outcome.id}
                  className="rounded-lg bg-white/[0.06] border border-white/15 hover:border-[#E41937]/80 p-4 flex flex-col justify-between gap-2.5 transition-colors group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        {getOutcomeIcon(outcome.iconName)}
                      </div>
                      <h3 className="text-[13px] font-extrabold uppercase tracking-wide leading-snug text-white">
                        {outcome.title}
                      </h3>
                    </div>
                    <p className="text-xs text-blue-100/85 leading-relaxed">
                      {outcome.description}
                    </p>
                  </div>
                  <div className="inline-flex items-start gap-1.5 text-[11px] font-bold text-emerald-300 pt-2 border-t border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{outcome.deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Crisp Silver-Light Audience Alignment Panel */}
        <div className="lg:col-span-6 bg-[#F7F8FA] py-12 sm:py-14 px-6 sm:px-8 xl:px-12 flex flex-col justify-center">
          <div className="max-w-2xl w-full space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#E41937] block mb-1">
                Program Fit &amp; Outcomes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom">
                WHO IS THIS <span className="text-[#E41937]">FOR?</span>
              </h2>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Select your background profile below to see how this 2-day institutional training elevates your workflow.
              </p>
            </div>

            <SegmentedTabs
              value={activePersona}
              onValueChange={setActivePersona}
              items={personaTabs}
              layoutId="audiencePersonaTabs"
              listClassName="justify-start"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPersona.persona}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-white border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-md p-6 sm:p-7 space-y-5"
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
                  <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider block">
                      Current Challenge
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {currentPersona.painPoint}
                    </p>
                  </div>

                  <div className="p-4 rounded bg-[#1F386B]/5 border border-[#1F386B]/20 space-y-1.5">
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
      </div>
    </section>
  );
};
