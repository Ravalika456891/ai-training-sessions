import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Award,
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { WORKSHOP_CONFIG } from '../../data/workshopData';

interface FooterProps {
  onRegisterClick?: () => void;
  onOpenVerifyModal?: () => void;
}

/** Exact IIEM Institution Part 13 dark #222222 footer with dashed link dividers and #1b1b1b bottom bar. */
export const Footer: React.FC<FooterProps> = ({
  onRegisterClick,
  onOpenVerifyModal,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#222222] text-neutral-300 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Institution Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1F386B] border-2 border-[#E41937] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-base uppercase tracking-tight text-white">
                  AI LAUNCHPAD <span className="text-[#E41937]">INSTITUTION</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {WORKSHOP_CONFIG.edition}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {WORKSHOP_CONFIG.subTagline}
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: Globe, label: 'Online Live Training', onClick: () => scrollToSection('#about') },
                { icon: Calendar, label: 'Batch Schedule', onClick: () => scrollToSection('#pricing') },
                { icon: Award, label: 'Certificate Verification', onClick: () => onOpenVerifyModal?.() },
                { icon: Mail, label: 'Academic Support', href: `mailto:${WORKSHOP_CONFIG.supportEmail}` },
              ].map((item, idx) => {
                const Icon = item.icon;
                if (item.href) {
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      aria-label={item.label}
                      className="w-9 h-9 rounded-full bg-white text-[#222222] hover:bg-[#E41937] hover:text-white flex items-center justify-center transition-colors shadow"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={item.label}
                    onClick={item.onClick}
                    className="w-9 h-9 rounded-full bg-white text-[#222222] hover:bg-[#E41937] hover:text-white flex items-center justify-center transition-colors shadow cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="text-xs sm:text-sm text-neutral-400">
              <li className="border-b border-dashed border-neutral-700 py-2">
                <button
                  type="button"
                  onClick={() => onRegisterClick?.()}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Online Registration
                </button>
              </li>
              {onOpenVerifyModal && (
                <li className="border-b border-dashed border-neutral-700 py-2">
                  <button
                    type="button"
                    onClick={onOpenVerifyModal}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Online Verification
                  </button>
                </li>
              )}
              <li className="border-b border-dashed border-neutral-700 py-2">
                <Link to="/signin" className="hover:text-white transition-colors">
                  Student Portal Sign In
                </Link>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2">
                <Link to="/signup" className="hover:text-white transition-colors">
                  Create Learner Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Program Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Useful Links
            </h4>
            <ul className="text-xs sm:text-sm text-neutral-400">
              <li className="border-b border-dashed border-neutral-700 py-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('#outcomes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Why Choose Us
                </button>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('#curriculum')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Our Curriculum
                </button>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('#tools')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AI Tool Stack
                </button>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('#mentors')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Our Mentors
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="text-xs sm:text-sm text-neutral-400">
              <li className="border-b border-dashed border-neutral-700 py-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E41937] shrink-0" />
                <span>Sat &amp; Sun • 10:00 AM – 3:00 PM IST</span>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2">
                <a
                  href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E41937] shrink-0" />
                  <span>{WORKSHOP_CONFIG.supportEmail}</span>
                </a>
              </li>
              <li className="border-b border-dashed border-neutral-700 py-2 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Live Online Interactive Cohort • 100% Refund Guarantee</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* IIEM Darkest Bottom Copyright Strip */}
      <div className="bg-[#181818] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <p>{WORKSHOP_CONFIG.brandName} Institution • © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('#faq')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <span className="text-neutral-600">|</span>
            <button
              type="button"
              onClick={() => onOpenVerifyModal?.()}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Verify Certificate
            </button>
            <span className="text-neutral-600">|</span>
            <a href={`mailto:${WORKSHOP_CONFIG.supportEmail}`} className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
