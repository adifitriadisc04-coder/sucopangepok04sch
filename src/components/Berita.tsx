import React, { useState } from 'react';
import { Newspaper, Calendar, ArrowRight, X, Clock, Share2, Check, Images, User, Filter, Tag } from 'lucide-react';
import { NewsItem } from '../types';

interface BeritaProps {
  news: NewsItem[];
}

export const Berita: React.FC<BeritaProps> = ({ news }) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const handleShare = () => {
    if (navigator.share && selectedArticle) {
      navigator.share({
        title: selectedArticle.title,
        text: selectedArticle.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openArticle = (item: NewsItem) => {
    setSelectedArticle(item);
    setActivePhotoIdx(0);
  };

  // Filtered News
  const filteredNews = news.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Kegiatan Intra') {
      return (
        item.category.toLowerCase().includes('kegiatan') ||
        item.category.toLowerCase().includes('intra') ||
        item.title.toLowerCase().includes('pramuka') ||
        item.title.toLowerCase().includes('senam') ||
        item.title.toLowerCase().includes('upacara') ||
        item.title.toLowerCase().includes('kemah')
      );
    }
    return item.category === selectedCategory;
  });

  return (
    <section id="berita" className="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              Informasi Terkini & Publikasi
            </span>
            <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
              Berita & Pengumuman Sekolah
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
              Dapatkan informasi terupdate seputar kegiatan belajar, acara penting, kegiatan intra sekolah, inovasi pendidikan, dan pengumuman resmi lengkap dengan dokumentasi foto.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-[var(--mute)] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            {[
              'Semua',
              'Kegiatan Intra',
              'Pengumuman',
              'Akademik',
              'Prestasi',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-[var(--card)] text-[var(--mute)] border border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Cards Grid */}
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-dashed border-[var(--line)] text-[var(--mute)]">
            Belum ada berita atau pengumuman pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => {
              const allPhotos = item.images && item.images.length > 0
                ? item.images
                : item.image ? [item.image] : [];
              const thumbnail = allPhotos[0] || '';

              return (
                <article
                  key={item.id}
                  onClick={() => openArticle(item)}
                  className="group bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Container with Multiple Photos Badge */}
                    <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-200">
                          <Newspaper className="w-10 h-10 opacity-40" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {item.category}
                      </div>

                      {/* Multi-photo indicator if article has more than 1 photo */}
                      {allPhotos.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                          <Images className="w-3.5 h-3.5 text-amber-300" />
                          <span>{allPhotos.length} Foto</span>
                        </div>
                      )}

                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                      <h3 className="font-disp font-bold text-lg sm:text-xl text-[var(--ink)] leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-sm text-[var(--mute)] leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 flex items-center justify-between border-t border-[var(--line)] pt-4 mt-auto">
                    <span className="text-xs text-[var(--mute-soft)] font-medium">
                      Oleh: {item.author || 'Admin Sekolah'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Baca Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* Article Detail & Multi-Photo Modal */}
      {selectedArticle && (() => {
        const photosList = selectedArticle.images && selectedArticle.images.length > 0
          ? selectedArticle.images
          : selectedArticle.image ? [selectedArticle.image] : [];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="bg-[var(--card)] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-[var(--line-strong)] shadow-2xl overflow-hidden relative text-[var(--ink)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-800 text-white">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs text-[var(--mute)]">
                    {formatDate(selectedArticle.date)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    aria-label="Bagikan artikel"
                    className="w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    aria-label="Tutup artikel"
                    className="w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Article Content (Scrollable) */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                {/* Main Featured Photo & Thumbnail Selector if multiple photos */}
                {photosList.length > 0 && (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-[var(--line)] shadow-md bg-stone-900">
                      <img
                        src={photosList[activePhotoIdx] || photosList[0]}
                        alt={selectedArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {photosList.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {photosList.map((ph, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-16 h-12 rounded-xl overflow-hidden border-2 flex-none transition-all cursor-pointer ${
                              idx === activePhotoIdx
                                ? 'border-emerald-600 scale-105 shadow-md'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={ph} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <h2 className="font-disp font-bold text-2xl sm:text-3xl text-[var(--ink)] leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="p-4 rounded-2xl bg-[var(--paper)] border-l-4 border-emerald-600 text-sm font-semibold text-[var(--ink)] leading-relaxed">
                  {selectedArticle.excerpt}
                </div>

                <div className="text-base text-[var(--ink)] leading-relaxed space-y-4 whitespace-pre-line font-normal">
                  {selectedArticle.body || selectedArticle.excerpt}
                </div>

                <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--mute)]">
                  <span>Diterbitkan oleh {selectedArticle.author || 'Admin & Panitia SDN Sucopangepok 04'}</span>
                  <span>Kec. Jelbuk, Jember</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
