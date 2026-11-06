import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  IndianRupee,
  Award,
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminOverview: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/dashboard');
      setData(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin overview', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-600">Loading live database metrics...</p>
      </div>
    );
  }

  const d = data || {};
  const kpis = [
    {
      label: 'Total Registered Students',
      value: d.totalRegisteredStudents ?? 0,
      sub: `${d.activeStudents ?? 0} Active Accounts`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Total Workshops',
      value: d.totalWorkshops ?? 0,
      sub: `${d.upcomingWorkshops ?? 0} Published Upcoming`,
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Confirmed Enrollments',
      value: d.confirmedEnrollments ?? 0,
      sub: `${d.pendingEnrollments ?? 0} Pending Confirmation`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Verified Revenue',
      value: `₹${Number(d.verifiedRevenue || 0).toLocaleString('en-IN')}`,
      sub: 'Captured Razorpay & Verified Seats',
      icon: IndianRupee,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Attendance Rate',
      value: `${d.attendancePercentage ?? 0}%`,
      sub: `Seat Fill Rate: ${d.capacityFillRate ?? 0}%`,
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Issued Certificates',
      value: d.totalCertificates ?? 0,
      sub: 'Cryptographically Signed',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  const enrollmentTrend: any[] = d.enrollmentTrend || [];
  const revenueTrend: any[] = d.revenueTrend || [];
  const recentRegistrations: any[] = d.recentRegistrations || [];
  const upcomingSessions: any[] = d.upcomingSessions || [];
  const pendingActions: any[] = d.pendingActions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Executive Operations Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time metrics aggregated directly from MongoDB Atlas collections.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0F172A] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 6 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="text-2xl font-black text-[#0F172A] mt-1">{item.value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment & Revenue Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Enrollment Trend by Cohort Batch</h3>
              <p className="text-[11px] text-slate-500">Confirmed seats vs. total batch capacity</p>
            </div>
            <Link to="/admin/workshops" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Batches
            </Link>
          </div>
          <div className="space-y-3 pt-2">
            {enrollmentTrend.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No workshop batches found.</p>
            ) : (
              enrollmentTrend.map((item, i) => {
                const pct = Math.min(
                  100,
                  Math.round(((item.enrollments || 0) / (item.capacity || 60)) * 100)
                );
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F172A]">{item.label}</span>
                      <span className="text-slate-500 font-medium">
                        {item.enrollments} / {item.capacity} seats ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Revenue Trend & Pending Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Pending Administrative Actions</h3>
              <p className="text-[11px] text-slate-500">Operational tasks requiring attention</p>
            </div>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-2.5">
            {pendingActions.map((act: any) => (
              <Link
                key={act.id}
                to={act.link || '/admin'}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${
                      act.priority === 'high' ? 'text-amber-600' : 'text-blue-600'
                    }`}
                  />
                  <span className="text-xs font-semibold text-[#0F172A] truncate">{act.title}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Verified Revenue Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {revenueTrend.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 truncate">{r.label}</p>
                  <p className="text-sm font-black text-[#0F172A] mt-0.5">
                    ₹{Number(r.revenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Recent Student Registrations</h3>
            <Link to="/admin/enrollments" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No student registrations recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-2 font-semibold">ID</th>
                    <th className="py-2.5 px-2 font-semibold">Student</th>
                    <th className="py-2.5 px-2 font-semibold">Batch</th>
                    <th className="py-2.5 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRegistrations.map((reg, idx) => (
                    <tr key={reg._id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-mono font-bold text-blue-600">
                        {reg.enrollmentId}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-[#0F172A]">{reg.studentName}</div>
                        <div className="text-[11px] text-slate-500">{reg.email}</div>
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-slate-700">{reg.batchCode}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : reg.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Upcoming Scheduled Cohorts</h3>
            <Link to="/admin/sessions" className="text-xs font-bold text-blue-600 hover:underline">
              Schedule
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((ses, idx) => (
              <div
                key={ses._id || idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {ses.batchCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {ses.availableSeats} / {ses.capacity} seats left
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0F172A]">{ses.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {ses.startDate ? new Date(ses.startDate).toLocaleDateString() : 'Upcoming'}
                  </span>
                  <span>Lead: {ses.instructorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
