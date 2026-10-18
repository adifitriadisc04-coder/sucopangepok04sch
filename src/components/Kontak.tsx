import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, ExternalLink, CheckCircle2, User } from 'lucide-react';
import { SchoolInfo, WhatsAppConfig, GuestbookEntry } from '../types';

interface KontakProps {
  school: SchoolInfo;
  whatsapp: WhatsAppConfig;
  guestbook: GuestbookEntry[];
  onAddGuestbook: (entry: GuestbookEntry) => void;
}

export const Kontak: React.FC<KontakProps> = ({
  school,
  whatsapp,
  guestbook,
  onAddGuestbook,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [formName, setFormName] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mapsQuery = encodeURIComponent(school.mapsQuery || school.address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) return;

    const newEntry: GuestbookEntry = {
      id: 'gb_' + Date.now(),
      name: formName.trim(),
      origin: formOrigin.trim() || 'Masyarakat Umum',
      message: formMessage.trim(),
      date: new Date().toISOString().slice(0, 10),
      approved: true,
    };

    onAddGuestbook(newEntry);
    setSubmitted(true);

    // If WhatsApp is enabled, allow opening WA directly as well
    if (whatsapp.enabled && whatsapp.number) {
      const waText = `Halo SDN Sucopangepok 04,\nSaya: ${formName.trim()} (${formOrigin.trim() || 'Umum'})\nPesan: ${formMessage.trim()}`;
      const waCleanNumber = whatsapp.number.replace(/\D/g, '').replace(/^0/, '62');
      window.open(`https://wa.me/${waCleanNumber}?text=${encodeURIComponent(waText)}`, '_blank');
    }

    setFormName('');
    setFormOrigin('');
    setFormMessage('');

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const sampleApproved = [
    {
      name: 'Budi Santoso',
      origin: 'Wali Murid Kelas IV',
      message: 'Alhamdulillah, terima kasih kepada bapak/ibu guru SDN Sucopangepok 04 yang senantiasa sabar membimbing anak-anak.',
      date: '2026-10-12',
    },
    {
      name: 'Siti Aminah, S.Pd',
      origin: 'Pemerhati Pendidikan Jember',
      message: 'Sekolah yang asri dan sejuk di kaki pegunungan Argopuro. Semoga terus berprestasi dan menginspirasi!',
      date: '2026-10-05',
    },
    ...guestbook,
  ];

  return (
    <section id="kontak" className="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Layanan Komunikasi
          </span>
          <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Kontak, Lokasi & Buku Tamu
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
            Kami menyambut baik kunjungan, saran, pertanyaan wali murid, serta silaturahmi dari masyarakat luas.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Guestbook Form */}
          <div className="lg:col-span-7 bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--line-strong)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-disp font-bold text-xl text-[var(--ink)]">
                  Kirim Pesan & Buku Tamu
                </h3>
                <p className="text-xs text-[var(--mute)]">
                  Tinggalkan pesan Anda untuk pimpinan dan civitas akademika sekolah
                </p>
              </div>
            </div>

            {submitted && (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
                <p className="text-xs sm:text-sm font-semibold">
                  Terima kasih! Pesan Anda telah tersimpan dan siap diteruskan ke WhatsApp sekolah.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-[var(--ink)] placeholder-[var(--mute-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    Asal / Instansi / Status
                  </label>
                  <input
                    type="text"
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    placeholder="Contoh: Wali Murid / Alumni / Umum"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-[var(--ink)] placeholder-[var(--mute-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                  Isi Pesan / Saran <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Tuliskan pesan, kesan, atau pertanyaan Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-[var(--ink)] placeholder-[var(--mute-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Sekarang</span>
                </button>

                <p className="text-[11px] text-[var(--mute)]">
                  Pesan langsung terhubung dengan WhatsApp resmi sekolah.
                </p>
              </div>
            </form>

            {/* Approved Guestbook entries preview */}
            <div className="mt-8 pt-6 border-t border-[var(--line)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--mute-soft)] mb-4">
                Catatan Pengunjung Terbaru
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {sampleApproved.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold flex-none">
                      {entry.name[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                          {entry.name}
                        </span>
                        <span className="text-[10px] text-[var(--mute)]">
                          {entry.date}
                        </span>
                      </div>
                      {entry.origin && (
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 block">
                          {entry.origin}
                        </span>
                      )}
                      <p className="text-xs text-[var(--mute)] mt-1 leading-relaxed">
                        {entry.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Address, Info, and Interactive Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Map Preview Card */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] overflow-hidden shadow-md">
              <div className="relative aspect-[16/10] bg-emerald-950/20">
                {showMap ? (
                  <iframe
                    title="Peta Lokasi SDN Sucopangepok 04"
                    src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-900 to-emerald-950 text-white">
                    <MapPin className="w-12 h-12 text-amber-300 mb-2 animate-bounce" />
                    <h4 className="font-disp font-bold text-lg mb-1">
                      Peta Lokasi Lereng Argopuro
                    </h4>
                    <p className="text-xs text-emerald-200/80 max-w-xs mb-4">
                      Dusun Lengkong, Desa Sucopangepok, Kec. Jelbuk, Kab. Jember (800 mdpl)
                    </p>
                    <button
                      onClick={() => setShowMap(true)}
                      className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Buka Peta Interaktif
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--card)] border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs text-[var(--mute)] font-medium">Buka rute navigasi langsung:</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Direct Contact Cards */}
            <div className="bg-[var(--card)] p-6 sm:p-7 rounded-3xl border border-[var(--line-strong)] shadow-md space-y-4">
              <h3 className="font-disp font-bold text-lg text-[var(--ink)] mb-2">
                Informasi Kontak
              </h3>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-none mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase text-[var(--mute-soft)] block">Alamat Resmi</span>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--ink)] leading-snug mt-0.5">
                    {school.address}
                  </p>
                </div>
              </div>

              {school.phone && (
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                  <Phone className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-none mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[var(--mute-soft)] block">Telepon / WhatsApp</span>
                    <a
                      href={`tel:${school.phone}`}
                      className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 hover:underline block mt-0.5"
                    >
                      {school.phone}
                    </a>
                  </div>
                </div>
              )}

              {school.email && (
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                  <Mail className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-none mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase text-[var(--mute-soft)] block">Email Sekolah</span>
                    <a
                      href={`mailto:${school.email}`}
                      className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 hover:underline truncate block mt-0.5"
                    >
                      {school.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-none mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase text-[var(--mute-soft)] block">Jam Pelayanan</span>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--ink)] leading-snug mt-0.5">
                    Senin – Sabtu: 07.00 – 13.00 WIB
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
