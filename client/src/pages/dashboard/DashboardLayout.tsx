import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Video,
  Download,
  Upload,
  TrendingUp,
  Award,
  CreditCard,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface DashboardContextType {
  dashboardData: any;
  payments: any[];
  progress: any[];
  isLoading: boolean;
  refreshDashboard: () => Promise<void>;
}

export const DashboardContext = React.createContext<DashboardContextType>({
  dashboardData: null,
  payments: [],
  progress: [],
  isLoading: true,
  refreshDashboard: async () => {},
});

export const useDashboard = () => React.useContext(DashboardContext);

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, payRes, progRes] = await Promise.allSettled([
        fetch('/api/learners/dashboard', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        }).then((r) => r.json()),
        fetch('/api/learners/payments', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        }).then((r) => r.json()),
        fetch('/api/learners/progress', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        }).then((r) => r.json()),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboardData(dashRes.value.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value.success) {
        setPayments(payRes.value.data);
      }
      if (progRes.status === 'fulfilled' && progRes.value.success) {
        setProgress(progRes.value.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Workshops', href: '/dashboard/workshops', icon: GraduationCap },
    { label: 'Live Classes', href: '/dashboard/live-classes', icon: Video },
    { label: 'Learning Materials', href: '/dashboard/materials', icon: Download },
    { label: 'Assignments', href: '/dashboard/assignments', icon: Upload },
    { label: 'Learning Progress', href: '/dashboard/progress', icon: TrendingUp },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'Payment History', href: '/dashboard/payments', icon: CreditCard },
    { label: 'Profile Settings', href: '/dashboard/profile', icon: User },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        payments,
        progress,
        isLoading,
        refreshDashboard,
      }}
    >
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans">
        {/* Desktop Sidebar (Fixed Left) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 shrink-0 select-none">
          {/* Brand Logo */}
          <div className="p-5 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-none">
                  AI Launchpad
                </span>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mt-1">
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          {/* User Badge Info */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Student'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {user?.role || 'learner'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-slate-200 space-y-1">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Public Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                aria-label="Toggle Navigation Drawer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
                  Student Dashboard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Verified Session
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Main Site</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* Mobile Drawer (When Open) */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex">
              <div className="w-72 max-w-[85%] bg-white h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-[#0F172A]">AI Launchpad</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Student'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Public Website</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
          )}

          {/* Sub-view Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};
