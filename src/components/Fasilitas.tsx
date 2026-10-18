import React, { useState } from 'react';
import { Sparkles, Maximize2, X, Check } from 'lucide-react';
import { FacilityItem } from '../types';

interface FasilitasProps {
  facilities: FacilityItem[];
}

export const Fasilitas: React.FC<FasilitasProps> = ({ facilities }) => {
  const [activeFacility, setActiveFacility] = useState<FacilityItem | null>(null);

  const getFeatureTags = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('kelas')) {
      return ['Ventilasi Alami', 'Sudut Literasi', 'Papan Pajang Karya'];
    }
    if (lower.includes('lapangan')) {
      return ['Area Upacara', 'Senam Bersama', 'Pohon Rindang'];
    }
    if (lower.includes('perpustakaan')) {
      return ['Buku Cerita & Pelajaran', 'Area Baca Lesehan', 'Taman Ilmu'];
    }
    return ['Bersih & Asri', 'Mendukung Pembelajaran'];
  };

  return (
    <section id="fasilitas" className="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Sarana & Prasarana
          </span>
          <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Fasilitas Sekolah
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
            Ruang belajar dan lingkungan terbuka yang dirawat dengan baik untuk menunjang tumbuh kembang siswa secara holistik.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {facilities.map((facility, idx) => {
            const tags = getFeatureTags(facility.name);
            return (
              <div
                key={idx}
                className="group bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Zoom & Click to Preview */}
                  <div
                    onClick={() => setActiveFacility(facility)}
                    className="relative aspect-[4/3] bg-emerald-950/20 overflow-hidden cursor-pointer"
                  >
                    {facility.image ? (
                      <img
                        src={facility.image}
                        alt={facility.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-300">
                        Foto Fasilitas
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Preview Button */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-800/90 text-emerald-100 backdrop-blur-md border border-emerald-500/30">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Fasilitas {idx + 1}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-disp font-bold text-xl text-[var(--ink)] mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {facility.name}
                    </h3>

                    <p className="text-sm text-[var(--mute)] leading-relaxed mb-4">
                      {facility.description}
                    </p>

                    {/* Feature tags */}
                    <div className="space-y-1.5 pt-3 border-t border-[var(--line)]">
                      {tags.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[var(--mute)]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-none" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => setActiveFacility(facility)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-[var(--f50)] hover:bg-emerald-800 hover:text-white text-emerald-900 dark:text-emerald-200 border border-[var(--line-strong)] transition-all duration-200 cursor-pointer"
                  >
                    Lihat Foto Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Facility Image Modal */}
      {activeFacility && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveFacility(null)}
        >
          <div
            className="bg-[var(--card)] rounded-3xl max-w-2xl w-full border border-[var(--line-strong)] shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveFacility(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] bg-black">
              {activeFacility.image && (
                <img
                  src={activeFacility.image}
                  alt={activeFacility.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-6">
              <h3 className="font-disp font-bold text-2xl text-[var(--ink)] mb-2">
                {activeFacility.name}
              </h3>
              <p className="text-sm text-[var(--mute)] leading-relaxed">
                {activeFacility.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
