import React, { useState } from 'react';
import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardCertificates: React.FC = () => {
  const { dashboardData } = useDashboard();
  const certificates = dashboardData?.certificates || [];
  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Accredited Certificates & Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified proof of mastery in Generative AI, Prompt Engineering, and Autonomous Agent Development.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Certificate in Progress</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your official certificate is issued automatically following attendance verification and mentor approval of your Day 2 capstone project submission.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Cryptographically signed & verifiable via unique serial numbers</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert: any) => (
            <div
              key={cert._id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official Credential
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#0F172A] leading-snug">
                    AI Launchpad Masterclass Certification
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Awarded for demonstrating proficiency in generative models, agentic workflows, and capstone deployment.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Serial Number</span>
                    <span className="font-bold text-blue-700">{cert.serialNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Issue Date</span>
                    <span className="text-slate-600">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified & Active</span>
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedCert(cert)}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Credential
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Verified Certificate</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-blue-600">
                AI LAUNCHPAD ACADEMY
              </span>
              <h2 className="text-xl font-black text-[#0F172A]">Certificate of Mastery</h2>
              <p className="text-xs text-slate-600">This certifies that</p>
              <div className="text-lg font-black text-blue-700">{selectedCert.recipientName || 'Student'}</div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has successfully completed the 2-Day Hands-On AI Masterclass, covering LLM engineering, agentic automation, and capstone deployment.
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Serial: {selectedCert.serialNumber}</span>
                <span>Date: {new Date(selectedCert.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                rightIcon={<Download className="w-3.5 h-3.5" />}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
