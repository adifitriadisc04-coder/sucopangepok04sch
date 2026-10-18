import React from 'react';
import { Quote, Award, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { PrincipalData, WelcomeData } from '../types';

interface SambutanProps {
  principal: PrincipalData;
  welcome: WelcomeData;
}

export const Sambutan: React.FC<SambutanProps> = ({ principal, welcome }) => {
  // Fallback focus points if empty in data
  const focusPoints = principal.focus && principal.focus.length > 0
    ? principal.focus
    : [
        'Penguatan Karakter Religius & Budi Pekerti',
        'Pemanfaatan IPTEK & Pembelajaran Interaktif',
        'Sekolah Ramah Anak Berbudaya Lingkungan Pegunungan',
      ];

  const textAlignClass = welcome.paragraphAlignment === 'justify' ? 'text-justify' : 'text-left';

  return (
    <section id="sambutan" className="py-20 bg-[var(--cream)]/60 border-y border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Principal Profile Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-[var(--card)] p-6 sm:p-7 rounded-3xl border border-[var(--line-strong)] shadow-lg hover:shadow-xl transition-all duration-300">
              
              {/* Photo Container */}
              <div className="relative overflow-hidden aspect-square rounded-2xl bg-emerald-950/20 border border-[var(--line)] shadow-inner mb-5 group">
                {principal.photo ? (
                  <img
                    src={principal.photo}
                    alt={principal.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-4">
                    <span className="font-disp font-bold text-5xl mb-2">AH</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-300">Kepala Sekolah</span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-emerald-900/90 backdrop-blur-md text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kepala Sekolah</span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="text-center sm:text-left mb-5">
                {principal.period && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--sunsoft)] text-[var(--sunink)] border border-amber-300/40 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>Masa Jabatan: {principal.period}</span>
                  </span>
                )}

                <h3 className="font-disp text-xl sm:text-2xl font-bold text-[var(--ink)] leading-snug">
                  {principal.name}
                </h3>
                
                {principal.nip && (
                  <p className="text-xs sm:text-sm font-semibold text-[var(--mute)] mt-1 tracking-wide">
                    NIP: {principal.nip}
                  </p>
                )}
              </div>

              {/* Focus Points List */}
              <div className="pt-4 border-t border-[var(--line)]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fokus Kepemimpinan</span>
                </h4>
                <ul className="space-y-2">
                  {focusPoints.map((pt, i) => (
                    <li key={i} className="text-xs sm:text-[13px] text-[var(--mute)] flex items-start gap-2 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-none mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Right Column: Welcoming Speech */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            
            {/* Section Header Eyebrow */}
            <div className="mb-3">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                Kata Sambutan
              </span>
              <h2 className="font-disp text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--ink)] leading-tight">
                {welcome.title}
              </h2>
            </div>

            {/* Speech Card with Large Quote Icon */}
            <div className="relative mt-6 p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md">
              <Quote className="absolute -top-4 -right-2 sm:right-6 w-16 h-16 text-emerald-200 dark:text-emerald-900/60 pointer-events-none -rotate-12" />

              <div className={`space-y-4 text-base sm:text-lg text-[var(--ink)] leading-relaxed font-normal relative z-10 ${textAlignClass}`}>
                {welcome.paragraphs.map((p, idx) => (
                  <p key={idx} className={idx === 0 ? 'font-semibold text-emerald-900 dark:text-emerald-300' : ''}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Signature Area */}
              <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-disp text-xl font-bold text-emerald-900 dark:text-emerald-300">
                    {principal.name}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--mute)]">
                    Kepala SD Negeri Sucopangepok 04
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--mute-soft)] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Sucopangepok, Jelbuk - Jember
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
