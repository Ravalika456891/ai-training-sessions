import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Ban, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminCertificates: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/certificates');
      setCertificates(res.data.certificates || []);
      setCandidates(res.data.eligibleCandidates || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load certificates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleIssue = async (candidate: any) => {
    try {
      await adminFetch('/api/admin/certificates/issue', {
        method: 'POST',
        body: JSON.stringify({
          enrollmentId: candidate._id || candidate.enrollmentId,
          recipientName: candidate.studentName,
          workshopTitle: candidate.workshopTitle,
        }),
      });
      showToast(`Certificate issued to ${candidate.studentName}`);
      loadCertificates();
    } catch (err: any) {
      showToast(err.message || 'Could not issue certificate', 'error');
    }
  };

  const handleRevoke = async (cert: any) => {
    const reason = window.prompt(
      `Enter mandatory audit reason to revoke certificate ${cert.serialNumber}:`,
      'Revoked due to incomplete attendance / refund processed'
    );
    if (!reason || !reason.trim()) return;

    try {
      await adminFetch(`/api/admin/certificates/${cert._id || cert.serialNumber}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      showToast(`Certificate ${cert.serialNumber} revoked`);
      loadCertificates();
    } catch (err: any) {
      showToast(err.message || 'Revocation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Certificate Issuance & Registry</h2>
          <p className="text-xs text-slate-500">
            Review completion eligibility, issue cryptographically signed credentials, and manage revocations.
          </p>
        </div>
        <span className="text-xs font-bold text-[#1F386B] bg-[#1F386B]/[0.06] px-3 py-1.5 rounded-xl border border-[#1F386B]/20 self-start">
          Issued Credentials: {certificates.filter((c) => !c.isRevoked).length}
        </span>
      </div>

      {/* Completion Eligibility Queue */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Completion Eligibility & Approval Queue
        </h3>
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-[#1F386B] animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Evaluating eligible students...</p>
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No confirmed enrollments awaiting certificate review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Student</th>
                  <th className="py-2.5 px-3 font-semibold">Batch</th>
                  <th className="py-2.5 px-3 font-semibold">Attendance & Capstone</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Certificate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand, i) => (
                  <tr key={cand._id || i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#0F172A]">{cand.studentName}</div>
                      <div className="text-[11px] text-slate-500">{cand.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{cand.batchCode}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed & Eligible
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {cand.alreadyIssued ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Issued ({cand.certificateSerial || 'Verified'})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIssue(cand)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E41937] hover:bg-[#c5122d] text-white font-bold cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Approve & Issue</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issued Certificates Registry */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Official Certificate Registry</h3>
        {certificates.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No certificates issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Serial Number</th>
                  <th className="py-2.5 px-3 font-semibold">Recipient</th>
                  <th className="py-2.5 px-3 font-semibold">Issued Date</th>
                  <th className="py-2.5 px-3 font-semibold">HMAC Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert._id || cert.serialNumber} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1F386B]">
                      {cert.serialNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{cert.recipientName}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      {cert.isRevoked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          Revoked: {cert.revokedReason}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Active & Verifiable
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!cert.isRevoked && (
                        <button
                          onClick={() => handleRevoke(cert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

