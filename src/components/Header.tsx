import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, ChevronRight, Bell, Sparkles } from 'lucide-react';
import { SchoolInfo } from '../types';

interface HeaderProps {
  school: SchoolInfo;
  isDark: boolean;
  onToggleTheme: () => void;
}

const NAV_ITEMS = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'sambutan', label: 'Sambutan' },
  { id: 'profil', label: 'Profil' },
  { id: 'ppdb', label: 'PPDB Baru', isHighlight: true },
  { id: 'fasilitas', label: 'Fasilitas' },
  { id: 'guru', label: 'Guru' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'berita', label: 'Berita' },
  { id: 'sosial', label: 'Sosial' },
  { id: 'kontak', label: 'Kontak' },
];

export const Header: React.FC<HeaderProps> = ({
  school,
  isDark,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + 120;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_ITEMS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Dynamic Top Notice Bar if configured */}
      {school.headerNotice && (
        <div className="w-full bg-emerald-800 text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center border-b border-emerald-700/60 flex items-center justify-center gap-2 shadow-xs">
          <Bell className="w-3.5 h-3.5 text-amber-300 flex-none" />
          <span className="truncate max-w-4xl">{school.headerNotice}</span>
          {school.academicYear && (
            <span className="hidden md:inline-block px-2 py-0.2 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-mono">
              TA {school.academicYear} {school.semester ? `(${school.semester})` : ''}
            </span>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--paper)]/95 backdrop-blur-md shadow-md border-b border-[var(--line-strong)]'
            : 'bg-[var(--paper)]/90 backdrop-blur-sm border-b border-[var(--line)]'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3">
          {/* Brand */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('beranda');
            }}
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
          >
            {school.logo ? (
              <div className="relative flex-none">
                <img
                  src={school.logo}
                  alt={school.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--f700)] text-white flex items-center justify-center font-bold text-lg">
                SC
              </div>
            )}

            {school.secondaryLogo && (
              <img
                src={school.secondaryLogo}
                alt="Logo Pendukung"
                className="hidden sm:block w-9 h-9 object-contain opacity-85"
              />
            )}

            <div className="min-w-0">
              <h1 className="font-disp font-bold text-[15px] sm:text-[17px] leading-tight text-[var(--ink)] tracking-tight truncate group-hover:text-[var(--f600)] transition-colors">
                {school.name}
              </h1>
              <p className="text-[11px] sm:text-[12px] text-[var(--mute)] font-medium truncate flex items-center gap-1.5">
                <span>{school.location || 'Kabupaten Jember'}</span>
                <span className="opacity-40">•</span>
                <span className="font-semibold text-[var(--f600)]">NPSN {school.npsn}</span>
                {school.headerTagline && (
                  <>
                    <span className="opacity-40 hidden lg:inline">•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold hidden lg:inline">
                      {school.headerTagline}
                    </span>
                  </>
                )}
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-[var(--card)]/60 dark:bg-[var(--card)]/40 p-1.5 rounded-full border border-[var(--line)] shadow-xs">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--f700)] text-white shadow-xs scale-100'
                      : item.isHighlight
                      ? 'bg-[var(--sunsoft)] text-[var(--sunink)] font-bold hover:opacity-90'
                      : 'text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-none">
            {/* Optional Header CTA Button */}
            {school.showCtaButton !== false && (
              <button
                onClick={() => scrollTo(school.ctaButtonLink || 'ppdb')}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{school.ctaButtonText || 'Daftar PPDB Online'}</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Ganti tema terang/gelap"
              title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line-strong)] text-[var(--ink)] shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--f700)]" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[var(--card)] border border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--f50)] transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[var(--paper)] border-b border-[var(--line-strong)] px-4 py-4 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-[var(--f700)] text-white shadow-xs'
                        : item.isHighlight
                        ? 'bg-[var(--sunsoft)] text-[var(--sunink)] font-bold border border-amber-300'
                        : 'bg-[var(--card)] text-[var(--mute)] hover:text-[var(--ink)] border border-[var(--line)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
