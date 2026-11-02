import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, User, LogOut, Award, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onRegisterClick: () => void;
  onOpenAuthModal?: () => void;
  onOpenLearnerDashboard?: () => void;
  onOpenAdminConsole?: () => void;
  onOpenVerifyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  onOpenAuthModal,
  onOpenLearnerDashboard,
  onOpenAdminConsole,
  onOpenVerifyModal,
}) => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Outcomes', href: '#outcomes' },
    { label: 'Curriculum', href: '#curriculum' },
    { label: 'AI Tools', href: '#tools' },
    { label: 'Mentors', href: '#mentors' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050814]/90 backdrop-blur-xl border-b border-slate-800/90 shadow-xl shadow-black/40 py-3'
          : 'bg-[#050814]/70 backdrop-blur-lg border-b border-slate-800/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                AI Launchpad
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
                  Bootcamp
                </span>
              </span>
              <span className="text-[11px] block text-slate-400 font-medium -mt-0.5">
                2-Day Hands-On Masterclass
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
                className="text-xs xl:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2 xl:gap-3">
            {/* Verify Certificate */}
            <button
              onClick={onOpenVerifyModal}
              className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-500 bg-navy-900/50 flex items-center gap-1.5 transition-all"
              title="Verify credential by serial number"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Cert</span>
            </button>

            {/* Authenticated User Menu or Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button
                    onClick={onOpenAdminConsole}
                    className="text-xs font-semibold text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Ops</span>
                  </button>
                )}

                <button
                  onClick={onOpenLearnerDashboard}
                  className="text-xs font-semibold text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-slate-200 hover:border-slate-500 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-navy-900 border border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenLearnerDashboard) onOpenLearnerDashboard();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-brand-cyan" />
                        My Dashboard
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (onOpenAdminConsole) onOpenAdminConsole();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:text-white hover:bg-amber-500/10 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          Admin Console
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Sign In
              </button>
            )}

            <Button
              variant="gradient"
              size="sm"
              onClick={onRegisterClick}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Register Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={onRegisterClick}
              className="text-xs px-3 py-1.5"
            >
              Register
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-800/80 bg-navy-950/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenVerifyModal) onOpenVerifyModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-navy-900 border border-slate-800 text-xs font-semibold text-amber-300 flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  Verify Certificate
                </button>

                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenLearnerDashboard) onOpenLearnerDashboard();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs font-semibold text-cyan-300 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      Learner Dashboard ({user.name.split(' ')[0]})
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenAdminConsole) onOpenAdminConsole();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs font-semibold text-amber-300 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Admin Operations Console
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs font-semibold text-rose-300 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-navy-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-brand-violet" />
                    Sign In to Account
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 mt-2 flex flex-col gap-2">
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
                  Register for Upcoming Batch
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Money-Back Guarantee
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

