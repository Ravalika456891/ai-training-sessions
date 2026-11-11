import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Video,
  BookOpen,
  ClipboardCheck,
  Award,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CheckoutModal } from '../../components/checkout/CheckoutModal';

export interface DashboardContextType {
  dashboardData: any;
  payments: any[];
  progress: any[];
  isLoading: boolean;
  isEnrolling: boolean;
  refreshDashboard: () => Promise<void>;
  enrollInBatch: (workshopId: string) => Promise<void>;
  openCheckout: (enrollmentId: string) => void;
}

export const DashboardContext = React.createContext<DashboardContextType>({
  dashboardData: null,
  payments: [],
  progress: [],
  isLoading: true,
  isEnrolling: false,
  refreshDashboard: async () => {},
  enrollInBatch: async () => {},
  openCheckout: () => {},
});

export const useDashboard = () => React.useContext(DashboardContext);

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [checkoutEnrollmentId, setCheckoutEnrollmentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const enrollInBatch = async (workshopId: string) => {
    setIsEnrolling(true);
    try {
      const res = await fetch('/api/learners/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ workshopId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Could not enroll in workshop.');
      }

      await refreshDashboard();

      const enrollmentId = json.data?.enrollment?.enrollmentId;
      if (json.data?.paymentRequired && enrollmentId) {
        setCheckoutEnrollmentId(enrollmentId);
      } else {
        showToast(json.message || 'Workshop enrollment confirmed!');
      }
    } catch (err: any) {
      showToast(err.message || 'Enrollment failed.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const openCheckout = (enrollmentId: string) => {
    setCheckoutEnrollmentId(enrollmentId);
  };

  const hasConfirmedEnrollment = Boolean(
    dashboardData?.hasConfirmedEnrollment ||
      (dashboardData?.workshops || []).some((w: any) => w.isAuthorized)
  );
  const hasPendingPayment = Boolean(
    !hasConfirmedEnrollment &&
      (dashboardData?.hasPendingPayment ||
        (dashboardData?.workshops || []).some((w: any) => !w.isAuthorized))
  );
  const userState: 'registered' | 'payment_pending' | 'enrolled' | 'completed' =
    dashboardData?.userState ||
    (hasConfirmedEnrollment
      ? 'enrolled'
      : hasPendingPayment
      ? 'payment_pending'
      : 'registered');

  const userStateMeta = {
    registered: {
      label: 'Registered User',
      dotColor: 'bg-blue-600',
      badgeClass: 'bg-[#EDF3FF] text-[#1D4ED8] border-[#CFE0FF]',
    },
    payment_pending: {
      label: 'Payment Pending',
      dotColor: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    enrolled: {
      label: 'Enrolled Student',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    completed: {
      label: 'Workshop Completed',
      dotColor: 'bg-indigo-600',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  }[userState];

  // Display ALL 7 student dashboard sections for ALL signed-in users (never hide menu items before payment)
  const activeNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Workshops', href: '/dashboard/workshops', icon: GraduationCap },
    { label: 'Live Classes', href: '/dashboard/live-classes', icon: Video },
    { label: 'Learning Materials', href: '/dashboard/materials', icon: BookOpen },
    { label: 'Assignments', href: '/dashboard/assignments', icon: ClipboardCheck },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
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
        isEnrolling,
        refreshDashboard,
        enrollInBatch,
        openCheckout,
      }}
    >
      <div className="min-h-screen bg-[#F1F5FD] text-[#0F172A] flex font-sans w-full">
        {/* Desktop Collapsible Light Sidebar */}
        <aside
          className={`hidden lg:flex lg:flex-col bg-white text-[#0F172A] border-r border-slate-200/90 shrink-0 select-none transition-all duration-200 ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          }`}
        >
          {/* Brand Logo & Collapse Toggle */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#0A2558] flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-sm tracking-tight text-[#0A2558] block truncate">
                    AI Launchpad
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.14em] block mt-0.5">
                    {hasConfirmedEnrollment ? 'Student Portal' : 'Learn • Build • Deploy'}
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User Status Card */}
          {!isSidebarCollapsed && (
            <div className="p-3.5 mx-3 my-3.5 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0A2558] text-white font-black text-sm flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Learner'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${userStateMeta.dotColor}`}
                  />
                  <span className="text-[11px] font-medium text-slate-500 truncate">
                    {userStateMeta.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation Links */}
          <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0A2558] text-white shadow-sm'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F7F9FD]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}

            {/* Helpful note for Registered Users (not yet enrolled) */}
            {!hasConfirmedEnrollment && !isSidebarCollapsed && (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#EDF4FF] border border-[#CFE0FF] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A2558]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                  <span>{hasPendingPayment ? 'Payment Pending' : 'Preview Mode'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  You are browsing the student dashboard in preview mode. Complete your enrollment to unlock live classes, materials, assignments, and certificates.
                </p>
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-slate-200 space-y-1">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                title={isSidebarCollapsed ? 'Admin Console' : undefined}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  {!isSidebarCollapsed && <span>Admin Console</span>}
                </span>
              </Link>
            )}
            <Link
              to="/"
              title={isSidebarCollapsed ? 'Public Website' : undefined}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2 rounded-xl text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors`}
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                {!isSidebarCollapsed && <span>Explore Public Site</span>}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              title={isSidebarCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
              } py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                aria-label="Toggle Navigation Drawer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
                  Student Dashboard
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${userStateMeta.badgeClass}`}
                >
                  {hasConfirmedEnrollment ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span>{userStateMeta.label}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  title="Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0F172A] bg-[#F7F9FD] hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                title="My Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#0A2558] shrink-0" />
                <span className="hidden sm:inline">My Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Toast Feedback Banner */}
          {toastMessage && (
            <div className="bg-blue-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
              <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                <span>{toastMessage}</span>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-blue-100 hover:text-white ml-4 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Compact Mobile Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
              <div className="w-72 max-w-[85%] bg-white text-[#0F172A] border-r border-slate-200 h-full flex flex-col p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0A2558] flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-[#0A2558]">AI Launchpad</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="my-3 p-3 rounded-xl bg-[#F7F9FD] border border-slate-200 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0A2558] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Learner'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{userStateMeta.label}</p>
                  </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                  {activeNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#0A2558] text-white'
                              : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
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
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Admin Operations Console</span>
                    </Link>
                  )}
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#475569] hover:bg-slate-50"
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pb-20 lg:pb-8">
            <div className="w-full">
              <Outlet />
            </div>
          </main>

          {/* Compact Mobile Bottom Navigation Bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-md">
            {activeNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-500 hover:text-[#0F172A]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Global Razorpay Checkout Modal for Dashboard Enrollments */}
        {checkoutEnrollmentId && (
          <CheckoutModal
            isOpen={Boolean(checkoutEnrollmentId)}
            onClose={() => setCheckoutEnrollmentId(null)}
            enrollmentId={checkoutEnrollmentId}
            onPaymentSuccess={async () => {
              setCheckoutEnrollmentId(null);
              await refreshDashboard();
              showToast('Payment verified! Your Enrolled Student Dashboard is now unlocked.');
            }}
          />
        )}
      </div>
    </DashboardContext.Provider>
  );
};
