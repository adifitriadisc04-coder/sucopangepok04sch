import React, { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { WhatsAppConfig, SchoolInfo } from '../types';

interface FloatingWhatsAppProps {
  whatsapp: WhatsAppConfig;
  school: SchoolInfo;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsapp, school }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!whatsapp || !whatsapp.enabled) return null;

  const rawNumber = whatsapp.number || '085236111999';
  const cleanNumber = rawNumber.replace(/\D/g, '').replace(/^0/, '62');
  const defaultMsg = whatsapp.message || 'Halo, saya ingin bertanya tentang SDN Sucopangepok 04.';
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Card Header */}
          <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm">
                SC
              </div>
              <div>
                <h4 className="font-disp font-bold text-sm leading-tight text-white">
                  {school.name}
                </h4>
                <span className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Respon Cepat Sekolah</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3 bg-[var(--paper)]">
            <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--ink)] leading-relaxed shadow-2xs">
              <p className="font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                Assalamu'alaikum! 👋
              </p>
              <p className="text-[var(--mute)]">
                Ada yang bisa kami bantu seputar pendaftaran siswa baru, kegiatan sekolah, atau informasi lainnya?
              </p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa4f] text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Mulai Chat WhatsApp</span>
            </a>
          </div>

          <div className="px-4 py-2 bg-[var(--cream)] text-center text-[10px] text-[var(--mute)] font-medium border-t border-[var(--line)]">
            Nomor Resmi: {rawNumber}
          </div>
        </div>
      )}

      {/* Floating Action Button with subtle breathing ring */}
      <div className="relative">
        {/* Animated breathing pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring -z-10 opacity-70" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka Chat WhatsApp"
          className="flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa4f] text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 fill-white flex-none"
            viewBox="0 0 24 24"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.072-2.371-.62-1.615-.668-2.673-2.302-2.753-2.408-.08-.107-.655-.873-.655-1.665 0-.793.415-1.183.562-1.341.148-.159.324-.199.432-.199.108 0 .216.002.31.006.101.005.234-.038.366.279.136.327.466 1.139.507 1.222.041.083.069.18.014.288-.054.108-.081.175-.162.27-.081.095-.17.212-.243.284-.081.08-.166.167-.071.33.095.163.422.697.905 1.127.623.555 1.149.727 1.312.808.163.081.258.068.354-.041.095-.108.406-.473.514-.635.108-.162.216-.135.365-.081.149.054.947.447 1.11.528.163.081.271.122.311.189.041.068.041.392-.103.797z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.603 0-3.094-.492-4.34-1.333l-.311-.21-2.967.832.835-2.915-.229-.328A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
          </svg>
          <span className="font-bold text-xs sm:text-sm tracking-wide">
            {whatsapp.label || 'Chat WhatsApp'}
          </span>
        </button>
      </div>
    </div>
  );
};
