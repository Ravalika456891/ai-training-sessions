import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { CurriculumSection } from '../../components/sections/CurriculumSection';
import { AIToolsSection } from '../../components/sections/AIToolsSection';
import { Button } from '../../components/common/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CurriculumPage: React.FC = () => {
  const scrollToRegister = () => {
    window.location.href = '/#pricing';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Navbar onRegisterClick={scrollToRegister} />

      <main className="flex-1">
        {/* Page Banner Header */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Complete 2-Day Syllabus
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Hands-On Curriculum: From Zero to Production AI
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              10 hours of immersive, practical engineering. You write code, test prompt architectures, and deploy real AI micro-services.
            </p>
          </div>
        </section>

        {/* The Full Curriculum Section */}
        <CurriculumSection onRegisterClick={scrollToRegister} />

        {/* AI Tools Explored */}
        <AIToolsSection />

        {/* Bottom CTA Banner */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              Ready to Build Production AI This Weekend?
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Seats are capped at 60 participants per cohort to ensure live instructor feedback on your code and prompts.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" size="lg" onClick={scrollToRegister} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Claim Seat at ₹1,999
              </Button>
              <Link to="/#pricing">
                <Button variant="outline" size="lg">
                  View All Cohort Dates
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
