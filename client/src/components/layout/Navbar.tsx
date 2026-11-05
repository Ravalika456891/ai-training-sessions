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
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:bg-blue-700 transition-colors">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A]">
                  AI Launchpad
                </span>
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  BOOTCAMP
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] block text-[#475569] font-medium -mt-0.5">
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
                className="text-xs xl:text-sm font-medium text-[#475569] hover:text-[#0F172A] px-2.5 xl:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Verify Certificate Button (Clean single-line rounded-xl matching design) */}
            <button
              onClick={onOpenVerifyModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-600 text-xs font-semibold text-[#0F172A] hover:text-blue-600 transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              title="Verify Official Certificate"
            >
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">Verify Cert</span>
            </button>

            {/* Authenticated User Menu or Sign In */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button
                    onClick={onOpenAdminConsole}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin Ops</span>
                  </button>
                )}

                <button
                  onClick={onOpenLearnerDashboard}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dashboard</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-[#0F172A] hover:border-slate-300 transition-colors shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-[#0F172A] truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenLearnerDashboard) onOpenLearnerDashboard();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                        My Dashboard
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (onOpenAdminConsole) onOpenAdminConsole();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                          Admin Console
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
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
                className="text-xs font-medium text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                Sign In
              </button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={onRegisterClick}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Register Now
            </Button>
          </div>

          {/* Mobile Action Controls: Verify Cert + Register + Menu */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Mobile Verify Cert Button */}
            <button
              onClick={onOpenVerifyModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-600 text-xs font-semibold text-[#0F172A] hover:text-blue-600 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Verify Official Certificate"
            >
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">Verify Cert</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={onRegisterClick}
              className="text-xs px-2.5 sm:px-3 py-1.5 font-bold shrink-0"
            >
              Register
            </Button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer shrink-0"
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
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-200 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenVerifyModal) onOpenVerifyModal();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-[#0F172A] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Verify Certificate</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">
                    Verify &rarr;
                  </span>
                </button>

                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenLearnerDashboard) onOpenLearnerDashboard();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Learner Dashboard ({user.name.split(' ')[0]})
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenAdminConsole) onOpenAdminConsole();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                        Admin Operations Console
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-[#475569] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-slate-500" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    Sign In to Account
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 mt-2 flex flex-col gap-2">
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
                  Register for Upcoming Batch
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
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
