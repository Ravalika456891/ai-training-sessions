import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Search,
  Clock,
  Lock,
  CreditCard,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardCertificates: React.FC = () => {
  const { dashboardData, progress, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];
  const submissions = dashboardData?.submissions || [];
  const certificates = dashboardData?.certificates || [];
  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0];
  const previewWorkshop = availableWorkshops[0] || primary?.workshop;
  const currentProgress = progress[0];

  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [verifySerialInput, setVerifySerialInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isConfirmed = Boolean(primary?.isAuthorized);
  const hasSubmitted = submissions.length > 0 || Boolean(currentProgress?.projectSubmitted);
  const isEligible = isConfirmed && hasSubmitted;

  const handleVerifySerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySerialInput.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const res = await fetch(
        `/api/certificates/verify/${encodeURIComponent(verifySerialInput.trim())}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Certificate serial number not found.');
      }
      setVerifyResult(data.data);
    } catch (err: any) {
      setVerifyError(err.message || 'Could not verify certificate.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Certificates
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track your certificate eligibility, download issued credentials, and verify serial numbers.
        </p>
      </div>

      {/* 1. Certificate Eligibility Checklist */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Completion Eligibility Status
            </h3>
            <p className="text-xs text-slate-500">
              Complete the requirements below to receive your verified AI Launchpad Certificate.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border self-start sm:self-auto ${
              certificates.length > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isEligible
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {certificates.length > 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certificate Issued</span>
              </>
            ) : isEligible ? (
              <>
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Eligible • Ready for Approval</span>
              </>
            ) : (
              <span>In Progress</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isConfirmed
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                isConfirmed ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <div>
              <span className="font-bold block">1. Confirmed Enrollment</span>
              <span className="text-[11px]">{isConfirmed ? 'Completed' : 'Pending'}</span>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              hasSubmitted
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                hasSubmitted ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <div>
              <span className="font-bold block">2. Assignment Submission</span>
              <span className="text-[11px]">
                {hasSubmitted ? 'Submitted' : 'Submit in Assignments tab'}
              </span>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              certificates.length > 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Award
              className={`w-4 h-4 shrink-0 ${
                certificates.length > 0 ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <div>
              <span className="font-bold block">3. Credential Issuance</span>
              <span className="text-[11px]">
                {certificates.length > 0 ? 'Issued & Verifiable' : 'Issued upon mentor review'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Issued Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            {isConfirmed ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6 text-amber-600" />}
          </div>
          <h3 className="font-bold text-base text-[#0F172A]">
            {isEligible
              ? 'You Are Eligible for Your Certificate!'
              : isConfirmed
              ? 'Complete Your Capstone to Unlock Your Certificate'
              : 'Certificate Issuance Requires Confirmed Workshop Enrollment'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isEligible
              ? 'Your assignment has been submitted. Your cryptographically signed certificate will appear here as soon as instructor approval is finalized.'
              : isConfirmed
              ? 'Attend Day 1 & Day 2 live sessions and submit your capstone assignment in the Assignments tab to unlock your official certificate.'
              : 'You can view our certificate eligibility criteria and verify public credentials above. To earn your verifiable AI Launchpad Certificate, enroll and complete a workshop cohort.'}
          </p>
          {!isConfirmed && (
            <div className="pt-1">
              {primary && !primary.isAuthorized ? (
                <button
                  onClick={() => openCheckout(primary.enrollmentId)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Complete Payment (₹{(primary.workshop?.price?.basePrice || 1999).toLocaleString('en-IN')})</span>
                </button>
              ) : (
                previewWorkshop && (
                  <button
                    onClick={() => enrollInBatch(previewWorkshop._id)}
                    disabled={isEnrolling}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {isEnrolling
                        ? 'Starting Checkout...'
                        : `Enroll & Pay (₹${(previewWorkshop.price || 2999).toLocaleString('en-IN')})`}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert: any) => (
            <div
              key={cert._id || cert.serialNumber}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official Credential
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#0F172A] leading-snug">
                    {cert.workshopTitle || 'AI Launchpad Masterclass Certification'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Recipient: <strong className="text-[#0F172A]">{cert.recipientName}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">
                      Serial Number
                    </span>
                    <span className="font-bold text-indigo-600">{cert.serialNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">
                      Issued On
                    </span>
                    <span className="text-slate-600">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setVerifySerialInput(cert.serialNumber);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Serial</span>
                </button>

                <button
                  onClick={() => setSelectedCert(cert)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download / View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Certificate Verification Box */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verify a Certificate Record</span>
          </h3>
          <p className="text-xs text-slate-500">
            Enter any AI Launchpad certificate serial number (e.g. AILP-CERT-2026-8801) to verify authenticity.
          </p>
        </div>

        <form onSubmit={handleVerifySerial} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={verifySerialInput}
            onChange={(e) => setVerifySerialInput(e.target.value)}
            placeholder="Enter Serial Number (e.g. AILP-CERT-2026-8801)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Credential'}</span>
          </button>
        </form>

        {verifyError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {verifyError}
          </div>
        )}

        {verifyResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span>✓ Authentic AI Launchpad Credential</span>
              <span className="font-mono">{verifyResult.serialNumber}</span>
            </div>
            <p className="text-emerald-800">
              Issued to <strong>{verifyResult.recipientName}</strong> for completing{' '}
              <strong>{verifyResult.workshopTitle}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Certificate Preview & Print Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Verified Certificate</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-blue-50/70 to-white text-[#0F172A] border-2 border-blue-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-blue-600">
                AI LAUNCHPAD ACADEMY
              </span>
              <h2 className="text-xl font-black text-[#0F172A]">Certificate of Completion</h2>
              <p className="text-xs text-slate-500">This certifies that</p>
              <div className="text-lg font-black text-blue-600">
                {selectedCert.recipientName || 'Student'}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has successfully completed the 2-Day Hands-On AI Bootcamp, demonstrating practical mastery in prompt engineering, AI workflows, and capstone deployment.
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Serial: {selectedCert.serialNumber}</span>
                <span>Date: {new Date(selectedCert.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
