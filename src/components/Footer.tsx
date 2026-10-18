import React from 'react';
import { ArrowUp, Sparkles, Heart, Lock } from 'lucide-react';
import { SchoolInfo } from '../types';

interface FooterProps {
  school: SchoolInfo;
  onOpenAdmin: () => void;
}

const NAV_LINKS = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'sambutan', label: 'Sambutan Kepala Sekolah' },
  { id: 'profil', label: 'Profil & Visi Misi' },
  { id: 'ppdb', label: 'PPDB Siswa Baru' },
  { id: 'fasilitas', label: 'Fasilitas Unggulan' },
  { id: 'guru', label: 'Pendidik & Tendik' },
  { id: 'galeri', label: 'Galeri & Prestasi' },
  { id: 'agenda', label: 'Kalender & Agenda' },
  { id: 'berita', label: 'Berita & Pengumuman' },
  { id: 'sosial', label: 'Media Sosial' },
  { id: 'kontak', label: 'Kontak & Lokasi' },
];

export const Footer: React.FC<FooterProps> = ({ school, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-emerald-950 text-white pt-16 pb-8 border-t-4 border-emerald-700 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
          
          {/* Brand & Identity Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {school.logo ? (
                <img
                  src={school.logo}
                  alt={school.name}
                  className="w-12 h-12 object-contain bg-white/10 p-1 rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-xl text-amber-300">
                  SC
                </div>
              )}
              <div>
                <h3 className="font-disp font-bold text-xl text-white tracking-tight">
                  {school.name}
                </h3>
                <p className="text-xs text-emerald-300 font-semibold tracking-wide">
                  NPSN: {school.npsn} • Terakreditasi {school.accreditation || 'B'}
                </p>
              </div>
            </div>

            <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md">
              {school.footerAbout || 'Sekolah Kaki Langit Religius, Berwawasan IPTEK dan Peduli lingkungan.'}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dusun Lengkong, Desa Sucopangepok, Kec. Jelbuk, Kab. Jember (800 mdpl)</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="font-disp font-bold text-base text-white uppercase tracking-wider mb-4 pb-2 border-b border-emerald-800/80">
              Navigasi Cepat
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-xs sm:text-sm text-emerald-200/80 hover:text-white hover:translate-x-1 transition-all cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Administration */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-disp font-bold text-base text-white uppercase tracking-wider mb-4 pb-2 border-b border-emerald-800/80">
              Kontak Sekolah
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              <p>
                <strong className="text-white block text-xs uppercase font-bold tracking-wider">Alamat:</strong>
                {school.address}
              </p>
              {school.phone && (
                <p>
                  <strong className="text-white block text-xs uppercase font-bold tracking-wider">Telepon:</strong>
                  {school.phone}
                </p>
              )}
              {school.email && (
                <p>
                  <strong className="text-white block text-xs uppercase font-bold tracking-wider">Email:</strong>
                  <a href={`mailto:${school.email}`} className="text-emerald-300 hover:underline">
                    {school.email}
                  </a>
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar with Discreet Admin Access at the Corner */}
        <div className="pt-8 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <p>
            &copy; {new Date().getFullYear()} {school.name}. Seluruh Hak Cipta Dilindungi.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 opacity-70">
              <span>Dibuat untuk pendidikan</span>
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            </span>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Kembali ke atas"
              title="Kembali ke atas"
              className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Discreet Admin Login at bottom corner - samar dari pembajakan */}
            <button
              onClick={onOpenAdmin}
              aria-label="Akses Pengelola"
              title="Akses Pengelola Sekolah"
              className="opacity-25 hover:opacity-100 transition-opacity duration-200 p-1.5 rounded text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span className="text-[10px] tracking-widest uppercase">Admin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
