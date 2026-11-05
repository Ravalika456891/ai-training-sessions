import React from 'react';
import { CreditCard, CheckCircle2, Clock, ShieldCheck, FileText } from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardPayments: React.FC = () => {
  const { payments, dashboardData } = useDashboard();
  const workshops = dashboardData?.workshops || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Payment History & Invoices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review past transactions, payment status, and download official GST invoices.
          </p>
        </div>
      </div>

      {payments.length === 0 && workshops.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">No Payment Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't initiated any enrollment transactions yet. All cohorts are priced uniformly at ₹1,999.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Transaction / Cohort</th>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Amount (INR)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Real Payment records */}
                {payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#0F172A]">
                      {p.workshopId?.title || 'AI Launchpad 2-Day Bootcamp'}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        Batch: {p.workshopId?.batchCode || 'AILP'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {p.providerOrderId || p._id}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#0F172A]">
                      ₹{p.amount?.toLocaleString('en-IN') || '2,359'}
                      <span className="block text-[10px] text-slate-400 font-normal">Incl. 18% GST</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          p.status === 'captured' || p.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status === 'captured' || p.status === 'paid' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* If user has enrollments but payments array was empty, render enrollment record */}
                {payments.length === 0 &&
                  workshops.map((w: any) => (
                    <tr key={w.enrollmentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#0F172A]">
                        {w.workshop?.title || 'AI Launchpad Bootcamp'}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Batch: {w.workshop?.batchCode}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">{w.enrollmentId}</td>
                      <td className="py-4 px-6 font-bold text-[#0F172A]">
                        ₹2,359
                        <span className="block text-[10px] text-slate-400 font-normal">₹1,999 + 18% GST</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            w.isAuthorized
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {w.isAuthorized ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{w.paymentStatus || (w.isAuthorized ? 'paid' : 'pending')}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Guarantee */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <span className="font-bold text-[#0F172A] block">100% Secure Processing</span>
          <span>
            Payments are encrypted with 256-bit SSL via PCI-DSS compliant gateways. Official GST tax invoices are provided with every order.
          </span>
        </div>
      </div>
    </div>
  );
};
