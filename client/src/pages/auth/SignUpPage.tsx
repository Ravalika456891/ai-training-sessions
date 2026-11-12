import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const SignUpPage: React.FC = () => {
  const { user, registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isInputUnlocked, setIsInputUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phone && /[^\d]/.test(phone)) {
      setPhone(phone.replace(/\D/g, '').slice(0, 15));
    }
  }, [phone]);

  useEffect(() => {
    if (user) {
      const target =
        user.role === 'admin'
          ? redirect.startsWith('/admin')
            ? redirect
            : '/admin'
          : redirect.startsWith('/admin')
          ? '/dashboard'
          : redirect;
      navigate(target, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registeredUser = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone ? { countryCode: '+91', number: phone.trim() } : undefined,
      });
      const isUserAdmin = registeredUser?.role === 'admin';
      const target = isUserAdmin
        ? redirect.startsWith('/admin')
          ? redirect
          : '/admin'
        : redirect.startsWith('/admin')
        ? '/dashboard'
        : redirect;
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async (selectedEmail?: string, selectedPassword?: string) => {
    const targetEmail = (selectedEmail ?? googleEmail).trim();
    const targetPassword = selectedPassword ?? googlePassword;
    if (!targetEmail || !targetPassword) {
      setError('Please enter both your Google Email and Password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await googleLogin({
        email: targetEmail,
        name: name.trim() || targetEmail.split('@')[0],
        password: targetPassword,
        mode: 'register',
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
      setError(err.message || 'Google account creation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      <div className="bg-[#E41937] text-white text-xs font-semibold px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span>AI Launchpad Institution • Student Registration</span>
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
            <div>
              <span className="font-black text-lg uppercase tracking-tight text-white block">
                AI LAUNCHPAD <span className="text-[#E41937]">INSTITUTION</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                Student Account Creation
              </span>
            </div>
          </Link>
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white">
            Create Your Student Account
          </h2>
          <p className="mt-1.5 text-center text-xs text-blue-100/90">
            Get lifetime access to the curriculum, code repositories, prompt kits, and community.
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
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGoogleSignUp();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showGooglePassword ? 'text' : 'password'}
                      required
                      value={googlePassword}
                      onChange={(e) => setGooglePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B]"
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
              <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="signup_full_name"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      required
                      value={name}
                      onChange={(e) => {
                        if (isInputUnlocked) setName(e.target.value);
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="signup_mobile_number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        if (isInputUnlocked) setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      }}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="email"
                      name="signup_email_address"
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
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword || !isInputUnlocked ? 'text' : 'password'}
                      style={!showPassword ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                      name="signup_new_password"
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
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword || !isInputUnlocked ? 'text' : 'password'}
                      style={!showPassword ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                      name="signup_confirm_password"
                      autoComplete="off"
                      readOnly={!isInputUnlocked}
                      onFocus={() => setIsInputUnlocked(true)}
                      onMouseDown={() => setIsInputUnlocked(true)}
                      onTouchStart={() => setIsInputUnlocked(true)}
                      onKeyDown={() => setIsInputUnlocked(true)}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        if (isInputUnlocked) setConfirmPassword(e.target.value);
                      }}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:border-[#1F386B] transition-colors bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1F386B] focus:ring-[#1F386B] cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-500 leading-tight">
                      I agree to the AI Launchpad Terms of Service, Privacy Policy, and Student Code of Conduct.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="w-full mt-2"
                  rightIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {isLoading ? 'Creating Account...' : 'Create Student Account'}
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

              <button
                type="button"
                onClick={() => {
                  const trimmedEmail = email.trim();
                  if (trimmedEmail && password) {
                    handleGoogleSignUp(trimmedEmail, password);
                  } else {
                    if (trimmedEmail && !googleEmail) {
                      setGoogleEmail(trimmedEmail);
                    }
                    setShowGoogleChooser(true);
                  }
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
            </>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to={redirect !== '/dashboard' ? `/signin?redirect=${encodeURIComponent(redirect)}` : '/signin'}
              className="font-bold text-[#E41937] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
