import React, { useState } from 'react';
import { MapPin, ArrowRight, PhoneCall, QrCode, Sparkles, CheckCircle2, X } from 'lucide-react';
import { HeroData, SchoolInfo } from '../types';

interface HeroProps {
  hero: HeroData;
  school: SchoolInfo;
}

export const Hero: React.FC<HeroProps> = ({ hero, school }) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate QR code URL fallback if not provided in data
  const qrCodeUrl = school.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://sc04official-sch.github.io/net')}`;

  return (
    <section id="beranda" className="relative overflow-hidden pt-6 pb-16 lg:py-16">
      {/* Decorative ambient background blur orbs */}
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-[var(--f500)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-96 h-96 bg-[var(--sun)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Copy & Highlights */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* School Brand & Accreditation Pill */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[var(--sunsoft)] text-[var(--sunink)] border border-amber-300/40 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terakreditasi {school.accreditation || 'B'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--f50)] text-[var(--f700)] border border-[var(--line)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--f500)]" />
                <span>{school.status || 'SD Negeri'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--card)] text-[var(--mute)] border border-[var(--line-strong)]">
                <span>NPSN {school.npsn}</span>
              </span>
            </div>

            {/* Geographic Location Badge */}
            {school.location && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--f700)] bg-[var(--f50)] border border-[var(--line)] mb-5">
                <MapPin className="w-3.5 h-3.5 text-[var(--f600)] flex-none" />
                <span className="tracking-wide">{school.location} • Lereng Pegunungan Argopuro (800 mdpl)</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="font-disp text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[var(--ink)] leading-[1.08] tracking-tight mb-5">
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--mute)] leading-relaxed max-w-2xl font-normal mb-8">
              {hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-10">
              <button
                onClick={() => scrollTo('ppdb')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--f700)] hover:opacity-90 active:scale-95 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Daftar PPDB Baru 🎓</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollTo('profil')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--card)] hover:bg-[var(--f50)] active:bg-[var(--f100)] text-[var(--ink)] border border-[var(--line-strong)] shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Kenali Sekolah Kami</span>
              </button>

              <button
                onClick={() => scrollTo('kontak')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--card)] hover:bg-[var(--f50)] active:bg-[var(--f100)] text-[var(--ink)] border border-[var(--line-strong)] shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[var(--f600)]" />
                <span>Hubungi Kami</span>
              </button>
            </div>

            {/* Key Statistics Grid */}
            {hero.stats && hero.stats.length > 0 && (
              <div className="w-full pt-6 border-t border-[var(--line-strong)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {hero.stats.map((stat, idx) => (
                  <div
                    key={stat.id || idx}
                    className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line-strong)] shadow-2xs hover:shadow-xs transition-all duration-200"
                  >
                    <b className="block font-disp text-2xl sm:text-3xl font-bold text-[var(--f700)] leading-tight">
                      {stat.value}
                    </b>
                    <span className="text-[12px] font-semibold text-[var(--mute)] leading-snug line-clamp-1 mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Hero Art & QR Badge */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[500px]">
              
              {/* Background Glow Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--f500)]/20 to-[var(--sun)]/20 rounded-[38px] rounded-bl-[124px] blur-xl transform scale-105 pointer-events-none" />

              {/* Main Artwork Container with Signature Asymmetric Curve */}
              <div className="relative overflow-hidden aspect-[4/3.5] rounded-[34px] rounded-bl-[110px] sm:rounded-bl-[130px] border-2 border-white/60 dark:border-white/10 shadow-2xl bg-stone-900 group">
                {hero.image ? (
                  <img
                    src={hero.image}
                    alt={school.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-900/30 flex items-center justify-center text-emerald-200">
                    Foto Sekolah
                  </div>
                )}

                {/* Subtle Overlay Gradient at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Photo Badge Tag */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/90 border border-white/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--sun)] animate-pulse" />
                  <span>Kampus Alam Argopuro</span>
                </div>
              </div>

              {/* Floating QR Card Widget */}
              <button
                onClick={() => setShowQrModal(true)}
                title="Klik untuk memperbesar QR Code"
                className="absolute -top-3 -left-3 sm:-left-6 flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-[var(--card)]/95 backdrop-blur-md border border-[var(--line-strong)] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer text-left max-w-[270px]"
              >
                <div className="w-14 h-14 bg-white rounded-xl p-1 border border-stone-200 flex-none shadow-xs transition-colors">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Sekolah"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--f700)]">
                    <QrCode className="w-3 h-3" />
                    <span>Akses Cepat</span>
                  </div>
                  <p className="text-[12px] font-bold text-[var(--ink)] leading-snug line-clamp-2 mt-0.5">
                    {school.qrCaption || 'Pindai untuk membuka website'}
                  </p>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* QR Code Enlarged Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-[var(--card)] p-6 rounded-3xl max-w-sm w-full border border-[var(--line-strong)] shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--f50)] hover:bg-[var(--f100)] text-[var(--ink)] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-disp font-bold text-xl text-[var(--ink)] mb-1">
              QR Code Portal Sekolah
            </h3>
            <p className="text-xs text-[var(--mute)] mb-4">
              Pindai menggunakan kamera ponsel untuk mengakses website resmi SDN Sucopangepok 04
            </p>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 inline-block shadow-inner mb-4">
              <img
                src={qrCodeUrl}
                alt="QR Code Besar"
                className="w-52 h-52 object-contain mx-auto"
              />
            </div>

            <p className="text-xs font-semibold text-[var(--f700)]">
              https://sc04official-sch.github.io/net
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
