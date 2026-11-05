import React, { useState } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';

export const DashboardProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

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
      setProfileSuccess('Profile updated successfully.');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Profile & Security Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal details, AI background level, and account password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Details</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role || 'student'}
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
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
              <span className="text-[10px] text-slate-400 mt-1 block">
                Email address is linked to your verified credentials.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="working_professional">Working Professional</option>
                  <option value="founder">Founder / Builder</option>
                  <option value="creator">Creator / Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Exposure</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isUpdatingProfile}
              className="w-full mt-2"
              rightIcon={isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </Button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Change Password</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Bcrypt Encrypted</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password (Min. 8 characters)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="md"
              disabled={isUpdatingPassword}
              className="w-full mt-2"
              rightIcon={isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
