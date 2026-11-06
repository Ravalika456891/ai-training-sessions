import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminSettings: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [setRes, logRes] = await Promise.all([
        adminFetch('/api/admin/settings'),
        adminFetch('/api/admin/audit-logs'),
      ]);
      setSettings(setRes.data);
      setAuditLogs(logRes.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      setSettings(res.data);
      showToast('Platform settings saved and recorded in audit log');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading platform settings & audit trail...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0F172A]">Platform Settings & Security Audit</h2>
            <p className="text-xs text-slate-500">
              Configure branding, registration limits, workshop defaults, instructor permissions, and inspect audit logs.
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Branding & Registration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Website Branding & Admissions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Site Name</label>
                <input
                  type="text"
                  value={settings.branding?.siteName || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, siteName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.branding?.supportEmail || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Default Max Seats per Batch
                </label>
                <input
                  type="number"
                  value={settings.registration?.maxSeatsPerBatch ?? 60}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      registration: {
                        ...settings.registration,
                        maxSeatsPerBatch: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Default Workshop Price (INR)
                </label>
                <input
                  type="number"
                  value={settings.workshopDefaults?.defaultBasePrice ?? 1999}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workshopDefaults: {
                        ...settings.workshopDefaults,
                        defaultBasePrice: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Instructor Permissions & Notifications */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Instructor Permissions & Notifications
            </h3>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-semibold text-[#0F172A]">
                  Allow Instructors to Mark Day 1 & Day 2 Attendance
                </span>
                <input
                  type="checkbox"
                  checked={settings.instructorPermissions?.canMarkAttendance ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructorPermissions: {
                        ...settings.instructorPermissions,
                        canMarkAttendance: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-semibold text-[#0F172A]">
                  Allow Instructors to Upload Learning Materials
                </span>
                <input
                  type="checkbox"
                  checked={settings.instructorPermissions?.canUploadMaterials ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructorPermissions: {
                        ...settings.instructorPermissions,
                        canUploadMaterials: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-semibold text-[#0F172A]">
                  Send Automated Email on Certificate Issuance
                </span>
                <input
                  type="checkbox"
                  checked={settings.notifications?.notifyStudentOnCertificateIssue ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notifyStudentOnCertificateIssue: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-blue-600"
                />
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Immutable Security Audit Logs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Administrative Security Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400">{auditLogs.length} events recorded</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No administrative mutations recorded yet in this session.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Actor</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Entity</th>
                  <th className="py-2.5 px-3 font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{log.actorEmail}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{log.action}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{log.summary}</td>
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
