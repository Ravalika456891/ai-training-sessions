import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminPayments: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, search });
      const res = await adminFetch(`/api/admin/payments?${params.toString()}`);
      setPayments(res.data.payments || []);
      setSummary(res.data.summary || {});
    } catch (err: any) {
      showToast(err.message || 'Failed to load payments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const exportCsvReport = () => {
    const headers = [
      'OrderID',
      'PaymentID',
      'Student',
      'Email',
      'Batch',
      'AmountINR',
      'Status',
      'VerifiedSignature',
      'CreatedAt',
    ];
    const rows = payments.map((p) => [
      p.providerOrderId,
      p.providerPaymentId,
      `"${p.studentName}"`,
      p.studentEmail,
      p.batchCode,
      p.amount,
      p.status,
      p.hasVerifiedSignature ? 'YES' : 'NO',
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ai-launchpad-financial-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial CSV report exported');
  };

  const handleReconcileGateway = async (paymentId: string) => {
    try {
      await adminFetch(`/api/admin/payments/${paymentId}/reconcile`, {
        method: 'POST',
        body: JSON.stringify({ action: 'query_gateway' }),
      });
      showToast('Payment reconciled with Razorpay gateway');
      loadPayments();
    } catch (err: any) {
      showToast(err.message || 'Reconciliation check completed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Razorpay Payment & Revenue Ledger</h2>
          <p className="text-xs text-slate-500">
            Verify cryptographic payment signatures, reconcile gateway statuses, and export financial reports.
          </p>
        </div>
        <button
          onClick={exportCsvReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E41937] hover:bg-[#c5122d] text-white text-xs font-bold shadow-xs cursor-pointer self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Verified Revenue</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5" />
            {Number(summary.verifiedRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">
            {summary.capturedCount || 0} Captured Payments
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Pending Orders</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            ₹{Number(summary.pendingAmount || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">
            {summary.pendingCount || 0} Awaiting Capture
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Failed Attempts</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary.failedCount || 0}</p>
          <span className="text-[11px] text-slate-400">Zero unverified overrides</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Refunded Total</span>
          <p className="text-2xl font-black text-slate-700 mt-1">
            ₹{Number(summary.refundedAmount || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">{summary.refundedCount || 0} Refunds</span>
        </div>
      </div>

      {/* Security Policy Notice */}
      <div className="p-4 rounded-2xl bg-[#1F386B]/[0.06] border border-[#1F386B]/20 flex items-center gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-[#1F386B] shrink-0" />
        <span>
          <strong>Strict Financial Integrity Policy:</strong> Unverified payments can never be manually marked as paid. All transitions to <code>captured</code> require a valid Razorpay HMAC-SHA256 signature or live gateway verification.
        </span>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadPayments()}
              placeholder="Search by Razorpay Order ID, Payment ID, or student email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="all">All Payment Statuses</option>
            <option value="captured">Captured (Verified)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-5 h-5 text-[#1F386B] animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading payment ledger...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No Razorpay transaction records found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Order / Payment ID</th>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Batch</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Signature</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Reconcile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#0F172A]">{p.providerOrderId}</div>
                      <div className="text-[11px] text-slate-500">{p.providerPaymentId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">{p.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{p.batchCode}</td>
                    <td className="py-3 px-4 font-black text-[#0F172A]">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {p.hasVerifiedSignature ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          HMAC Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'captured'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleReconcileGateway(p._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1F386B]/[0.06] hover:bg-[#1F386B]/10 text-[#1F386B] font-semibold cursor-pointer"
                        >
                          Sync Gateway
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

