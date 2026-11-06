import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Menu,
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified, beginner-friendly public navigation
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
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3'
          : 'bg-white border-b border-slate-200/80 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:bg-blue-700 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] whitespace-nowrap">
                  AI Launchpad
                </span>
                <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  2-DAY BOOTCAMP
                </span>
              </div>
              <span className="text-[11px] hidden sm:block text-slate-500 font-medium -mt-0.5">
                Hands-On AI Training Platform
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
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

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border ${
                      isUserMenuOpen
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    } text-xs font-semibold text-[#0F172A] shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 group`}
                    aria-label="User Account Menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {getInitial(user.name)}
                    </div>
                    <span className="font-semibold text-xs text-[#0F172A] max-w-[110px] truncate">
                      {getDisplayName(user.name)}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${
                        isUserMenuOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="p-1.5 space-y-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleDashboardClick();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0F172A] hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>My Dashboard</span>
                        </button>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/admin');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>Admin Console</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-100 p-1.5">
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignInClick}
                  className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3.5 py-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={onRegisterClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile & Tablet Action Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {!user && (
              <button
                onClick={onRegisterClick}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Register Now
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0F172A] focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-4 border-t border-slate-200 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
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
                      className="w-full text-left px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
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
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Sign In to Account</span>
                    </button>
                    <Button
                      variant="primary"
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
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>100% Refund Guarantee</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
