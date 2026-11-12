import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CalendarClock,
  UserCheck,
  ClipboardList,
  CreditCard,
  FolderKanban,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

interface AdminContextType {
  showToast: (text: string, type?: 'success' | 'error') => void;
  adminFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AdminContext = createContext<AdminContextType>({
  showToast: () => {},
  adminFetch: async () => ({}),
});

export const useAdmin = () => useContext(AdminContext);

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Workshops', href: '/admin/workshops', icon: BookOpen },
    { label: 'Class Calendar', href: '/admin/calendar', icon: Calendar },
    { label: 'Batches & Sessions', href: '/admin/sessions', icon: CalendarClock },
    { label: 'Instructors', href: '/admin/instructors', icon: UserCheck },
    { label: 'Registrations', href: '/admin/enrollments', icon: ClipboardList },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Content & Materials', href: '/admin/content', icon: FolderKanban },
    { label: 'Certificates', href: '/admin/certificates', icon: Award },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings & Audit', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <AdminContext.Provider value={{ showToast, adminFetch }}>
      <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] flex font-sans w-full">
        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in-50 ${
                t.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-[#1F386B] border-[#E41937] text-white'
              }`}
            >
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{t.text}</span>
            </div>
          ))}
        </div>

        {/* Collapsible Desktop IIEM Deep Navy Sidebar */}
        <aside
          className={`hidden lg:flex lg:flex-col bg-[#1F386B] text-white border-r border-[#172a4f] shrink-0 transition-all duration-200 select-none ${
            isCollapsed ? 'lg:w-20' : 'lg:w-64'
          }`}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-white/15 bg-[#192e57] flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#081e4a] border-2 border-[#E41937] flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="font-black text-xs uppercase tracking-tight text-white block truncate">
                    AI LAUNCHPAD <span className="text-[#E41937]">INST.</span>
                  </span>
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                    Admin Console
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#E41937] text-white shadow-md shadow-black/20 font-bold'
                        : 'text-blue-100/85 hover:text-white hover:bg-white/10'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Links */}
          <div className="p-3 border-t border-white/15 bg-[#192e57] space-y-1.5">
            <Link
              to="/dashboard"
              title="Student Portal"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#1F386B] hover:bg-white/15 border border-white/15 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-[#E41937]" />
              {!isCollapsed && <span>Student Portal</span>}
            </Link>
            <Link
              to="/"
              title="Public Website"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-blue-200" />
              {!isCollapsed && <span>Public Website</span>}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-white hover:bg-[#E41937]/25 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* IIEM Crimson Top Utility Strip */}
          <div className="bg-[#E41937] text-white text-[11px] font-semibold px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <span className="truncate">AI Launchpad Institution • Operations Control Desk</span>
              <span className="hidden md:inline text-white/50">|</span>
              <span className="hidden md:inline text-white/95">support@ailaunchpad.edu</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1F386B] text-white font-bold text-[10px] shrink-0">
              <ShieldCheck className="w-3 h-3 text-white" />
              RBAC: {user?.role?.toUpperCase()}
            </span>
          </div>

          {/* Top Bar */}
          <header className="bg-white border-b-2 border-[#1F386B] sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-[#1F386B] hover:bg-slate-50 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1F386B]">
                  Platform <span className="text-[#E41937]">Administration</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1F386B]/10 text-[#1F386B] text-[10px] font-bold border border-[#1F386B]/20">
                  <ShieldCheck className="w-3 h-3 text-[#E41937]" />
                  RBAC: {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden md:inline-block text-xs text-slate-600 font-semibold">
                {user?.name} ({user?.email})
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1F386B] hover:text-white bg-[#F7F8FA] hover:bg-[#1F386B] border border-[#1F386B]/25 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Main Site</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#E41937] hover:bg-[#c5122d] transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* Mobile Drawer (IIEM Deep Navy) */}
          {isMobileOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex">
              <div className="w-72 max-w-[85%] bg-[#1F386B] text-white border-r border-[#172a4f] h-full flex flex-col p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#081e4a] border-2 border-[#E41937] flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-white">
                      ADMIN <span className="text-[#E41937]">CONSOLE</span>
                    </span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1 text-blue-200 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                            isActive ? 'bg-[#E41937] text-white font-bold' : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
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
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#172a4f] border border-white/15"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#E41937]" />
                    <span>Student Portal</span>
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-100 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-200" />
                    <span>Public Website</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:bg-[#E41937]/25 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Compact Mobile Bottom Navigation Bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1F386B] border-t-2 border-t-[#E41937] px-2 py-1.5 flex items-center justify-around shadow-lg">
            {[
              { label: 'Overview', href: '/admin', icon: LayoutDashboard, end: true },
              { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
              { label: 'Batches', href: '/admin/sessions', icon: CalendarClock },
              { label: 'Students', href: '/admin/students', icon: Users },
              { label: 'Payments', href: '/admin/payments', icon: CreditCard },
            ].map((item) => {
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
                  <span className="truncate max-w-[64px]">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

