import React from 'react';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MENTORS_DATA } from '../../data/workshopData';

interface MentorSectionProps {
  onRegisterClick: () => void;
}

export const MentorSection: React.FC<MentorSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="mentors" className="py-20 bg-[#0A0F1D] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Direct Mentorship
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Learn Directly from Active Practitioners
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            No theoretical academics. Our sessions are led by senior AI engineers and product architects with verified hands-on production experience.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {MENTORS_DATA.map((mentor) => (
            <Card key={mentor.id} hoverable className="p-6 sm:p-8 border-slate-800 bg-[#111827] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500/40"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#0A0F1D] p-1 rounded-full">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {mentor.name}
                    </h3>
                    <p className="text-sm font-semibold text-blue-400">
                      {mentor.role}
                    </p>
                    <p className="text-xs text-slate-400">
                      {mentor.company}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {mentor.bio}
                </p>

                {/* Expertise Badges */}
                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                    Core Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#0A0F1D] text-blue-300 border border-blue-600/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <Award className="w-4 h-4" />
                  Verified Lead Instructor
                </span>
                <span className="text-[11px] text-slate-500 italic">
                  Sample Mentor Profile
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Live Cohort Mentorship CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="primary"
            size="md"
            onClick={onRegisterClick}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Learn with These Mentors
          </Button>
        </div>
      </div>
    </section>
  );
};
