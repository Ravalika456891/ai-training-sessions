import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Mail,
  ShieldCheck,
  Award,
  Calendar,
  Clock,
} from 'lucide-react';
import { WORKSHOP_CONFIG } from '../../data/workshopData';

interface FooterProps {
  onRegisterClick?: () => void;
  onOpenVerifyModal?: () => void;
}

/** Enterprise #081e4a royal-navy footer for the AI Training Session platform. */
export const Footer: React.FC<FooterProps> = ({
  onRegisterClick,
  onOpenVerifyModal,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#081e4a] text-white relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(rgba(147, 197, 253, 0.35) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-28 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/15">
          {/* Brand Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight text-white">
                  {WORKSHOP_CONFIG.brandName}
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  {WORKSHOP_CONFIG.edition}
                </div>
              </div>
            </div>

            <p className="text-sm text-blue-100/85 leading-relaxed max-w-md">
              {WORKSHOP_CONFIG.subTagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                Saturday &amp; Sunday Live
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                <Clock className="w-3.5 h-3.5 text-sky-300" />
                10 Hours Guided Labs
              </span>
            </div>
          </div>

          {/* Program Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
              Training Program
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#outcomes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Learning Outcomes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#curriculum')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  2-Day Curriculum
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#tools')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AI Tool Stack
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#mentors')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lead Mentors
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('#pricing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing &amp; Batches
                </button>
              </li>
            </ul>
          </div>

          {/* Learner Portal & Quick Actions */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
              Learner Portal &amp; Support
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <Link to="/signin" className="hover:text-white transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  Create Learner Account
                </Link>
              </li>
              {onOpenVerifyModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenVerifyModal}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-sky-300" />
                    <span>Verify Completion Certificate</span>
                  </button>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-300" />
                  <span>{WORKSHOP_CONFIG.supportEmail}</span>
                </a>
              </li>
            </ul>

            {onRegisterClick && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#081e4a] text-xs font-extrabold shadow-md transition-colors cursor-pointer"
                >
                  <span>Reserve Upcoming Cohort</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200/85">
          <p>© {new Date().getFullYear()} {WORKSHOP_CONFIG.brandName}. Practical Generative AI Training.</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>100% Refund Guarantee • Instant GST Receipt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
