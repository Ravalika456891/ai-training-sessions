import React from 'react';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
import { MENTORS_DATA } from '../../data/workshopData';

interface MentorSectionProps {
  onRegisterClick: () => void;
}

/** IIEM Part 7 "OUR TEACHERS" styled mentor portrait grid with navy/crimson bottom borders. */
export const MentorSection: React.FC<MentorSectionProps> = ({ onRegisterClick }) => {
  return (
    <section
      id="mentors"
      className="py-16 sm:py-20 bg-white relative scroll-mt-20 border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
            OUR <span className="text-[#E41937]">MENTORS</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            Highly qualified, practicing AI engineers and product architects dedicated to hands-on institutional mentorship.
          </p>
        </MotionReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {MENTORS_DATA.map((mentor) => (
            <MotionBentoCard
              key={mentor.id}
              className="group overflow-hidden flex flex-col justify-between bg-[#F7F8FA]"
            >
              <div>
                {/* Studio Portrait Frame */}
                <div className="bg-slate-200/80 pt-7 pb-0 px-6 flex justify-center relative overflow-hidden">
                  <div className="relative">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-40 h-44 sm:w-44 sm:h-48 object-cover object-top rounded-t-md shadow-md border-t-2 border-x-2 border-white group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div
                      className="absolute top-2 right-2 bg-[#1F386B] text-white p-1.5 rounded-full shadow"
                      title="Verified Lead Instructor"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* IIEM Centered Info Block */}
                <div className="p-6 bg-white text-center space-y-2 border-t border-slate-200">
                  <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#222222]">
                    {mentor.name}
                  </h3>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#E41937]">
                    {mentor.role} • {mentor.company}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed pt-2 text-left">
                    {mentor.bio}
                  </p>

                  <div className="pt-3 flex flex-wrap justify-center gap-1.5">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2.5 py-0.5 rounded bg-slate-100 text-[#1F386B] border border-slate-200 font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-[#1F386B] text-white flex items-center justify-between text-xs font-bold group-hover:bg-[#E41937] transition-colors">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  Lead Bootcamp Faculty
                </span>
                <span className="text-[11px] text-white/90">Live Cohort Session</span>
              </div>
            </MotionBentoCard>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={onRegisterClick}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Train Live With Our Mentors
          </Button>
        </div>
      </div>
    </section>
  );
};
