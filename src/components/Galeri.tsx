import React, { useState } from 'react';
import {
  Images, Trophy, Calendar, ChevronLeft, ChevronRight, X, Sparkles, Award, Tag,
  Users, User, CheckCircle2, Eye, Filter
} from 'lucide-react';
import { GalleryAlbum, AchievementItem } from '../types';

interface GaleriProps {
  gallery: GalleryAlbum[];
  achievements: AchievementItem[];
}

export const Galeri: React.FC<GaleriProps> = ({ gallery, achievements }) => {
  const [activeTab, setActiveTab] = useState<'galeri' | 'prestasi'>('galeri');
  const [galleryCategory, setGalleryCategory] = useState<string>('Semua');
  const [achievementCategory, setAchievementCategory] = useState<string>('Semua');

  // Lightbox State for Albums
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [currentAlbumPhotoIdx, setCurrentAlbumPhotoIdx] = useState(0);

  // Lightbox State for Achievements
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [currentAchPhotoIdx, setCurrentAchPhotoIdx] = useState(0);

  // Filtered Gallery
  const filteredGallery = gallery.filter((item) => {
    if (galleryCategory === 'Semua') return true;
    if (galleryCategory === 'Kegiatan Intra') {
      return (
        item.category === 'Kegiatan Intra' ||
        item.category === 'Pramuka' ||
        item.category === 'Upacara' ||
        item.title.toLowerCase().includes('pramuka') ||
        item.title.toLowerCase().includes('upacara') ||
        item.title.toLowerCase().includes('ekstrakurikuler') ||
        item.title.toLowerCase().includes('kemah') ||
        item.title.toLowerCase().includes('senam')
      );
    }
    return item.category === galleryCategory;
  });

  // Filtered Achievements
  const filteredAchievements = achievements.filter((item) => {
    if (achievementCategory === 'Semua') return true;
    if (achievementCategory === 'Intra Sekolah') {
      return (
        item.category === 'Intra Sekolah' ||
        item.category === 'Pramuka' ||
        item.category === 'Olahraga' ||
        item.title.toLowerCase().includes('atletik') ||
        item.title.toLowerCase().includes('pramuka') ||
        item.title.toLowerCase().includes('seni') ||
        item.title.toLowerCase().includes('kejuaraan')
      );
    }
    return item.category === achievementCategory;
  });

  const openAlbum = (album: GalleryAlbum) => {
    setSelectedAlbum(album);
    setCurrentAlbumPhotoIdx(0);
  };

  const closeAlbumLightbox = () => {
    setSelectedAlbum(null);
  };

  const openAchievementModal = (ach: AchievementItem) => {
    setSelectedAchievement(ach);
    setCurrentAchPhotoIdx(0);
  };

  const closeAchievementModal = () => {
    setSelectedAchievement(null);
  };

  return (
    <section id="galeri" className="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              Dokumentasi & Prestasi
            </span>
            <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
              Galeri Kegiatan & Prestasi Siswa
            </h2>
            <p className="mt-2 text-base text-[var(--mute)] max-w-2xl">
              Dokumentasi visual kegiatan intra sekolah, kepramukaan, pembelajaran luar kelas, peringatan hari besar, serta deretan piala kejuaraan siswa SD Negeri Sucopangepok 04.
            </p>
          </div>

          {/* Main Tabs (Galeri vs Prestasi) */}
          <div className="inline-flex p-1.5 rounded-full bg-[var(--card)] border border-[var(--line-strong)] shadow-xs flex-none">
            <button
              onClick={() => setActiveTab('galeri')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'galeri'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Galeri Kegiatan ({gallery.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('prestasi')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'prestasi'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Prestasi Sekolah ({achievements.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Galeri Foto Kegiatan Intra Sekolah & Acara */}
        {activeTab === 'galeri' && (
          <div className="space-y-7">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
              <span className="flex items-center gap-1 text-[var(--mute)] mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Kategori:</span>
              </span>
              {[
                'Semua',
                'Kegiatan Intra',
                'Pramuka',
                'Upacara',
                'Pembelajaran',
                'Outing Class',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    galleryCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[var(--card)] text-[var(--mute)] border border-[var(--line)] hover:text-[var(--ink)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredGallery.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-dashed border-[var(--line)] text-[var(--mute)]">
                Tidak ada album kegiatan pada kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredGallery.map((album, idx) => {
                  const coverImage = album.photos && album.photos.length > 0 ? album.photos[0] : '';
                  const totalPhotos = album.photos ? album.photos.length : 0;
                  const catLabel = album.category || 'Kegiatan Intra';

                  return (
                    <div
                      key={album.id || idx}
                      onClick={() => openAlbum(album)}
                      className="group bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Album Cover */}
                        <div className="relative aspect-[4/3] bg-emerald-950/20 overflow-hidden">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={album.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-200">
                              Album Foto
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                          {/* Photos Count Badge */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                            <Images className="w-3.5 h-3.5 text-amber-300" />
                            <span>{totalPhotos} Foto</span>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-emerald-200 text-[11px] font-bold border border-emerald-500/30">
                            {catLabel}
                          </div>

                          {/* Date tag */}
                          {album.date && (
                            <div className="absolute bottom-3 left-3 text-white/90 text-xs font-medium flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-300" />
                              <span>{album.date}</span>
                            </div>
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="p-6">
                          <h3 className="font-disp font-bold text-lg sm:text-xl text-[var(--ink)] leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {album.title}
                          </h3>
                          {album.description && (
                            <p className="text-xs text-[var(--mute)] mt-2 line-clamp-2 leading-relaxed">
                              {album.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer with Multi-photo Preview Thumbnails */}
                      <div className="px-6 pb-6 pt-1">
                        {album.photos.length > 1 && (
                          <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
                            {album.photos.slice(1, 5).map((ph, pIdx) => (
                              <div key={pIdx} className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--line)] flex-none">
                                <img src={ph} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {album.photos.length > 5 && (
                              <div className="w-10 h-10 rounded-lg bg-[var(--f50)] border border-[var(--line)] flex items-center justify-center text-[10px] font-bold text-[var(--mute)] flex-none">
                                +{album.photos.length - 5}
                              </div>
                            )}
                          </div>
                        )}

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                          <span>Buka Album & Keterangan Foto</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prestasi Siswa & Intra Sekolah */}
        {activeTab === 'prestasi' && (
          <div className="space-y-7">
            {/* Category Filter Pills for Achievements */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
              <span className="flex items-center gap-1 text-[var(--mute)] mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Kategori:</span>
              </span>
              {[
                'Semua',
                'Intra Sekolah',
                'Olahraga',
                'Akademik',
                'Seni & Budaya',
                'Pramuka',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAchievementCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    achievementCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-[var(--card)] text-[var(--mute)] border border-[var(--line)] hover:text-[var(--ink)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredAchievements.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-dashed border-[var(--line)] text-[var(--mute)]">
                Belum ada data prestasi pada kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((item, idx) => {
                  const photosList = item.photos && item.photos.length > 0
                    ? item.photos
                    : item.photo ? [item.photo] : [];
                  const mainPhoto = photosList[0] || '';

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => openAchievementModal(item)}
                      className="group p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-amber-300/40 dark:border-amber-700/40 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Main Photo with Multiple-photos Indicator */}
                        {mainPhoto ? (
                          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-[var(--line)] bg-stone-900">
                            <img
                              src={mainPhoto}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {photosList.length > 1 && (
                              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1 border border-white/20">
                                <Images className="w-3 h-3 text-amber-300" />
                                <span>{photosList.length} Foto</span>
                              </div>
                            )}
                          </div>
                        ) : null}

                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none border border-amber-500/20 shadow-xs">
                            <Award className="w-6 h-6" />
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--sunsoft)] text-[var(--sunink)]">
                              Tahun {item.year}
                            </span>
                            {item.level && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {item.level}
                              </span>
                            )}
                            {item.category && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-disp font-bold text-lg sm:text-xl text-[var(--ink)] mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>

                        {/* Recipient / Student Name if available */}
                        {item.recipient && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                            <User className="w-3.5 h-3.5" />
                            <span>Peraih: {item.recipient}</span>
                          </div>
                        )}

                        {item.description && (
                          <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-400 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--mute-soft)]">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Prestasi Resmi Sekolah</span>
                        </div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <span>Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 1. Lightbox Modal for Gallery Albums (Multi-Photo + Captions) */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeAlbumLightbox}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-stone-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 text-white bg-black/40">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-800 text-white">
                    {selectedAlbum.category || 'Dokumentasi Intra'}
                  </span>
                  <span className="text-xs text-white/60">
                    {selectedAlbum.date}
                  </span>
                </div>
                <h3 className="font-disp font-bold text-lg sm:text-xl text-white">
                  {selectedAlbum.title}
                </h3>
                <p className="text-xs text-white/60">
                  Foto {currentAlbumPhotoIdx + 1} dari {selectedAlbum.photos.length}
                </p>
              </div>

              <button
                onClick={closeAlbumLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Viewer */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] max-h-[60vh] overflow-hidden">
              {selectedAlbum.photos.length > 0 && (
                <img
                  src={selectedAlbum.photos[currentAlbumPhotoIdx]}
                  alt={`${selectedAlbum.title} ${currentAlbumPhotoIdx + 1}`}
                  className="max-w-full max-h-[58vh] object-contain rounded-xl select-none"
                />
              )}

              {/* Prev and Next Arrows */}
              {selectedAlbum.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentAlbumPhotoIdx((prev) =>
                        (prev - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentAlbumPhotoIdx((prev) => (prev + 1) % selectedAlbum.photos.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Photo Caption / Description & Thumbnails */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 text-white space-y-3">
              {selectedAlbum.captions && selectedAlbum.captions[currentAlbumPhotoIdx] ? (
                <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                  {selectedAlbum.captions[currentAlbumPhotoIdx]}
                </p>
              ) : selectedAlbum.description ? (
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {selectedAlbum.description}
                </p>
              ) : null}

              {/* Thumbnail Strip */}
              {selectedAlbum.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {selectedAlbum.photos.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAlbumPhotoIdx(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 flex-none transition-all cursor-pointer ${
                        idx === currentAlbumPhotoIdx
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={ph} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal for Achievement Details (Multi-Photo + Student + Coach Info) */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeAchievementModal}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-[var(--card)] text-[var(--ink)] rounded-3xl overflow-hidden border border-[var(--line-strong)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-disp font-bold text-base sm:text-lg">
                    Detail Prestasi & Kegiatan Intra
                  </h3>
                  <span className="text-xs text-[var(--mute)]">
                    Tingkat {selectedAchievement.level} • Tahun {selectedAchievement.year}
                  </span>
                </div>
              </div>

              <button
                onClick={closeAchievementModal}
                className="w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {(() => {
                const photos = selectedAchievement.photos && selectedAchievement.photos.length > 0
                  ? selectedAchievement.photos
                  : selectedAchievement.photo ? [selectedAchievement.photo] : [];

                return (
                  photos.length > 0 && (
                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--line)] bg-stone-900">
                        <img
                          src={photos[currentAchPhotoIdx] || photos[0]}
                          alt={selectedAchievement.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {photos.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {photos.map((ph, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentAchPhotoIdx(idx)}
                              className={`w-16 h-12 rounded-xl overflow-hidden border-2 flex-none transition-all cursor-pointer ${
                                idx === currentAchPhotoIdx
                                  ? 'border-emerald-700 scale-105 shadow-md'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={ph} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                );
              })()}

              <div>
                <h4 className="font-disp font-bold text-xl sm:text-2xl text-[var(--ink)] mb-2">
                  {selectedAchievement.title}
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--sunsoft)] text-[var(--sunink)]">
                    Tahun {selectedAchievement.year}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Tingkat {selectedAchievement.level}
                  </span>
                  {selectedAchievement.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {selectedAchievement.category}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] mb-4 text-xs">
                  {selectedAchievement.recipient && (
                    <div>
                      <span className="text-[var(--mute)] block font-medium">Siswa / Regu Peraih:</span>
                      <strong className="text-[var(--ink)] font-bold text-sm">
                        {selectedAchievement.recipient}
                      </strong>
                    </div>
                  )}
                  {selectedAchievement.coach && (
                    <div>
                      <span className="text-[var(--mute)] block font-medium">Guru Pembina / Pendamping:</span>
                      <strong className="text-[var(--ink)] font-bold text-sm">
                        {selectedAchievement.coach}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-line p-4 rounded-2xl bg-[var(--paper)] border-l-4 border-emerald-600">
                  {selectedAchievement.description}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--line)] bg-[var(--paper)] flex justify-end">
              <button
                onClick={closeAchievementModal}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
