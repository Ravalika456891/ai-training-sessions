import React from 'react';
import { Mail, Clock, ShieldCheck } from 'lucide-react';
import { WORKSHOP_CONFIG } from '../../data/workshopData';

interface FooterProps {
  onRegisterClick?: () => void;
  onOpenVerifyModal?: () => void;
}

/** Minimal institutional Contact Us footer in the dark #222222 IIEM theme. */
export const Footer: React.FC<FooterProps> = () => {
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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h4 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-white inline-block pb-2.5 relative">
            Contact Us
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-10 h-0.5 bg-[#E41937]"
            />
          </h4>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-neutral-300">
          <li className="rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3.5 flex items-center justify-center sm:justify-start gap-3">
            <Clock className="w-4 h-4 text-[#E41937] shrink-0" />
            <span>Sat &amp; Sun • 10:00 AM – 3:00 PM IST</span>
          </li>
          <li className="rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3.5 flex items-center justify-center sm:justify-start">
            <a
              href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
              className="hover:text-white transition-colors flex items-center gap-3"
            >
              <Mail className="w-4 h-4 text-[#E41937] shrink-0" />
              <span>{WORKSHOP_CONFIG.supportEmail}</span>
            </a>
          </li>
          <li className="rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3.5 flex items-center justify-center sm:justify-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Live Online Interactive Cohort • 100% Refund Guarantee</span>
          </li>
        </ul>
      </div>

      {/* Minimal Copyright Strip with mobile sticky bar clearance */}
      <div className="bg-[#181818] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-4 text-center text-xs text-neutral-400">
          <p>{WORKSHOP_CONFIG.brandName} Institution • © {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};
