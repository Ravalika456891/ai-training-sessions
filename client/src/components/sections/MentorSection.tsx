import React from 'react';
import { ShieldCheck, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
import { MENTORS_DATA } from '../../data/workshopData';

interface MentorSectionProps {
  onRegisterClick: () => void;
}

export const MentorSection: React.FC<MentorSectionProps> = ({ onRegisterClick }) => {
  return (
    <section
      id="mentors"
      className="py-20 sm:py-24 bg-white relative scroll-mt-20 border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5 text-[#081e4a]" />}>
            Direct Mentorship
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Learn Directly from{' '}
            <span className="text-[#081e4a]">
              Active Practitioners
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            No theoretical academics. Our live cohorts are led by senior AI engineers and product architects shipping production systems daily.
          </p>
        </MotionReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {MENTORS_DATA.map((mentor, idx) => (
            <MotionBentoCard
              key={mentor.id}
              delay={idx * 0.08}
              className="group p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#081e4a]" />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#081e4a]/80 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-[#081e4a]/15">
                      <ShieldCheck className="w-4 h-4 text-[#081e4a]" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] truncate">
                      {mentor.name}
                    </h3>
                    <p className="text-sm font-bold text-[#081e4a]">{mentor.role}</p>
                    <p className="text-xs text-slate-500 font-medium">{mentor.company}</p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">{mentor.bio}</p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Core Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-50/90 text-[#081e4a] border border-[#081e4a]/20 font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[#081e4a] font-bold">
                  <Award className="w-4 h-4" />
                  Verified Lead Instructor
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Live Cohort Mentor
                </span>
              </div>
            </MotionBentoCard>
          ))}
        </div>

        <MotionReveal delay={0.12} className="mt-12 text-center">
          <Button
            variant="gradient"
            size="lg"
            onClick={onRegisterClick}
            className="rounded-2xl shadow-lg shadow-blue-900/15"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Learn with These Mentors
          </Button>
        </MotionReveal>
      </div>
    </section>
  );
};
