import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LEARNING_OUTCOMES, AUDIENCE_PERSONAS } from '../../data/workshopData';

interface BenefitsSectionProps {
  onRegisterClick: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onRegisterClick }) => {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);

  const getOutcomeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-blue-600" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-blue-600" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-blue-600" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-blue-600" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-blue-600" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-blue-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-current" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-current" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-current" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-current" />;
      default:
        return <Sparkles className="w-5 h-5 text-current" />;
    }
  };

  return (
    <section id="outcomes" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Tangible Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            What You Will Build & Master in{' '}
            <span className="text-blue-600">
              2 Days
            </span>
          </h2>
          <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
            Move beyond superficial chat prompts. You will walk away with concrete, deployable assets and automation pipelines designed for real-world productivity.
          </p>
        </div>

        {/* 6 Core Learning Outcomes Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_OUTCOMES.map((outcome, idx) => (
            <Card key={outcome.id} hoverable className="p-6 flex flex-col justify-between border-slate-200 bg-white shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    {getOutcomeIcon(outcome.iconName)}
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] transition-colors">
                  {outcome.title}
                </h3>

                <p className="text-[#475569] text-sm leading-relaxed">
                  {outcome.description}
                </p>
              </div>

              {/* Hands-on Output Badge */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Deliverable</span>
                </div>
                <div className="text-xs font-medium text-[#0F172A] mt-1">
                  {outcome.deliverable}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Audience Fit Section */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="primary" size="md">
              Audience Alignment
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Who is This Bootcamp Designed For?
            </h3>
            <p className="text-[#475569] text-sm">
              Whether you are a newcomer or looking to scale your workplace efficiency, this curriculum meets you at your experience level.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-3xl mx-auto">
              {AUDIENCE_PERSONAS.map((item, idx) => (
                <button
                  key={item.persona}
                  onClick={() => setActivePersonaIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activePersonaIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60'
                  }`}
                >
                  {getPersonaIcon(item.iconName)}
                  <span>{item.persona}</span>
                </button>
              ))}
            </div>

            {/* Active Persona Details Card */}
            <div className="mt-6 max-w-3xl mx-auto">
              <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#0F172A]">
                      {AUDIENCE_PERSONAS[activePersonaIndex].persona}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium">
                      {AUDIENCE_PERSONAS[activePersonaIndex].tagline}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onRegisterClick}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Enroll Now
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Current Challenge
                    </span>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {AUDIENCE_PERSONAS[activePersonaIndex].painPoint}
                    </p>
                  </div>

                  <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                    <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                      Your Bootcamp Transformation
                    </span>
                    <p className="text-sm text-[#0F172A] leading-relaxed">
                      {AUDIENCE_PERSONAS[activePersonaIndex].takeaway}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
