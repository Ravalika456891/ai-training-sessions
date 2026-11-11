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
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onRegisterClick: () => void;
  onOpenAuthModal?: () => void;
  onOpenLearnerDashboard?: () => void;
  onOpenAdminConsole?: () => void;
}

/** IIEM institutional main navigation bar with Menuzord-style active pill links. */
export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  onOpenAuthModal,
  onOpenLearnerDashboard,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('#home');
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
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Outcomes', href: '#outcomes' },
    { label: 'Curriculum', href: '#curriculum' },
    { label: 'Mentors', href: '#mentors' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
    setActiveHash(href);
    if (href === '#home') {
      e.preventDefault();
      if (window.location.pathname !== '/') {
        navigate('/');
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (href.startsWith('/')) return;

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
      className={`sticky top-0 z-40 transition-all duration-200 bg-white border-b border-slate-200 ${
        isScrolled ? 'shadow-md shadow-[#1F386B]/10 py-2.5' : 'py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Institutional Brand Lockup */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                setActiveHash('#home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#1F386B] border-2 border-[#E41937] flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight uppercase text-[#1F386B] whitespace-nowrap">
                  AI LAUNCHPAD
                </span>
                <span className="font-black text-base sm:text-lg tracking-tight uppercase text-[#E41937] hidden sm:inline">
                  INSTITUTION
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden sm:block -mt-0.5">
                2-Day Practical AI Training • Cohort Portal
              </span>
            </div>
          </a>

          {/* Desktop Menuzord Pill Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeHash === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-[13px] font-bold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1F386B] text-white shadow-sm'
                      : 'text-[#333333] hover:bg-[#1F386B] hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop User Menu / Enroll CTA */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1F386B]/25 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#1F386B] transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#1F386B] shrink-0" />
                    <span>Admin Ops</span>
                  </button>
                )}

                <HeadlessMenu as="div" className="relative">
                  <MenuButton className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#1F386B]/40 text-xs font-bold text-[#222222] shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0 group outline-none">
                    <div className="w-6 h-6 rounded-full bg-[#1F386B] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {getInitial(user.name)}
                    </div>
                    <span className="max-w-[100px] truncate">{getDisplayName(user.name)}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-data-[open]:rotate-180 group-data-[open]:text-[#1F386B] transition-transform" />
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
                    <MenuItems className="absolute right-0 mt-2 w-60 origin-top-right rounded-lg bg-white border border-slate-200 shadow-2xl p-1.5 z-50 outline-none">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50 rounded-md mb-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-bold text-[#222222] truncate">{user.name}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1F386B] text-white shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <MenuItem>
                        {({ focus }) => (
                          <button
                            onClick={handleDashboardClick}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                              focus ? 'bg-blue-50 text-[#1F386B]' : 'text-[#222222]'
                            }`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#1F386B] shrink-0" />
                            <span>My Student Dashboard</span>
                          </button>
                        )}
                      </MenuItem>

                      {user.role === 'admin' && (
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              onClick={() => navigate('/admin')}
                              className={`w-full text-left px-3 py-2 text-xs font-bold rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                                focus ? 'bg-blue-50 text-[#1F386B]' : 'text-[#1F386B]'
                              }`}
                            >
                              <ShieldAlert className="w-4 h-4 text-[#1F386B] shrink-0" />
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
                              className={`w-full text-left px-3 py-2 text-xs font-bold rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                                focus ? 'bg-rose-50 text-[#E41937]' : 'text-[#E41937]'
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
              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E41937] hover:bg-[#c5142f] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile & Tablet Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {!user ? (
              <button
                type="button"
                onClick={onRegisterClick}
                className="px-3 py-1.5 rounded-full bg-[#E41937] hover:bg-[#c5142f] text-white text-xs font-bold uppercase tracking-wide cursor-pointer"
              >
                Enroll
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDashboardClick}
                className="px-3 py-1.5 rounded-full bg-[#1F386B] text-white text-xs font-bold cursor-pointer"
              >
                Dashboard
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded bg-slate-100 border border-slate-200 text-[#1F386B] hover:bg-[#1F386B] hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Animated Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <div className="mt-3 pt-3 pb-4 border border-slate-200 bg-white rounded-lg p-4 shadow-xl space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`block text-sm font-bold px-3.5 py-2.5 rounded transition-colors ${
                      activeHash === link.href
                        ? 'bg-[#1F386B] text-white'
                        : 'text-[#222222] hover:bg-slate-100 hover:text-[#1F386B]'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}

                <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleDashboardClick();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded bg-blue-50 border border-[#1F386B]/20 text-xs font-bold text-[#1F386B] flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>My Dashboard ({getDisplayName(user.name)})</span>
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded bg-slate-100 border border-slate-200 text-xs font-bold text-[#1F386B] flex items-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Console</span>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded bg-rose-50 border border-rose-200 text-xs font-bold text-[#E41937] flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
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
                        className="w-full text-left px-3.5 py-2.5 rounded bg-slate-50 border border-slate-200 text-xs font-bold text-[#1F386B] flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Student Sign In</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onRegisterClick();
                        }}
                        className="w-full py-2.5 px-4 rounded bg-[#E41937] hover:bg-[#c5142f] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span>Register for Batch</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1F386B]" />
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
