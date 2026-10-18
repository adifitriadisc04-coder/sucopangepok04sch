import React from 'react';
import { ExternalLink, Instagram, Music2, Facebook, Youtube, Share2 } from 'lucide-react';
import { SiteData } from '../types';

interface SosialProps {
  social: SiteData['social'];
}

export const Sosial: React.FC<SosialProps> = ({ social }) => {
  const channels = [
    {
      key: 'instagram',
      name: 'Instagram',
      handle: '@sdn.sucopangepok04',
      desc: 'Galeri foto kegiatan harian, prestasi siswa, dan momen sekolah',
      url: social.instagram?.url || 'https://www.instagram.com/sdn.sucopangepok04',
      enabled: social.instagram?.enabled,
      icon: Instagram,
      color: '#E1306C',
      bgGrad: 'from-pink-500/10 via-purple-500/10 to-transparent',
      hoverBorder: 'hover:border-pink-500',
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      handle: '@sucopangepok04',
      desc: 'Video pendek kreasi siswa, senam bersama, dan keseruan belajar',
      url: social.tiktok?.url || 'https://www.tiktok.com/@sucopangepok04',
      enabled: social.tiktok?.enabled,
      icon: Music2,
      color: '#000000',
      bgGrad: 'from-cyan-500/10 via-rose-500/10 to-transparent',
      hoverBorder: 'hover:border-rose-500',
    },
    {
      key: 'youtube',
      name: 'YouTube',
      handle: 'SDN Sucopangepok 04',
      desc: 'Video dokumenter profil, peringatan hari besar, dan karya inovasi',
      url: social.youtube?.url || 'https://www.youtube.com',
      enabled: true,
      icon: Youtube,
      color: '#FF0000',
      bgGrad: 'from-red-500/10 via-red-600/5 to-transparent',
      hoverBorder: 'hover:border-red-500',
    },
    {
      key: 'facebook',
      name: 'Facebook',
      handle: 'SDN Sucopangepok 04',
      desc: 'Komunitas wali murid, alumni, dan kabar pengumuman resmi',
      url: social.facebook?.url || 'https://www.facebook.com',
      enabled: true,
      icon: Facebook,
      color: '#1877F2',
      bgGrad: 'from-blue-500/10 via-blue-600/5 to-transparent',
      hoverBorder: 'hover:border-blue-500',
    },
  ];

  return (
    <section id="sosial" className="py-20 bg-[var(--paper)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Tetap Terhubung
          </span>
          <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Saluran Resmi Media Sosial
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--mute)]">
            Dukung dan ikuti karya anak-anak kami dengan berlangganan akun media sosial resmi SDN Sucopangepok 04.
          </p>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((chan) => {
            const Icon = chan.icon;

            return (
              <a
                key={chan.key}
                href={chan.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${chan.hoverBorder} relative overflow-hidden`}
              >
                {/* Background Ambient Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${chan.bgGrad} rounded-full blur-xl pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: chan.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="p-2 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--mute)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="font-disp font-bold text-lg text-[var(--ink)]">
                    {chan.name}
                  </h3>
                  
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {chan.handle}
                  </p>

                  <p className="text-xs text-[var(--mute)] leading-relaxed mt-2.5">
                    {chan.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span>Ikuti Saluran</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};
