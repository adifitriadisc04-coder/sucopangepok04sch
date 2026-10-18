import React, { useState } from 'react';
import { Target, Compass, History, Trophy, Mountain, Users, ChevronDown, ChevronUp, Play, Sparkles, Images, Film, Camera } from 'lucide-react';
import { ProfileData, PrincipalHistoryItem, HallOfFameItem } from '../types';

interface ProfilProps {
  profile: ProfileData;
  principalsHistory: PrincipalHistoryItem[];
  hallOfFame: HallOfFameItem[];
}

export const Profil: React.FC<ProfilProps> = ({
  profile,
  principalsHistory,
  hallOfFame,
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showAllPrincipals, setShowAllPrincipals] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);

  // Extract YouTube ID if any
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(profile.videoUrl);
  const isVideoActive = profile.videoEnabled !== false && (Boolean(ytId) || Boolean(profile.videoUrl));

  const displayedPrincipals = showAllPrincipals
    ? principalsHistory
    : principalsHistory.slice(0, 4);

  const textAlignClass = profile.paragraphAlignment === 'justify' ? 'text-justify' : 'text-left';

  // Split text by newlines into clean paragraphs if single string
  const introParagraphs = profile.introParagraphs && profile.introParagraphs.length > 0
    ? profile.introParagraphs
    : profile.intro ? profile.intro.split('\n\n').filter(Boolean) : [];

  const historyParagraphs = profile.historyParagraphs && profile.historyParagraphs.length > 0
    ? profile.historyParagraphs
    : profile.history ? profile.history.split('\n\n').filter(Boolean) : [];

  return (
    <section id="profil" className="py-20 bg-[var(--paper)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Mengenal Lebih Dekat
          </span>
          <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            {profile.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
            Sekolah Kaki Langit di Lereng Pegunungan Argopuro yang religius, berwawasan IPTEK, dan berbudaya lingkungan.
          </p>
        </div>

        {/* Top Grid: Location & Overview + Video/Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Left Column: Geographical Profile & Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Mountain & Altitude Highlight Card */}
            <div className="p-6 rounded-3xl bg-[var(--cream)] border border-[var(--line-strong)] shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center flex-none shadow-md">
                <Mountain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-disp font-bold text-lg text-[var(--ink)]">
                  Sekolah Kaki Langit Argopuro
                </h3>
                <p className="text-xs sm:text-sm text-[var(--mute)] leading-relaxed mt-0.5">
                  Berdiri kokoh di ketinggian <strong>800 mdpl</strong> di Dusun Lengkong, perbatasan Kec. Jelbuk, Kab. Jember dan Kab. Bondowoso (32 km dari Pusat Kota Jember).
                </p>
              </div>
            </div>

            {/* Intro Narrative (Selayang Pandang) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <h3 className="font-disp text-xl font-bold text-[var(--ink)]">
                  Selayang Pandang & Lingkungan Sekolah
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Resmi
                </span>
              </div>

              <div className={`space-y-3 text-sm sm:text-base text-[var(--mute)] leading-relaxed ${textAlignClass}`}>
                {introParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Sejarah Rintisan Sekolah */}
              <div className="pt-4 border-t border-[var(--line)] space-y-2">
                <h4 className="font-disp text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>Sejarah Singkat Rintisan</span>
                </h4>

                <div className={`space-y-3 text-sm sm:text-base text-[var(--mute)] leading-relaxed ${textAlignClass} ${!showFullHistory ? 'line-clamp-4' : ''}`}>
                  {historyParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {profile.history && profile.history.length > 250 && (
                  <button
                    onClick={() => setShowFullHistory(!showFullHistory)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>{showFullHistory ? 'Sembunyikan Sejarah' : 'Baca Sejarah Lengkap'}</span>
                    {showFullHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Foto Penunjang Lingkungan / Gedung Sekolah jika ada */}
            {profile.supportingPhotos && profile.supportingPhotos.length > 0 && (
              <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Dokumentasi Foto Penunjang Lingkungan</span>
                  </h4>
                  <span className="text-xs text-[var(--mute)]">{profile.supportingPhotos.length} Foto</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {profile.supportingPhotos.map((img, i) => (
                    <div key={i} className="aspect-[16/10] rounded-xl overflow-hidden border border-[var(--line)]">
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Visual Video or Camp Panorama */}
          <div className="lg:col-span-5 space-y-4">
            {isVideoActive ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-[var(--line-strong)] bg-stone-900 shadow-xl group">
                {ytId && playingVideo ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`}
                    title="Video profil sekolah"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/85 via-black/40 to-black/30">
                    <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply" />
                    
                    {/* Decorative Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => ytId && setPlayingVideo(true)}
                        aria-label="Putar video profil sekolah"
                        className="w-16 h-16 rounded-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
                      >
                        <Play className="w-7 h-7 ml-1 fill-white" />
                      </button>
                    </div>

                    <div className="relative z-10 text-white">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-700/80 backdrop-blur-md px-2.5 py-1 rounded-md mb-2">
                        <Film className="w-3 h-3 text-amber-300" />
                        <span>{profile.videoTitle || 'Dokumentasi Video Profil'}</span>
                      </span>
                      <h4 className="font-disp text-lg font-bold">
                        {profile.videoDescription || 'Keindahan & Semangat Belajar di Kaki Langit'}
                      </h4>
                      <p className="text-xs text-white/80 mt-1">
                        Kesejukan alam pegunungan menyatu dengan semangat belajar anak-anak Sucopangepok.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Quick Facts Card below video */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                <span className="block font-disp text-2xl font-bold text-emerald-800 dark:text-emerald-400">1989</span>
                <span className="text-xs text-[var(--mute)] font-medium">Tahun Didirikan</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                <span className="block font-disp text-2xl font-bold text-amber-600 dark:text-amber-400">3 Pilar</span>
                <span className="text-xs text-[var(--mute)] font-medium">Religius • IPTEK • Lingkungan</span>
              </div>
            </div>

            {/* Hall of Fame Highlights preview */}
            {hallOfFame && hallOfFame.length > 0 && (
              <div className="p-5 rounded-3xl bg-[var(--cream)] border border-[var(--line)] space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h4 className="font-disp font-bold text-sm">Alumni Berprestasi (Hall of Fame)</h4>
                </div>
                <div className="space-y-2 pt-1">
                  {hallOfFame.slice(0, 2).map((alumni, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-[var(--ink)]">{alumni.name}</strong>
                        <span className="text-emerald-700 font-bold">{alumni.year}</span>
                      </div>
                      <p className="text-[var(--mute)] mt-0.5">{alumni.title} - {alumni.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          
          {/* Visi Card */}
          <div className="md:col-span-5 p-7 sm:p-8 rounded-3xl bg-emerald-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 mb-5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>Visi Sekolah</span>
              </div>

              <blockquote className="font-disp text-xl sm:text-2xl font-bold text-emerald-50 leading-snug">
                "{profile.vision}"
              </blockquote>
            </div>

            <p className="mt-6 text-xs text-emerald-200/80 font-medium tracking-wide">
              Landasan utama seluruh proses pendidikan & pembinaan karakter di SDN Sucopangepok 04.
            </p>
          </div>

          {/* Misi Card */}
          <div className="md:col-span-7 p-7 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-lg flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--f50)] text-emerald-800 dark:text-emerald-300 border border-[var(--line)] mb-5">
                <Compass className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Misi Sekolah</span>
              </div>

              <div className="space-y-3.5">
                {profile.missions.map((misi, i) => (
                  <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <span className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center flex-none mt-0.5">
                      {i + 1}
                    </span>
                    <p className={`text-sm sm:text-[15px] font-medium text-[var(--ink)] leading-relaxed ${textAlignClass}`}>
                      {misi}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-[var(--mute-soft)] font-medium">
              Dirumuskan bersama seluruh dewan guru, komite sekolah, dan tokoh masyarakat Jelbuk.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
