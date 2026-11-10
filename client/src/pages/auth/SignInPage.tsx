import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const SignInPage: React.FC = () => {
  const { user, login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const redirect = searchParams.get('redirect') || (isAdminRoute ? '/admin' : '/dashboard');

  const [email, setEmail] = useState(isAdminRoute ? 'admin@ailaunchpad.edu' : '');
  const [password, setPassword] = useState(isAdminRoute ? 'AdminLaunchpad2026!' : '');
  const [isInputUnlocked, setIsInputUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated with appropriate access, redirect immediately
  useEffect(() => {
    if (user) {
      if (redirect.startsWith('/admin') && user.role !== 'admin') {
        // Allow learner to sign in with an Admin account instead of bouncing back
        return;
      }
      const target = !searchParams.get('redirect') && user.role === 'admin' ? '/admin' : redirect;
      navigate(target, { replace: true });
    }
  }, [user, navigate, redirect, searchParams]);

  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login('admin@ailaunchpad.edu', 'AdminLaunchpad2026!');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Admin sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., you@gmail.com).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(trimmedEmail, password);
      const isUserAdmin = loggedInUser?.role === 'admin';
      const target = isUserAdmin
        ? redirect.startsWith('/admin')
          ? redirect
          : '/admin'
        : redirect.startsWith('/admin')
        ? '/dashboard'
        : redirect;
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (selectedEmail?: string, selectedPassword?: string) => {
    const targetEmail = (selectedEmail ?? googleEmail).trim();
    const targetPassword = selectedPassword ?? googlePassword;
    if (!targetEmail || !targetPassword) {
      setError('Please enter both your Google Email and Password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setError('Please enter a valid email address (e.g., you@gmail.com).');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await googleLogin({
        email: targetEmail,
        name: targetEmail.split('@')[0],
        password: targetPassword,
        mode: 'login',
      });
      const isUserAdmin = loggedInUser?.role === 'admin';
      const target = isUserAdmin
        ? redirect.startsWith('/admin')
          ? redirect
          : '/admin'
        : redirect.startsWith('/admin')
        ? '/dashboard'
        : redirect;
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen body-3d flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">AI Launchpad</span>
        </Link>
        <h2 className="text-center text-2xl font-black text-[#0F172A] tracking-tight">
          Welcome back to AI Launchpad
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600 font-medium">
          Sign in to access your workshops, live classes, assignments, and certificates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 border border-slate-200/90 rounded-3xl shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {showGoogleChooser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-500">Enter your Google account to continue</p>
                </div>
              </div>

              <form
                noValidate
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
                  <input
                    type="text"
                    inputMode="email"
                    name="google_login_email"
                    autoComplete="off"
                    readOnly={!isInputUnlocked}
                    onFocus={() => setIsInputUnlocked(true)}
                    onMouseDown={() => setIsInputUnlocked(true)}
                    onTouchStart={() => setIsInputUnlocked(true)}
                    onKeyDown={() => setIsInputUnlocked(true)}
                    required
                    value={googleEmail}
                    onChange={(e) => {
                      if (isInputUnlocked) setGoogleEmail(e.target.value);
                    }}
                    placeholder="you@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showGooglePassword || !isInputUnlocked ? 'text' : 'password'}
                      style={!showGooglePassword ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                      name="google_login_password"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      required
                      value={googlePassword}
                      onChange={(e) => {
                        if (isInputUnlocked) setGooglePassword(e.target.value);
                      }}
                      placeholder="Enter your password"
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGooglePassword(!showGooglePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showGooglePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGoogleChooser(false)}
                    className="w-1/3"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isLoading}
                    className="w-2/3"
                  >
                    {isLoading ? 'Signing in...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="email"
                      name="learner_signin_email"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      required
                      value={email}
                      onChange={(e) => {
                        if (isInputUnlocked) setEmail(e.target.value);
                      }}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword || !isInputUnlocked ? 'text' : 'password'}
                      style={!showPassword ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                      name="learner_signin_password"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      required
                      value={password}
                      onChange={(e) => {
                        if (isInputUnlocked) setPassword(e.target.value);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
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
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                  <span className="bg-white px-3 text-slate-400">Or</span>
                </div>
              </div>

              {/* Sign in with Google positioned directly above Create Account */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  const trimmedEmail = email.trim();
                  if (trimmedEmail && trimmedEmail !== 'admin@ailaunchpad.edu') {
                    setGoogleEmail(trimmedEmail);
                    if (password && password !== 'AdminLaunchpad2026!') {
                      setGooglePassword(password);
                      handleGoogleSignIn(trimmedEmail, password);
                      return;
                    }
                  }
                  setShowGoogleChooser(true);
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-[#0F172A] shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
              {/* Quick Admin Portal Sign-In */}
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={isLoading}
                className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Sign In as Administrator (Admin Console)</span>
              </button>
            </>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to={redirect !== '/dashboard' ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'}
              className="font-bold text-blue-600 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
