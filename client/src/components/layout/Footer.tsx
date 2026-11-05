import React from 'react';
import { Sparkles, Shield, Mail, ExternalLink } from 'lucide-react';
import { WORKSHOP_CONFIG } from '../../data/workshopData';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 text-[#475569] text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-[#0F172A]">
                {WORKSHOP_CONFIG.brandName}
              </span>
            </div>
            <p className="text-[#475569] text-sm max-w-sm leading-relaxed">
              Empowering students, professionals, founders, and creators with hands-on, practical generative AI training. Build real prototypes, assistants, and automations in one focused weekend.
            </p>
            <div className="flex items-center gap-2 text-slate-700 text-xs bg-white border border-slate-200 rounded-lg p-2.5 max-w-sm shadow-sm">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Independent training program. Real projects. No fabricated urgency.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Workshop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#outcomes" className="hover:text-blue-600 transition-colors">
                  Learning Outcomes
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-blue-600 transition-colors">
                  2-Day Curriculum
                </a>
              </li>
              <li>
                <a href="#tools" className="hover:text-blue-600 transition-colors">
                  AI Tools Covered
                </a>
              </li>
              <li>
                <a href="#mentors" className="hover:text-blue-600 transition-colors">
                  Instructor Profiles
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-blue-600 transition-colors">
                  Batch Pricing & Dates
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Assurance & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#faq" className="hover:text-blue-600 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <span className="text-slate-500 hover:text-blue-600 cursor-pointer">
                  Certificate Verification
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-blue-600 cursor-pointer">
                  100% Refund Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-blue-600 cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-blue-600 cursor-pointer">
                  Privacy & Data Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Learner Support
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have questions about batch timings, enterprise training, or hardware prerequisites?
            </p>
            <a
              href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
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
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {WORKSHOP_CONFIG.brandName}. All rights reserved. MERN Stack Implementation.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span>Notice: Data is configurable sample data until live API sync.</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

