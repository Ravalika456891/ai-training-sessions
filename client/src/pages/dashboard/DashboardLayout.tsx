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
      dotColor: 'bg-[#E41937]',
      badgeClass: 'bg-[#1F386B]/10 text-[#1F386B] border-[#1F386B]/25',
    },
    payment_pending: {
      label: 'Payment Pending',
      dotColor: 'bg-amber-400',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    enrolled: {
      label: 'Enrolled Student',
      dotColor: 'bg-emerald-400',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    completed: {
      label: 'Workshop Completed',
      dotColor: 'bg-[#E41937]',
      badgeClass: 'bg-[#E41937]/10 text-[#E41937] border-[#E41937]/25',
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
      <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] flex font-sans w-full">
        {/* Desktop Collapsible IIEM Deep Navy Sidebar */}
        <aside
          className={`hidden lg:flex lg:flex-col bg-[#1F386B] text-white border-r border-[#172a4f] shrink-0 select-none transition-all duration-200 ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          }`}
        >
          {/* Brand Logo & Collapse Toggle */}
          <div className="p-4 border-b border-white/15 flex items-center justify-between gap-2 bg-[#192e57]">
            <Link to="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#081e4a] border-2 border-[#E41937] flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-black text-xs uppercase tracking-tight text-white block truncate">
                    AI LAUNCHPAD <span className="text-[#E41937]">INST.</span>
                  </span>
                  <span className="text-[9px] text-blue-200 font-bold uppercase tracking-[0.14em] block mt-0.5">
                    {hasConfirmedEnrollment ? 'Student Portal' : 'Learn • Build • Deploy'}
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
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
            <div className="p-3.5 mx-3 my-3.5 rounded-xl bg-[#172a4f] border border-white/15 border-l-[3px] border-l-[#E41937] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E41937] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Learner'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${userStateMeta.dotColor}`}
                  />
                  <span className="text-[11px] font-medium text-blue-200 truncate">
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
                    } py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#E41937] text-white shadow-md shadow-black/20 font-bold'
                        : 'text-blue-100/85 hover:text-white hover:bg-white/10'
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
              <div className="mt-4 p-3.5 rounded-xl bg-[#172a4f] border border-white/15 border-l-[3px] border-l-[#E41937] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#E41937] shrink-0" />
                  <span>{hasPendingPayment ? 'Payment Pending' : 'Preview Mode'}</span>
                </div>
                <p className="text-[11px] text-blue-100/85 leading-relaxed">
                  You are browsing the student dashboard in preview mode. Complete your enrollment to unlock live classes, materials, assignments, and certificates.
                </p>
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-white/15 bg-[#192e57] space-y-1.5">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                title={isSidebarCollapsed ? 'Admin Console' : undefined}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-lg text-xs font-bold text-white bg-[#E41937] hover:bg-[#c5122d] transition-colors shadow-xs`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  {!isSidebarCollapsed && <span>Admin Console</span>}
                </span>
              </Link>
            )}
            <Link
              to="/"
              title={isSidebarCollapsed ? 'Public Website' : undefined}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2 rounded-lg text-xs font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-colors`}
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
                {!isSidebarCollapsed && <span>Explore Public Site</span>}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              title={isSidebarCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
              } py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-white hover:bg-[#E41937]/25 transition-colors cursor-pointer`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* IIEM Crimson Top Utility Strip */}
          <div className="bg-[#E41937] text-white text-[11px] font-semibold px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <span className="truncate">AI Launchpad Institution • Student Cohort Portal</span>
              <span className="hidden md:inline text-white/50">|</span>
              <span className="hidden md:inline text-white/95">support@ailaunchpad.edu</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#1F386B] text-white font-bold text-[10px] shrink-0">
              {userStateMeta.label}
            </span>
          </div>

          {/* Top Header Bar */}
          <header className="bg-white border-b-2 border-[#1F386B] sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-[#1F386B] hover:bg-slate-50 cursor-pointer"
                aria-label="Toggle Navigation Drawer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1F386B]">
                  Student <span className="text-[#E41937]">Dashboard</span>
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${userStateMeta.badgeClass}`}
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
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1F386B] hover:bg-[#192e57] transition-colors"
                  title="Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1F386B] bg-[#F7F8FA] hover:bg-slate-100 border border-[#1F386B]/20 transition-colors"
                title="My Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#1F386B] shrink-0" />
                <span className="hidden sm:inline">My Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-white bg-[#E41937] hover:bg-[#c5122d] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Toast Feedback Banner */}
          {toastMessage && (
            <div className="bg-[#1F386B] border-b-2 border-[#E41937] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
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

          {/* Compact Mobile Drawer (IIEM Deep Navy) */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex">
              <div className="w-72 max-w-[85%] bg-[#1F386B] text-white border-r border-[#172a4f] h-full flex flex-col p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#081e4a] border-2 border-[#E41937] flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-white">
                      AI LAUNCHPAD <span className="text-[#E41937]">INST.</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-blue-200 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="my-3 p-3 rounded-xl bg-[#172a4f] border border-white/15 border-l-[3px] border-l-[#E41937] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E41937] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Learner'}</p>
                    <p className="text-[10px] text-blue-200 truncate">{userStateMeta.label}</p>
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
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#E41937] text-white shadow-sm font-bold'
                              : 'text-blue-100/85 hover:text-white hover:bg-white/10'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="pt-3 border-t border-white/15 space-y-1.5">
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#E41937] hover:bg-[#c5122d]"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Admin Operations Console</span>
                    </Link>
                  )}
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-blue-100 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-200" />
                    <span>Public Website</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:bg-[#E41937]/25"
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
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1F386B] border-t-2 border-t-[#E41937] px-2 py-1.5 flex items-center justify-around shadow-lg">
            {activeNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      isActive ? 'bg-[#E41937] text-white' : 'text-blue-100/80 hover:text-white'
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
