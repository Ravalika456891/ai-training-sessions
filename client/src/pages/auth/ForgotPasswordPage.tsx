import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Could not process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      <div className="bg-[#E41937] text-white text-xs font-semibold px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span>AI Launchpad Institution • Account Recovery</span>
          <Link to="/" className="underline hover:text-blue-100">
            Back to Website
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-[#081e4a] via-[#1F386B] to-[#192e57] border-b-4 border-b-[#E41937]"
        />

        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-full bg-[#081e4a] border-2 border-[#E41937] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg uppercase tracking-tight text-white">
              AI LAUNCHPAD <span className="text-[#E41937]">INSTITUTION</span>
            </span>
          </Link>
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white">
            Reset Your Password
          </h2>
          <p className="mt-1.5 text-center text-xs text-blue-100/90">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        <div className="relative z-10 mt-7 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 border-t-4 border-t-[#E41937] border-b-[3px] border-b-[#1F386B] rounded-xl shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Instructions Generated</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-700">{message}</p>
              {resetToken && (
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Direct Test Reset Link:</span>
                  <div className="mt-1">
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="inline-block py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Click to Set New Password Now →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full mt-2"
              rightIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Generating Instructions...' : 'Send Password Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F386B] hover:text-[#E41937] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

