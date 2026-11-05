import React from 'react';
import { Sparkles, Shield, Mail, ExternalLink } from 'lucide-react';
import { WORKSHOP_CONFIG } from '../../data/workshopData';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1E293B] bg-[#0A0F1D] text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">
                {WORKSHOP_CONFIG.brandName}
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Empowering students, professionals, founders, and creators with hands-on, practical generative AI training. Build real prototypes, assistants, and automations in one focused weekend.
            </p>
            <div className="flex items-center gap-2 text-slate-300 text-xs bg-[#111827] border border-[#1E293B] rounded-lg p-2.5 max-w-sm">
              <Shield className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Independent training program. Real projects. No fabricated urgency.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Workshop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#outcomes" className="hover:text-white transition-colors">
                  Learning Outcomes
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-white transition-colors">
                  2-Day Curriculum
                </a>
              </li>
              <li>
                <a href="#tools" className="hover:text-white transition-colors">
                  AI Tools Covered
                </a>
              </li>
              <li>
                <a href="#mentors" className="hover:text-white transition-colors">
                  Instructor Profiles
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Batch Pricing & Dates
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Assurance & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">
                  Certificate Verification
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">
                  100% Refund Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer">
                  Privacy & Data Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Learner Support
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions about batch timings, enterprise training, or hardware prerequisites?
            </p>
            <a
              href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              {WORKSHOP_CONFIG.supportEmail}
            </a>
            <div className="pt-2 text-[11px] text-slate-400">
              Hours: Mon - Fri, 9:00 AM - 7:00 PM IST
            </div>
          </div>
        </div>

        {/* PRD Compliance Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {WORKSHOP_CONFIG.brandName}. All rights reserved. MERN Stack Implementation.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span>Notice: Data is configurable sample data until live API sync.</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

