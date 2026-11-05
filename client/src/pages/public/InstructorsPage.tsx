import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { MentorSection } from '../../components/sections/MentorSection';
import { Button } from '../../components/common/Button';
import { ArrowRight, Award, ShieldCheck, Users } from 'lucide-react';

export const InstructorsPage: React.FC = () => {
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
              World-Class Faculty
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Learn Directly from Staff AI Engineers & Architects
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Our instructors build enterprise AI software daily. Get guided insights into actual production architectures, avoid common pitfalls, and gain practical engineering intuition.
            </p>
          </div>
        </section>

        {/* Mentor Section */}
        <MentorSection onRegisterClick={scrollToRegister} />

        {/* Faculty Highlights */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">1,500+ Engineers Trained</h3>
                <p className="text-xs text-slate-500">
                  Alumni working at Google, Microsoft, Amazon, Swiggy, and high-growth AI startups.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">100% Live Hands-On</h3>
                <p className="text-xs text-slate-500">
                  Every minute is live with interactive screen sharing, immediate Q&A, and live debugging.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">Verified Mentorship</h3>
                <p className="text-xs text-slate-500">
                  Personal code reviews on your capstone project before certification issuance.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button variant="primary" size="lg" onClick={scrollToRegister} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Reserve Seat in Next Live Cohort (₹1,999)
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
