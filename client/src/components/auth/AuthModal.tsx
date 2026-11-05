import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        if (res.success) {
          await refreshUser();
          onClose();
        }
      } else {
        // Direct registration
        const payload: any = {
          name: name.trim(),
          email: email.trim(),
          password,
        };
        if (phoneNumber.trim()) {
          payload.phone = { countryCode: '+91', number: phoneNumber.trim() };
        }
        const res = await api.register(payload);
        if (res.success) {
          await refreshUser();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {mode === 'login' ? 'Sign In to AI Launchpad' : 'Create Learner Account'}
              </h3>
              <p className="text-xs text-slate-500">Secure HTTP-Only Cookie Session</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rajesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full text-xs py-3"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Demo: <code className="text-[#0F172A] font-semibold">admin@ailaunchpad.edu</code> / <code className="text-[#0F172A] font-semibold">AdminLaunchpad2026!</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};
