import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Award, RefreshCw } from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminAnalytics: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/analytics');
      setAnalytics(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading && !analytics) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B]">
        <RefreshCw className="w-5 h-5 text-[#1F386B] animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Generating cohort performance analytics...</p>
      </div>
    );
  }

  const totals = analytics?.totals || {};
  const cohorts: any[] = analytics?.workshopPerformance || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Platform Analytics & Cohort Reports</h2>
          <p className="text-xs text-slate-500">
            Enrollment velocity, workshop capacity fill rates, verified revenue trends, and graduation metrics.
          </p>
        </div>
        <BarChart3 className="w-6 h-6 text-[#1F386B]" />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Total Cohorts</span>
          <p className="text-2xl font-black text-[#0F172A] mt-1">{totals.totalCohorts || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Total Registrations</span>
          <p className="text-2xl font-black text-[#1F386B] mt-1 flex items-center gap-1.5">
            <Users className="w-5 h-5" />
            {totals.totalRegistrations || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Confirmed Seats</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5" />
            {totals.totalConfirmed || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Completion Rate</span>
          <p className="text-2xl font-black text-[#E41937] mt-1 flex items-center gap-1.5">
            <Award className="w-5 h-5" />
            {totals.completionRate || 0}%
          </p>
        </div>
      </div>

      {/* Cohort Performance Table & Visual Fill Bars */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Workshop Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-semibold">Batch Code</th>
                <th className="py-3 px-4 font-semibold">Instructor</th>
                <th className="py-3 px-4 font-semibold">Enrolled / Capacity</th>
                <th className="py-3 px-4 font-semibold">Seat Fill Rate</th>
                <th className="py-3 px-4 font-semibold">Verified Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cohorts.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-[#1F386B]">{c.batchCode}</td>
                  <td className="py-3 px-4 font-semibold text-[#0F172A]">{c.instructor}</td>
                  <td className="py-3 px-4">
                    {c.enrolled} / {c.capacity} seats
                  </td>
                  <td className="py-3 px-4 w-56">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1F386B] rounded-full"
                          style={{ width: `${c.fillRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#0F172A] w-10">{c.fillRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-black text-[#0F172A]">
                    ₹{Number(c.verifiedRevenue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

