import React, { useState, useEffect } from 'react';
import { Search, Ban, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminEnrollments: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadEnrollments = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      const res = await adminFetch(`/api/admin/enrollments?${params.toString()}`);
      setEnrollments(res.data.enrollments || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch (err: any) {
      showToast(err.message || 'Failed to load enrollments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments(1);
  }, [statusFilter, paymentFilter]);

  const handleCancelEnrollment = async (item: any) => {
    const reason = window.prompt(
      `Cancel enrollment ${item.enrollmentId} for ${item.studentName}? Enter audit reason:`,
      'Requested by student / administrative cancellation'
    );
    if (!reason) return;

    try {
      await adminFetch(`/api/admin/enrollments/${item._id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      showToast(`Enrollment ${item.enrollmentId} cancelled`);
      loadEnrollments(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel enrollment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#0F172A]">Registration & Enrollment Management</h2>
            <p className="text-xs text-slate-500">
              Monitor workshop registrations, verify seat statuses, and process authorized cancellations.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start">
            Total Records: {pagination.total}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadEnrollments(1);
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Enrollment ID, student name, email, or batch..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="all">All Enrollment Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="all">All Payment Statuses</option>
            <option value="completed">Completed / Paid</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading registrations...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No registration records match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Enrollment ID</th>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Workshop & Batch</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {item.enrollmentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">{item.studentName}</div>
                      <div className="text-[11px] text-slate-500">{item.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">{item.batchCode}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {item.workshopTitle}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.paymentStatus === 'completed' || item.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelEnrollment(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadEnrollments(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadEnrollments(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

