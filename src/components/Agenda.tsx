import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Tag,
  Users, User, CheckCircle2, Filter, X, Sparkles
} from 'lucide-react';
import { EventItem } from '../types';

interface AgendaProps {
  events: EventItem[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const EVENT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  nasional: { label: 'Hari Besar Nasional', color: '#c8352b', bg: '#fef2f2' },
  akademik: { label: 'Akademik & Ujian', color: '#165331', bg: '#ecfdf5' },
  intra: { label: 'Kegiatan Intra Sekolah', color: '#0284c7', bg: '#f0f9ff' },
  keagamaan: { label: 'Peringatan Agama', color: '#b45309', bg: '#fffbeb' },
  libur: { label: 'Libur Resmi', color: '#6b7280', bg: '#f3f4f6' },
};

export const Agenda: React.FC<AgendaProps> = ({ events }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, October = 9
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);

  const changeMonth = (delta: number) => {
    let nextM = currentMonth + delta;
    let nextY = currentYear;
    if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    } else if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
    setSelectedDate(null);
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const getEventsForDay = (day: number) => {
    const fullDate = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === fullDate);
  };

  // Filtered Events for list
  const filteredEvents = events.filter((e) => {
    // Category match
    if (selectedCategory !== 'Semua') {
      if (selectedCategory === 'Kegiatan Intra Sekolah') {
        if (e.type !== 'intra' && !e.title.toLowerCase().includes('pramuka') && !e.title.toLowerCase().includes('upacara') && !e.title.toLowerCase().includes('ekstrakurikuler')) {
          return false;
        }
      } else if (selectedCategory === 'Akademik') {
        if (e.type !== 'akademik') return false;
      } else if (selectedCategory === 'Nasional') {
        if (e.type !== 'nasional') return false;
      } else if (selectedCategory === 'Keagamaan') {
        if (e.type !== 'keagamaan') return false;
      }
    }

    // Date match if a specific day is clicked
    if (selectedDate) {
      return e.date === selectedDate;
    }

    // Otherwise show events in current month or upcoming
    return e.date.startsWith(monthPrefix);
  }).sort((a, b) => a.date.localeCompare(b.date));

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="agenda" className="py-20 bg-[var(--paper)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              Kalender Interaktif
            </span>
            <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
              Agenda & Kegiatan Intra Sekolah
            </h2>
            <p className="mt-2 text-base text-[var(--mute)]">
              Klik tanggal pada kalender untuk melihat rincian kegiatan intra sekolah, latihan pramuka, upacara hari besar, jadwal ujian, dan agenda penting lainnya.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {[
              'Semua',
              'Kegiatan Intra Sekolah',
              'Akademik',
              'Nasional',
              'Keagamaan',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedDate(null);
                }}
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

        {/* Calendar and Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Interactive Calendar Widget */}
          <div className="lg:col-span-7 bg-[var(--card)] p-6 sm:p-7 rounded-3xl border border-[var(--line-strong)] shadow-md">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between pb-5 border-b border-[var(--line)] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-disp font-bold text-xl text-[var(--ink)]">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-xs text-[var(--mute)]">
                    {selectedDate ? `Menampilkan agenda: ${selectedDate}` : 'Klik tanggal untuk filter kegiatan'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 rounded-lg hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Bulan sebelumnya"
                  className="w-9 h-9 rounded-full bg-[var(--paper)] hover:bg-[var(--f50)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Bulan berikutnya"
                  className="w-9 h-9 rounded-full bg-[var(--paper)] hover:bg-[var(--f50)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[var(--mute-soft)] mb-2">
              {DAY_NAMES.map((d, i) => (
                <div key={i} className={`py-2 ${i === 0 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-sm">
              {/* Empty padding cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = getEventsForDay(dayNum);
                const hasEvents = dayEvents.length > 0;
                const isSunday = (firstDayIndex + i) % 7 === 0;
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDate(dateKey === selectedDate ? null : dateKey);
                      }
                    }}
                    title={hasEvents ? dayEvents.map((e) => e.title).join(', ') : `Tanggal ${dayNum}`}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 relative transition-all border cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-emerald-600 bg-emerald-600 text-white font-bold scale-105 shadow-md border-emerald-600'
                        : hasEvents
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 font-bold text-emerald-900 dark:text-emerald-200 hover:scale-105 shadow-2xs'
                        : isSunday
                        ? 'bg-[var(--paper)]/50 border-transparent text-rose-600 dark:text-rose-400 opacity-80'
                        : 'bg-[var(--paper)]/40 border-transparent text-[var(--ink)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{dayNum}</span>
                    {hasEvents && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {dayEvents.map((e, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : ''}`}
                            style={{
                              backgroundColor: isSelected
                                ? '#fde047'
                                : EVENT_TYPES[e.type]?.color || '#165331',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-[var(--line)] flex flex-wrap gap-4 text-xs font-semibold text-[var(--mute)]">
              {Object.entries(EVENT_TYPES).map(([key, item]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Interactive Event List Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--line-strong)] shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
                <div>
                  <h3 className="font-disp font-bold text-lg text-[var(--ink)]">
                    {selectedDate ? 'Kegiatan Tanggal Dipilih' : 'Daftar Kegiatan Bulan Ini'}
                  </h3>
                  <p className="text-xs text-[var(--mute)]">
                    {filteredEvents.length} kegiatan terjadwal
                  </p>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 rounded-full hover:bg-[var(--paper)] text-[var(--mute)] cursor-pointer"
                    title="Tutup filter tanggal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--mute)] border border-dashed border-[var(--line)] rounded-2xl">
                  Tidak ada agenda atau kegiatan sekolah pada pilihan ini.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredEvents.map((ev, idx) => {
                    const badge = EVENT_TYPES[ev.type] || {
                      label: ev.type,
                      color: '#165331',
                      bg: '#edf7f1',
                    };

                    return (
                      <div
                        key={ev.id || idx}
                        onClick={() => setModalEvent(ev)}
                        className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] hover:border-emerald-600 transition-all hover:-translate-y-0.5 cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs text-[var(--mute)] font-mono font-bold">
                            {ev.date}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {ev.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--mute)]">
                          {ev.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{ev.time}</span>
                            </div>
                          )}
                          {ev.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-600" />
                              <span>{ev.location}</span>
                            </div>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-xs text-[var(--mute)] line-clamp-2 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Detail Kegiatan / Agenda */}
      {modalEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalEvent(null)}
        >
          <div
            className="bg-[var(--card)] text-[var(--ink)] rounded-3xl max-w-lg w-full p-6 border border-[var(--line-strong)] shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
                    Rincian Agenda Sekolah
                  </span>
                  <h3 className="font-disp font-bold text-lg text-[var(--ink)] leading-snug">
                    {modalEvent.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setModalEvent(null)}
                className="w-8 h-8 rounded-full bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>{formatEventDate(modalEvent.date)}</span>
              </div>
              {modalEvent.time && (
                <div className="flex items-center gap-2 text-[var(--mute)]">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Waktu: <strong>{modalEvent.time}</strong></span>
                </div>
              )}
              {modalEvent.location && (
                <div className="flex items-center gap-2 text-[var(--mute)]">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Lokasi: <strong>{modalEvent.location}</strong></span>
                </div>
              )}
              {modalEvent.organizer && (
                <div className="flex items-center gap-2 text-[var(--mute)]">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Penanggung Jawab / Pembina: <strong>{modalEvent.organizer}</strong></span>
                </div>
              )}
              {modalEvent.target && (
                <div className="flex items-center gap-2 text-[var(--mute)]">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Peserta / Sasaran: <strong>{modalEvent.target}</strong></span>
                </div>
              )}
            </div>

            {modalEvent.description && (
              <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-sm leading-relaxed text-[var(--ink)]">
                {modalEvent.description}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalEvent(null)}
                className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700"
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
