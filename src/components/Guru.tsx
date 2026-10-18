import React from 'react';
import { UserCheck, GraduationCap, Award } from 'lucide-react';
import { TeacherItem } from '../types';

interface GuruProps {
  teachers: TeacherItem[];
}

export const Guru: React.FC<GuruProps> = ({ teachers }) => {
  // Generate clean initials for avatar fallback
  const getInitials = (name: string) => {
    const clean = name.replace(/^(Drs\.|Dra\.|H\.|Hj\.)\s*/, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] || 'SC').slice(0, 2).toUpperCase();
  };

  return (
    <section id="guru" className="py-20 bg-[var(--paper)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Pendidik & Tendik
          </span>
          <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Guru & Tenaga Kependidikan
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
            Para pendidik dan staf berdedikasi tinggi yang membimbing anak-anak dengan kasih sayang, kedisiplinan, dan keteladanan.
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {teachers.map((teacher, idx) => {
            const isHeadmaster = teacher.role.toLowerCase().includes('kepala');
            const initials = getInitials(teacher.name);

            return (
              <div
                key={idx}
                className={`group p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                  isHeadmaster
                    ? 'bg-gradient-to-br from-emerald-50/80 via-[var(--card)] to-[var(--card)] dark:from-emerald-950/40 dark:via-[var(--card)] dark:to-[var(--card)] border-emerald-400/60 dark:border-emerald-700/60 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-[var(--card)] border-[var(--line-strong)] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    {/* Avatar Container */}
                    <div className="relative flex-none">
                      {teacher.photo ? (
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          loading="lazy"
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover object-top border-2 border-emerald-600/30 shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-disp font-bold text-xl shadow-md border border-emerald-700/40 group-hover:scale-105 transition-transform duration-300">
                          {initials}
                        </div>
                      )}

                      {isHeadmaster && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-white shadow-xs">
                          <Award className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Teacher Basic Details */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isHeadmaster
                            ? 'bg-emerald-800 text-white'
                            : 'bg-[var(--f50)] text-emerald-800 dark:text-emerald-300 border border-[var(--line)]'
                        }`}>
                          {isHeadmaster ? 'Pimpinan & Guru' : 'Tenaga Pendidik'}
                        </span>
                      </div>
                      
                      <h3 className="font-disp font-bold text-base sm:text-lg text-[var(--ink)] leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {teacher.name.trim()}
                      </h3>
                    </div>
                  </div>

                  {/* Role Assignment */}
                  <div className="p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] mb-4">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-none mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mute-soft)] block">
                          Tugas & Amanah
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-[var(--ink)] leading-snug mt-0.5">
                          {teacher.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NIP Footer */}
                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[var(--mute-soft)] font-medium">NIP</span>
                  <span className="font-mono font-semibold text-[var(--ink)] bg-[var(--f50)] px-2 py-0.5 rounded-md border border-[var(--line)]">
                    {teacher.nip || 'Belum Tercatat'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-[var(--cream)] border border-[var(--line-strong)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center flex-none">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-disp font-bold text-sm sm:text-base text-[var(--ink)]">
                Komitmen Pengabdian Pendidikan
              </h4>
              <p className="text-xs sm:text-sm text-[var(--mute)]">
                Seluruh guru secara berkala mengikuti pembinaan keprofesian berkelanjutan dan program Guru Penggerak.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
