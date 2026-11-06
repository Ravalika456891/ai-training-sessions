import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from './DashboardLayout';
import { api } from '../../services/api';

export const DashboardProfile: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { payments, dashboardData, openCheckout } = useDashboard();
  const navigate = useNavigate();

  const workshops = dashboardData?.workshops || [];

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone?.number || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'beginner');
  const [userCategory, setUserCategory] = useState(user?.userCategory || 'working_professional');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await api.updateProfile({
        name: name.trim(),
        phone: { countryCode: '+91', number: phoneNumber.trim() },
        experienceLevel,
        userCategory,
      });
      await refreshUser();
      setProfileSuccess('Profile information updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Profile & Account Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal information, payment history, security settings, and session.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout of Account</span>
        </button>
      </div>

      {/* 1. Personal Information & Account Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal Information</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role || 'learner'}
            </span>
          </div>

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Category</label>
                <select
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="working_professional">Working Professional</option>
                  <option value="founder">Founder / Builder</option>
                  <option value="creator">Creator / Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isUpdatingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isUpdatingProfile ? 'Saving...' : 'Save Personal Information'}</span>
            </button>
          </form>
        </div>

        {/* Account Settings (Password Change) Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Account Security Settings</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Bcrypt Protected</span>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password (Min. 8 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {isUpdatingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Payment History Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-[#0F172A]">Payment History</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {payments.length} Transaction(s)
          </span>
        </div>

        {payments.length === 0 && workshops.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No payment transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pr-4">Cohort / Order</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 pl-4 text-right">Date / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: any, i: number) => (
                  <tr key={p._id || i}>
                    <td className="py-3 pr-4">
                      <div className="font-bold text-[#0F172A]">
                        {p.workshopId?.title || 'AI Launchpad Bootcamp'}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        Order: {p.providerOrderId || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0F172A]">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          p.status === 'captured'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right text-slate-500">
                      {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {/* Also show any pending enrollments that haven't created a payment order yet */}
                {payments.length === 0 &&
                  workshops.map((w: any) => (
                    <tr key={w.enrollmentId}>
                      <td className="py-3 pr-4">
                        <div className="font-bold text-[#0F172A]">{w.workshop?.title}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          Enrollment: {w.enrollmentId}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        ₹{(w.workshop?.price?.basePrice || 1999).toLocaleString('en-IN')} + GST
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            w.isAuthorized
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {w.isAuthorized ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {!w.isAuthorized ? (
                          <button
                            onClick={() => openCheckout(w.enrollmentId)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-slate-500">Verified</span>
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
