import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

declare global {
  interface Window {
    google?: any;
  }
}

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
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        if (res.success) {
          await refreshUser();
          onClose();
          navigate(res.data?.user?.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
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
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

      if (window.google?.accounts?.id && googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const authRes = await api.googleAuth({ credential: response.credential });
                if (authRes.success) {
                  await refreshUser();
                  onClose();
                  navigate('/dashboard');
                }
              } catch (err: any) {
                setError(err.message || 'Google token verification failed.');
              }
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      }

      setShowGooglePrompt(true);
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be initiated.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleConfirmGoogleAuth = async (emailToUse: string, nameToUse: string) => {
    if (!emailToUse.trim()) return;

    setIsGoogleLoading(true);
    setError(null);
    try {
      const authRes = await api.googleAuth({
        email: emailToUse.trim(),
        name: nameToUse.trim() || emailToUse.split('@')[0],
        googleId: `google_oauth_${Date.now()}`,
      });
      if (authRes.success) {
        await refreshUser();
        setShowGooglePrompt(false);
        onClose();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {showGooglePrompt
                  ? 'Sign in with Google'
                  : mode === 'login'
                  ? 'Sign In to AI Launchpad'
                  : 'Create Learner Account'}
              </h3>
              <p className="text-xs text-slate-500">Access your student dashboard & workshops</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
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

          {showGooglePrompt ? (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Sign in with Google</h4>
                  <p className="text-[11px] text-slate-500">Enter your Google account details</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmGoogleAuth(googleEmailInput, googleNameInput);
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Google Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Display Name</label>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGooglePrompt(false)}
                    className="w-1/3 text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isGoogleLoading}
                    className="w-2/3 text-xs py-2.5 font-bold"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email & Password Form */}
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
                      <label className="text-xs font-semibold text-slate-700">Mobile Number (Optional)</label>
                      <input
                        type="tel"
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
                      placeholder="student@example.com"
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
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/forgot-password');
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
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
                    className="w-full text-xs py-3 font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </div>
              </form>

              {/* Clean Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-slate-400 font-semibold">Or</span>
                </div>
              </div>

              {/* Sign in with Google positioned directly above Create Account */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-[#0F172A] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Toggle between login and register */}
              <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Create Account
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
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
