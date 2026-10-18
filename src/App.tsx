import React, { useState, useEffect } from 'react';
import { getStoredData, saveStoredData, resetStoredData } from './data/initialData';
import { SiteData, GuestbookEntry, PPDBItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Sambutan } from './components/Sambutan';
import { Profil } from './components/Profil';
import { PPDBSection } from './components/PPDBSection';
import { Fasilitas } from './components/Fasilitas';
import { Guru } from './components/Guru';
import { Galeri } from './components/Galeri';
import { Agenda } from './components/Agenda';
import { Berita } from './components/Berita';
import { Sosial } from './components/Sosial';
import { Kontak } from './components/Kontak';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [data, setData] = useState<SiteData>(() => getStoredData());
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('sc04_theme');
    if (savedTheme) return savedTheme === 'dark';
    return data.theme.defaultTheme === 'dark';
  });
  const [adminOpen, setAdminOpen] = useState(false);

  // Sync theme and color palette with document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('sc04_theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('sc04_theme', 'light');
    }

    // Set 5-Palette color theme
    const palette = data.appearance?.colorPalette || 'emerald';
    root.setAttribute('data-palette', palette);
  }, [isDark, data.appearance?.colorPalette]);

  // Apply custom font family from appearance settings
  useEffect(() => {
    const font = data.appearance?.fontFamily || 'Plus Jakarta Sans';
    document.body.style.fontFamily = `"${font}", system-ui, sans-serif`;
  }, [data.appearance?.fontFamily]);

  // Handle URL hash changes (#admin) and keyboard shortcut (Ctrl + Shift + A)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSaveData = (newData: SiteData) => {
    setData(newData);
    saveStoredData(newData);
  };

  const handleResetData = () => {
    const reset = resetStoredData();
    setData(reset);
  };

  const handleAddGuestbook = (entry: GuestbookEntry) => {
    const updated = {
      ...data,
      guestbook: [entry, ...(data.guestbook || [])],
    };
    setData(updated);
    saveStoredData(updated);
  };

  const handleRegisterPPDB = (newStudent: PPDBItem) => {
    const existing = data.ppdb?.registrants || [];
    const updated: SiteData = {
      ...data,
      ppdb: {
        config: data.ppdb?.config || ({} as any),
        registrants: [newStudent, ...existing],
      },
    };
    setData(updated);
    saveStoredData(updated);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col selection:bg-emerald-700 selection:text-white transition-colors duration-300">
      {/* Google AdSense Header Banner if enabled */}
      {data.adsense?.enabled && data.adsense.clientId && (
        <div className="w-full bg-[var(--paper)] py-2 text-center text-xs text-[var(--mute)] border-b border-[var(--line)]">
          <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Iklan Penayang Resmi</span>
          <div className="max-w-4xl mx-auto h-16 bg-[var(--card)] border border-dashed border-[var(--line)] flex items-center justify-center rounded-xl my-1 text-xs text-[var(--mute-soft)]">
            Slot Iklan Google AdSense ({data.adsense.clientId})
          </div>
        </div>
      )}

      {/* 1. Header (Clean, visitor-facing without prominent admin buttons) */}
      <Header
        school={data.school}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Sections */}
      <main className="flex-1">
        {/* 2. Hero Section (#beranda) - Fully Dynamic Stats and Text */}
        <Hero hero={data.hero} school={data.school} />

        {/* 3. Sambutan Kepala Sekolah (#sambutan) */}
        <Sambutan principal={data.principal} welcome={data.welcome} />

        {/* 4. Profil Sekolah, Selayang Pandang & Sejarah (#profil) */}
        <Profil
          profile={data.profile}
          principalsHistory={data.principalsHistory}
          hallOfFame={data.hallOfFame}
        />

        {/* 5. PPDB Online dengan Upload/Scan KK & Sinkronisasi Drive (#ppdb) */}
        {data.ppdb?.config?.enabled && (
          <PPDBSection
            config={data.ppdb.config}
            registrants={data.ppdb.registrants || []}
            onRegister={handleRegisterPPDB}
            schoolPhone={data.school.phone}
          />
        )}

        {/* 6. Fasilitas Sekolah (#fasilitas) */}
        <Fasilitas facilities={data.facilities} />

        {/* 7. Guru & Tendik (#guru) */}
        <Guru teachers={data.teachers} />

        {/* 8. Galeri & Prestasi (#galeri) */}
        <Galeri gallery={data.gallery} achievements={data.achievements} />

        {/* 9. Agenda & Kalender (#agenda) */}
        <Agenda events={data.events} />

        {/* 10. Berita & Pengumuman (#berita) */}
        <Berita news={data.news} />

        {/* 11. Media Sosial (#sosial) */}
        <Sosial social={data.social} />

        {/* 12. Kontak & Buku Tamu (#kontak) */}
        <Kontak
          school={data.school}
          whatsapp={data.whatsapp}
          guestbook={data.guestbook || []}
          onAddGuestbook={handleAddGuestbook}
        />
      </main>

      {/* 13. Footer dengan Tombol Admin Samar di Pojok Bawah */}
      <Footer school={data.school} onOpenAdmin={() => setAdminOpen(true)} />

      {/* 14. Floating WhatsApp Action */}
      <FloatingWhatsApp whatsapp={data.whatsapp} school={data.school} />

      {/* 15. Full Management Admin Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => {
          setAdminOpen(false);
          if (window.location.hash === '#admin') {
            history.replaceState(null, '', ' ');
          }
        }}
        data={data}
        onSave={handleSaveData}
        onReset={handleResetData}
      />
    </div>
  );
}
