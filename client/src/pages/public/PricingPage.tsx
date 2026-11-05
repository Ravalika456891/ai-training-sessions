import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PricingSection } from '../../components/sections/PricingSection';
import { BATCH_OPTIONS } from '../../data/workshopData';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const PricingPage: React.FC = () => {
  const [selectedBatchId, setSelectedBatchId] = useState(BATCH_OPTIONS[0].id);

  const handleProceed = () => {
    window.location.href = `/#register`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Navbar onRegisterClick={handleProceed} />

      <main className="flex-1">
        {/* Page Banner Header */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Transparent, Uniform Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              One Transparent Price Across All Live Cohorts
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Every cohort features identical access to Staff AI mentors, live coding breakout rooms, starter repos, and accredited certificates at ₹1,999.
            </p>
          </div>
        </section>

        {/* The Pricing Section */}
        <PricingSection
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          onProceedToRegister={handleProceed}
        />

        {/* What's Included Full Breakdown */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0F172A]">Everything Included in Your ₹1,999 Seat</h2>
              <p className="text-xs text-slate-500">Zero hidden software fees. All production tools covered during workshop.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { title: '10 Hours of Live Hands-on Mentoring', desc: 'Interactive Google Meet / Zoom HD classroom with real-time screen sharing and code review.' },
                { title: '4 Complete Capstone Deliverables', desc: 'Build an Enterprise Assistant, Automated Lead Pipeline, RAG Knowledge Base, and Vision App.' },
                { title: 'Enterprise Prompt Engineering Library', desc: '10 battle-tested system prompt templates formatted for Claude 3.5, GPT-4o, and Gemini 2.0.' },
                { title: 'Production React Starter Codebases', desc: 'Full-stack modern repository with streaming UI, dark mode, and webhook integrations.' },
                { title: 'Cryptographically Signed Certificate', desc: 'Permanent verifiable credential with unique serial number and tamper-proof hash.' },
                { title: 'Lifetime Alumni Slack / Discord Access', desc: 'Collaborate with over 1,500 practicing AI builders, share opportunities, and attend office hours.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{item.title}</h4>
                    <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Money Back Guarantee Banner */}
            <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">100% Risk-Free Guarantee</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    If after the first 2 hours of Day 1 you don't feel you're gaining practical value, email us for a full 100% refund — no questions asked.
                  </p>
                </div>
              </div>

              <Button variant="primary" size="md" onClick={handleProceed} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Reserve Your Seat
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
