import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as HeadlessMenu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Menu as MenuIcon,
  X,
  ArrowRight,
  ShieldCheck,
  User,
  LogOut,
  ShieldAlert,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onRegisterClick: () => void;
  onOpenAuthModal?: () => void;
  onOpenLearnerDashboard?: () => void;
  onOpenAdminConsole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  onOpenAuthModal,
  onOpenLearnerDashboard,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDisplayName = (name?: string) => {
    if (!name) return 'Learner';
    const clean = name.trim();
    if (clean.toLowerCase() === 'google learner') return 'Learner';
    if (clean.toLowerCase().startsWith('google ')) {
      const rest = clean.replace(/^google\s+/i, '');
      return rest || 'Learner';
    }
    return clean.split(' ')[0];
  };

  const getInitial = (name?: string) => {
    const display = getDisplayName(name);
    return display.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Outcomes', href: '#outcomes' },
    { label: 'Curriculum', href: '#curriculum' },
    { label: 'Instructor', href: '#mentors' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/')) {
      return;
    }
    e.preventDefault();
    if (window.location.pathname !== '/') {
      window.location.href = `/${href}`;
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${href}`;
    }
  };

  const handleDashboardClick = () => {
    if (onOpenLearnerDashboard) {
      onOpenLearnerDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignInClick = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      navigate('/signin');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-md shadow-blue-950/5 py-2.5'
          : 'bg-white/85 backdrop-blur-md border-b border-slate-200/70 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#081e4a] flex items-center justify-center text-white shadow-sm shadow-[#081e4a]/20 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] whitespace-nowrap">
                  AI Launchpad
                </span>
                <span className="hidden xs:inline-block text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#081e4a] border border-[#081e4a]/20 shrink-0">
                  2-DAY BOOTCAMP
                </span>
              </div>
              <span className="text-[11px] hidden sm:block text-slate-500 font-medium -mt-0.5">
                Hands-On AI Training Platform
              </span>
            </div>
          </a>

          {/* Desktop Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl p-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-semibold text-slate-600 hover:text-[#081e4a] px-3.5 py-1.5 rounded-xl hover:bg-white hover:shadow-2xs transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Controls (Headless UI Dropdown Menu for Authenticated User) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5 shrink-0">
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Admin Ops</span>
                  </button>
                )}

                <HeadlessMenu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#081e4a]/40 data-[open]:border-[#081e4a] data-[open]:ring-4 data-[open]:ring-[#081e4a]/15 text-xs font-semibold text-[#0F172A] shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0 group outline-none">
                    <div className="w-6 h-6 rounded-lg bg-[#081e4a] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {getInitial(user.name)}
                    </div>
                    <span className="font-semibold text-xs text-[#0F172A] max-w-[110px] truncate">
                      {getDisplayName(user.name)}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-data-[open]:rotate-180 group-data-[open]:text-[#081e4a] transition-transform" />
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="transform opacity-0 scale-95 -translate-y-1"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 -translate-y-1"
                  >
                    <MenuItems className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 p-1.5 z-50 outline-none">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-xl mb-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-[#081e4a] border border-[#081e4a]/20 shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <MenuItem>
                        {({ focus }) => (
                          <button
                            onClick={handleDashboardClick}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                              focus ? 'bg-blue-50 text-[#081e4a]' : 'text-[#0F172A]'
                            }`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#081e4a] shrink-0" />
                            <span>My Dashboard</span>
                          </button>
                        )}
                      </MenuItem>

                      {user.role === 'admin' && (
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              onClick={() => navigate('/admin')}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                                focus ? 'bg-indigo-50 text-indigo-800' : 'text-indigo-700'
                              }`}
                            >
                              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>Admin Console</span>
                            </button>
                          )}
                        </MenuItem>
                      )}

                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              onClick={async () => {
                                await logout();
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                                focus ? 'bg-rose-50 text-rose-700' : 'text-rose-600'
                              }`}
                            >
                              <LogOut className="w-4 h-4 shrink-0" />
                              <span>Sign Out</span>
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Transition>
                </HeadlessMenu>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleSignInClick} leftIcon={<User className="w-3.5 h-3.5 text-[#081e4a]" />}>
                  Sign In
                </Button>
                <Button variant="gradient" size="sm" onClick={onRegisterClick} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Register Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile & Tablet Action Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {!user && (
              <Button variant="gradient" size="sm" onClick={onRegisterClick} className="px-3 py-1.5">
                Register Now
              </Button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-700 hover:text-[#081e4a] focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Animated Mobile & Tablet Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <div className="mt-3 pt-3 pb-4 border border-slate-200/90 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl space-y-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="block text-sm font-semibold text-slate-700 hover:text-[#081e4a] px-3.5 py-2.5 rounded-xl hover:bg-blue-50/70 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                <div className="pt-3 mt-1 border-t border-slate-200 flex flex-col gap-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleDashboardClick();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl bg-blue-50 border border-[#081e4a]/20 text-xs font-semibold text-[#081e4a] flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#081e4a]" />
                        <span>My Dashboard ({getDisplayName(user.name)})</span>
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-600" />
                          <span>Admin Operations Console</span>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignInClick();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#081e4a]" />
                        <span>Sign In to Account</span>
                      </button>
                      <Button
                        variant="gradient"
                        size="md"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onRegisterClick();
                        }}
                        className="w-full"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Register Now
                      </Button>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#081e4a]" />
                        <span>100% Refund Guarantee</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
