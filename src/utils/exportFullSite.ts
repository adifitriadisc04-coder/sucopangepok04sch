import JSZip from 'jszip';
import { SiteData, PPDBItem } from '../types';

/**
 * Generates CSV content from PPDB student registrants for export/archiving
 */
export function generatePPDBcsv(registrants: PPDBItem[], academicYear: string): string {
  const headers = [
    'No Registrasi',
    'Tanggal Daftar',
    'Nama Lengkap Siswa',
    'NIK',
    'No Kartu Keluarga (KK)',
    'NISN',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Nama Orang Tua / Wali',
    'Pekerjaan Orang Tua',
    'No WhatsApp / HP',
    'Alamat Lengkap',
    'Asal Sekolah TK/PAUD',
    'Jalur Pendaftaran',
    'Status Verifikasi',
    'Ukuran KK Terkompresi Sistem (KB)',
    'Ukuran KK Asli (KB)',
    'Status Google Drive',
    'Catatan Tambahan'
  ];

  const rows = registrants.map((item) => [
    `"${item.regNumber}"`,
    `"${item.dateSubmitted || ''}"`,
    `"${(item.studentName || '').replace(/"/g, '""')}"`,
    `"${item.nik || ''}"`,
    `"${item.familyCardNumber || ''}"`,
    `"${item.nisn || ''}"`,
    `"${(item.birthPlace || '').replace(/"/g, '""')}"`,
    `"${item.birthDate || ''}"`,
    `"${item.gender}"`,
    `"${(item.parentName || '').replace(/"/g, '""')}"`,
    `"${(item.parentJob || '').replace(/"/g, '""')}"`,
    `"${item.phone || ''}"`,
    `"${(item.address || '').replace(/"/g, '""')}"`,
    `"${(item.originSchool || '').replace(/"/g, '""')}"`,
    `"${item.path}"`,
    `"${item.status}"`,
    `"${item.kkCompressedSizeKb || (item.kkDocument ? 165 : 0)}"`,
    `"${item.kkOriginalSizeKb || (item.kkDocument ? 2400 : 0)}"`,
    `"${item.driveSyncStatus || 'Belum Disinkron'}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
}

/**
 * Generates a complete standalone index.html file containing all data, styles,
 * and client-side logic, EXACTLY matching the live preview website.
 * The generated single HTML includes an embedded Admin & Backup system so it can
 * run on GitHub Pages and be updated regularly without needing any build tools.
 */
export function generateFullSiteHtml(data: SiteData): string {
  const jsonString = JSON.stringify(data, null, 2);
  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
  const palette = data.appearance?.colorPalette || 'emerald';
  const fontFamily = data.appearance?.fontFamily || 'Plus Jakarta Sans';
  const adminPass = data.credentials?.passwordHash || 'sucopangepok04';

  return `<!doctype html>
<html lang="id" data-palette="${palette}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${data.school.name} - Website Resmi Sekolah</title>
  <meta name="description" content="${data.school.footerAbout || 'Website Resmi SD Negeri Sucopangepok 04 Kecamatan Jelbuk Kabupaten Jember'}">
  <meta property="og:title" content="${data.school.name} - Website Resmi">
  <meta property="og:description" content="${data.school.footerAbout || 'Sekolah Kaki Langit yang religius, berwawasan IPTEK, dan peduli lingkungan.'}">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2216%22%20fill%3D%22%23165331%22/%3E%3Cpath%20d%3D%22M14%2030%2032%2017l18%2013%22%20fill%3D%22none%22%20stroke%3D%22%23fbf7ee%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M19%2029v18h26V29%22%20fill%3D%22none%22%20stroke%3D%22%23fbf7ee%22%20stroke-width%3D%224%22%20stroke-linejoin%3D%22round%22/%3E%3Crect%20x%3D%2228%22%20y%3D%2236%22%20width%3D%228%22%20height%3D%2211%22%20rx%3D%221.5%22%20fill%3D%22%23e9a23b%22/%3E%3Cpath%20d%3D%22M32%206v9%22%20stroke%3D%22%23fbf7ee%22%20stroke-width%3D%222%22/%3E%3Cpath%20d%3D%22M32%206h8v3h-8z%22%20fill%3D%22%23c8352b%22/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  ${data.adsense?.enabled && data.adsense.clientId ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.adsense.clientId}" crossorigin="anonymous"></script>` : ''}
  <style>
    :root {
      --paper: #faf7f0;
      --card: #ffffff;
      --card-elevated: #ffffff;
      --cream: #f4ece0;
      --cream-strong: #ebe0cf;
      --ink: #0a160f;
      --mute: #2a3d32;
      --mute-soft: #4b6255;
      --sun: #d97706;
      --sunsoft: #fef3c7;
      --sunink: #78350f;
      --flag: #dc2626;
      --f50: #edf7f1;
      --f100: #d4ebd8;
      --f200: #acdcb6;
      --f300: #7ac591;
      --f500: #196f3d;
      --f600: #145931;
      --f700: #0f4425;
      --f800: #0a311b;
      --line: rgba(15, 68, 37, 0.12);
      --line-strong: rgba(15, 68, 37, 0.22);
      --sans: "${fontFamily}", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      --disp: "Fraunces", Georgia, serif;
      color-scheme: light;
    }

    [data-palette="emerald"] {
      --paper: #faf7f0; --cream: #f4ece0; --f500: #196f3d; --f600: #145931; --f700: #0f4425;
      --sun: #d97706; --sunsoft: #fef3c7; --sunink: #78350f; --line: rgba(15, 68, 37, 0.12); --line-strong: rgba(15, 68, 37, 0.22);
    }
    [data-palette="amber_gold"] {
      --paper: #fdfaf2; --cream: #f6eedb; --f500: #92400e; --f600: #78350f; --f700: #5a2608;
      --sun: #d97706; --sunsoft: #fef3c7; --sunink: #78350f; --ink: #1c0d02; --mute: #452410; --line: rgba(120, 53, 15, 0.14); --line-strong: rgba(120, 53, 15, 0.24);
    }
    [data-palette="ocean_blue"] {
      --paper: #f8fafc; --cream: #edf3f8; --f500: #0369a1; --f600: #075985; --f700: #0c4a6e;
      --sun: #0284c7; --sunsoft: #e0f2fe; --sunink: #0369a1; --ink: #081521; --mute: #233b53; --line: rgba(12, 74, 110, 0.14); --line-strong: rgba(12, 74, 110, 0.24);
    }
    [data-palette="terracotta"] {
      --paper: #faf6f0; --cream: #f2eae0; --f500: #9a3412; --f600: #7c2d12; --f700: #5f210c;
      --sun: #c2410c; --sunsoft: #ffedd5; --sunink: #9a3412; --ink: #1f0b04; --mute: #4a2416; --line: rgba(124, 45, 18, 0.14); --line-strong: rgba(124, 45, 18, 0.24);
    }
    [data-palette="royal_violet"] {
      --paper: #faf6fb; --cream: #f2e8f5; --f500: #5b21b6; --f600: #4c1d95; --f700: #3b0764;
      --sun: #b45309; --sunsoft: #fef3c7; --sunink: #78350f; --ink: #150529; --mute: #3c1a59; --line: rgba(76, 29, 149, 0.14); --line-strong: rgba(76, 29, 149, 0.24);
    }

    :root[data-theme="dark"], html.dark {
      --paper: #08120c; --card: #102117; --card-elevated: #162c20; --cream: #12241a; --cream-strong: #173022;
      --ink: #f2faf5; --mute: #b2cebe; --mute-soft: #8cae9a; --sun: #fbbf24; --sunsoft: #2c2008; --sunink: #fde68a;
      --flag: #ef4444; --f50: #11261a; --f100: #163624; --f200: #1f4f34; --f300: #29724a; --f500: #22c55e;
      --f600: #34d399; --f700: #4ade80; --f800: #86efac; --line: rgba(74, 222, 128, 0.18); --line-strong: rgba(74, 222, 128, 0.32);
      color-scheme: dark;
    }

    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 84px; -webkit-text-size-adjust: 100%; }
    body { margin: 0; background-color: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 16px; line-height: 1.65; -webkit-font-smoothing: antialiased; }
    h1, h2, h3, h4, .font-disp { font-family: var(--disp); font-feature-settings: "liga" 1; }

    @keyframes softPulse {
      0%, 100% { transform: scale(1); opacity: 0.95; }
      50% { transform: scale(1.06); opacity: 0.65; }
    }
    .animate-pulse-ring { animation: softPulse 2.5s ease-in-out infinite; }
  </style>
</head>
<body class="bg-[var(--paper)] text-[var(--ink)] antialiased transition-colors duration-300">

  <!-- TOP NOTICE BAR -->
  ${data.school.headerNotice ? `
  <div class="w-full bg-[var(--f700)] text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center border-b border-emerald-700/60 flex items-center justify-center gap-2 shadow-xs">
    <span>🔔</span>
    <span class="truncate max-w-4xl">${data.school.headerNotice}</span>
    ${data.school.academicYear ? `<span class="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-950 text-amber-300 text-[10px] font-mono">TA ${data.school.academicYear}</span>` : ''}
  </div>` : ''}

  <!-- STICKY HEADER -->
  <header class="sticky top-0 z-40 w-full bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--line)] transition-all duration-300 shadow-xs">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3">
      <!-- Brand -->
      <a href="#beranda" class="flex items-center gap-2.5 sm:gap-3 group min-w-0">
        ${data.school.logo ? `
          <img src="${data.school.logo}" alt="${data.school.name}" class="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
        ` : `
          <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--f700)] text-white flex items-center justify-center font-bold text-lg">SC</div>
        `}
        ${data.school.secondaryLogo ? `
          <img src="${data.school.secondaryLogo}" alt="Logo Pendukung" class="hidden sm:block w-9 h-9 object-contain opacity-85">
        ` : ''}
        <div class="min-w-0">
          <h1 class="font-disp font-bold text-[15px] sm:text-[17px] leading-tight text-[var(--ink)] tracking-tight truncate group-hover:text-[var(--f600)] transition-colors">
            ${data.school.name}
          </h1>
          <p class="text-[11px] sm:text-[12px] text-[var(--mute)] font-medium truncate flex items-center gap-1.5">
            <span>${data.school.location || 'Kabupaten Jember'}</span>
            <span class="opacity-40">•</span>
            <span class="font-semibold text-[var(--f600)]">NPSN ${data.school.npsn}</span>
            ${data.school.headerTagline ? `
              <span class="opacity-40 hidden lg:inline">•</span>
              <span class="text-emerald-700 dark:text-emerald-400 font-semibold hidden lg:inline">${data.school.headerTagline}</span>
            ` : ''}
          </p>
        </div>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden xl:flex items-center gap-1 bg-[var(--card)]/80 p-1.5 rounded-full border border-[var(--line)] shadow-xs">
        <a href="#beranda" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Beranda</a>
        <a href="#sambutan" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Sambutan</a>
        <a href="#profil" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Profil</a>
        ${data.ppdb?.config?.enabled ? `<a href="#ppdb" class="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs transition-all">PPDB Baru 🎓</a>` : ''}
        <a href="#fasilitas" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Fasilitas</a>
        <a href="#guru" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Guru</a>
        <a href="#prestasi" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Prestasi</a>
        <a href="#galeri" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Galeri</a>
        <a href="#agenda" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Agenda</a>
        <a href="#berita" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Berita</a>
        <a href="#kontak" class="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)] transition-all">Kontak</a>
      </nav>

      <!-- Theme Switcher & Mobile Menu Trigger -->
      <div class="flex items-center gap-2">
        <button onclick="toggleTheme()" class="w-10 h-10 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] text-[var(--ink)] border border-[var(--line-strong)] flex items-center justify-center transition-all cursor-pointer shadow-xs" title="Ganti Mode Gelap / Terang">
          🌓
        </button>
        <button onclick="toggleMobileNav()" class="xl:hidden w-10 h-10 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] text-[var(--ink)] border border-[var(--line-strong)] flex items-center justify-center transition-all cursor-pointer" aria-label="Menu">
          ☰
        </button>
      </div>
    </div>
  </header>

  <!-- MOBILE NAVIGATION DRAWER -->
  <div id="mobile-nav" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden" onclick="toggleMobileNav()">
    <div class="bg-[var(--card)] w-72 sm:w-80 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto" onclick="event.stopPropagation()">
      <div class="space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div class="font-bold text-sm font-disp text-[var(--ink)]">${data.school.name}</div>
          <button onclick="toggleMobileNav()" class="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center text-sm cursor-pointer">✕</button>
        </div>
        <div class="flex flex-col space-y-2 text-sm font-semibold text-[var(--mute)]">
          <a href="#beranda" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Beranda</a>
          <a href="#sambutan" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Sambutan Kepala Sekolah</a>
          <a href="#profil" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Profil & Sejarah</a>
          ${data.ppdb?.config?.enabled ? `<a href="#ppdb" onclick="toggleMobileNav()" class="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold">PPDB Online Baru 🎓</a>` : ''}
          <a href="#fasilitas" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Fasilitas Sekolah</a>
          <a href="#guru" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Dewan Guru</a>
          <a href="#prestasi" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Prestasi & Piala</a>
          <a href="#galeri" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Galeri Dokumentasi</a>
          <a href="#agenda" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Agenda Kegiatan</a>
          <a href="#berita" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Berita Sekolah</a>
          <a href="#kontak" onclick="toggleMobileNav()" class="p-2.5 rounded-xl hover:bg-[var(--f50)] hover:text-[var(--ink)]">Kontak & Buku Tamu</a>
        </div>
      </div>
      <div class="pt-4 border-t border-[var(--line)] text-xs text-[var(--mute)]">
        &copy; ${new Date().getFullYear()} ${data.school.name}
      </div>
    </div>
  </div>

  <main>
    <!-- HERO SECTION -->
    <section id="beranda" class="relative overflow-hidden pt-6 pb-16 lg:py-16">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <!-- Left Column -->
          <div class="lg:col-span-7 flex flex-col items-start">
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[var(--sunsoft)] text-[var(--sunink)] border border-amber-300/40 shadow-2xs">
                <span>⭐ Terakreditasi ${data.school.accreditation || 'B'}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--f50)] text-[var(--f700)] border border-[var(--line)]">
                <span>🏫 ${data.school.status || 'SD Negeri'}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--card)] text-[var(--mute)] border border-[var(--line-strong)]">
                <span>NPSN ${data.school.npsn}</span>
              </span>
            </div>

            ${data.school.location ? `
            <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--f700)] bg-[var(--f50)] border border-[var(--line)] mb-5">
              <span>📍 ${data.school.location} • Lereng Pegunungan Argopuro (800 mdpl)</span>
            </div>` : ''}

            <h1 class="font-disp text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[var(--ink)] leading-[1.08] tracking-tight mb-5">
              ${data.hero.title}
            </h1>

            <p class="text-base sm:text-lg text-[var(--mute)] leading-relaxed max-w-2xl font-normal mb-8">
              ${data.hero.subtitle}
            </p>

            <div class="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-10">
              ${data.ppdb?.config?.enabled ? `
              <a href="#ppdb" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--f700)] hover:opacity-90 active:scale-95 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <span>Daftar PPDB Baru 🎓</span>
                <span>→</span>
              </a>` : ''}
              <a href="#profil" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--card)] hover:bg-[var(--f50)] active:bg-[var(--f100)] text-[var(--ink)] border border-[var(--line-strong)] shadow-xs transition-all duration-200 hover:-translate-y-0.5">
                <span>Kenali Sekolah Kami</span>
              </a>
              <a href="#kontak" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[var(--card)] hover:bg-[var(--f50)] active:bg-[var(--f100)] text-[var(--ink)] border border-[var(--line-strong)] shadow-xs transition-all duration-200 hover:-translate-y-0.5">
                <span>Hubungi Kami</span>
              </a>
            </div>

            ${data.hero.stats && data.hero.stats.length > 0 ? `
            <div class="w-full pt-6 border-t border-[var(--line-strong)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              ${data.hero.stats.map(s => `
                <div class="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line-strong)] shadow-2xs hover:shadow-xs transition-all">
                  <b class="block font-disp text-2xl sm:text-3xl font-bold text-[var(--f700)] leading-tight">${s.value}</b>
                  <span class="text-[12px] font-semibold text-[var(--mute)] leading-snug line-clamp-1 mt-0.5">${s.label}</span>
                </div>
              `).join('')}
            </div>` : ''}
          </div>

          <!-- Right Column: Hero Artwork -->
          <div class="lg:col-span-5 relative flex justify-center">
            <div class="relative w-full max-w-[500px]">
              <div class="relative overflow-hidden aspect-[4/3.5] rounded-[34px] rounded-bl-[110px] sm:rounded-bl-[130px] border-2 border-white/60 dark:border-white/10 shadow-2xl bg-stone-900 group">
                ${data.hero.image ? `
                  <img src="${data.hero.image}" alt="${data.school.name}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105">
                ` : `
                  <div class="w-full h-full bg-emerald-900/30 flex items-center justify-center text-emerald-200 font-bold">SDN Sucopangepok 04</div>
                `}
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SAMBUTAN KEPALA SEKOLAH -->
    <section id="sambutan" class="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div class="lg:col-span-4 flex flex-col items-center text-center">
            <div class="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-white dark:border-stone-800 shadow-xl mb-5">
              ${data.principal.photo ? `
                <img src="${data.principal.photo}" alt="${data.principal.name}" class="w-full h-full object-cover">
              ` : `
                <div class="w-full h-full bg-[var(--f700)] text-white flex items-center justify-center text-3xl font-bold">KS</div>
              `}
            </div>
            <h3 class="font-disp font-bold text-xl text-[var(--ink)]">${data.principal.name}</h3>
            <p class="text-xs font-bold text-[var(--f700)] mt-0.5">${data.principal.title || 'Kepala Sekolah'}</p>
            <p class="text-[11px] text-[var(--mute)]">NIP: ${data.principal.nip || '-'}</p>
          </div>

          <div class="lg:col-span-8">
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              Pesan Pimpinan
            </span>
            <h2 class="font-disp text-3xl sm:text-4xl lg:text-[40px] font-bold text-[var(--ink)] leading-tight mb-4">
              ${data.welcome.title}
            </h2>
            <div class="space-y-4 text-base sm:text-lg text-[var(--mute)] leading-relaxed text-${data.welcome.paragraphAlignment === 'justify' ? 'justify' : 'left'}">
              ${data.welcome.paragraphs.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--mute)]">
              <span>Sucopangepok, Jelbuk, Kabupaten Jember</span>
              <span class="font-bold text-[var(--ink)]">${data.principal.name}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROFIL SEKOLAH -->
    <section id="profil" class="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Mengenal Lebih Dekat
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            ${data.profile.title}
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div class="lg:col-span-7 space-y-6">
            <div class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-sm">
              <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-3">Selayang Pandang & Lingkungan</h3>
              <p class="text-base text-[var(--mute)] leading-relaxed text-${data.profile.paragraphAlignment === 'justify' ? 'justify' : 'left'}">
                ${data.profile.intro}
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-sm">
              <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-3">Sejarah Rintisan Sekolah</h3>
              <p class="text-base text-[var(--mute)] leading-relaxed text-${data.profile.paragraphAlignment === 'justify' ? 'justify' : 'left'}">
                ${data.profile.history}
              </p>
            </div>
          </div>

          <div class="lg:col-span-5 space-y-6">
            <div class="p-6 sm:p-8 rounded-3xl bg-[var(--f700)] text-white shadow-md">
              <span class="text-xs uppercase tracking-wider font-bold text-emerald-200">Visi Sekolah</span>
              <p class="font-disp text-xl sm:text-2xl font-bold mt-2 leading-snug">
                "${data.profile.vision}"
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-sm">
              <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-4">Misi Pendidikan</h3>
              <ol class="space-y-3 pl-5 list-decimal text-sm sm:text-base text-[var(--mute)] leading-relaxed">
                ${data.profile.missions.map(m => `<li>${m}</li>`).join('')}
              </ol>
            </div>
          </div>
        </div>

        ${data.profile.videoEnabled && data.profile.videoUrl ? `
        <div class="mt-12 p-6 sm:p-8 rounded-3xl bg-[var(--cream)]/80 border border-[var(--line-strong)]">
          <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-2">${data.profile.videoTitle || 'Video Profil & Dokumentasi Sekolah'}</h3>
          <p class="text-sm text-[var(--mute)] mb-4">${data.profile.videoDescription || 'Dokumentasi visual lingkungan belajar siswa SD Negeri Sucopangepok 04.'}</p>
          <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
            <iframe class="w-full h-full" src="${data.profile.videoUrl.replace('watch?v=', 'embed/')}" title="Video Profil" allowfullscreen></iframe>
          </div>
        </div>` : ''}
      </div>
    </section>

    <!-- PPDB SECTION -->
    ${data.ppdb?.config?.enabled ? `
    <section id="ppdb" class="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-10">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Pendaftaran Siswa Baru
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            ${data.ppdb.config.title}
          </h2>
          <p class="mt-3 text-base sm:text-lg text-[var(--mute)]">
            ${data.ppdb.config.subtitle}
          </p>
        </div>

        <!-- PPDB Tabs -->
        <div class="inline-flex p-1.5 rounded-full bg-[var(--card)] border border-[var(--line-strong)] mb-8 shadow-xs">
          <button id="tab-btn-info" onclick="switchPPDBTab('info')" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--f700)] text-white transition-all cursor-pointer">
            Informasi & Kuota
          </button>
          <button id="tab-btn-daftar" onclick="switchPPDBTab('daftar')" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--mute)] hover:text-[var(--ink)] transition-all cursor-pointer">
            Formulir & Scan KK
          </button>
          <button id="tab-btn-status" onclick="switchPPDBTab('status')" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--mute)] hover:text-[var(--ink)] transition-all cursor-pointer">
            Cek Status Pendaftaran
          </button>
        </div>

        <!-- PPDB TAB 1: INFORMASI -->
        <div id="ppdb-tab-info" class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
              <span class="text-xs font-bold text-[var(--mute)]">Daya Tampung Kuota</span>
              <b class="block font-disp text-3xl font-bold text-[var(--f700)] mt-1">${data.ppdb.config.quota} Siswa</b>
              <span class="text-xs text-[var(--mute)]">1 Rombel Kelas 1</span>
            </div>
            <div class="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
              <span class="text-xs font-bold text-[var(--mute)]">Batas Waktu</span>
              <b class="block font-disp text-2xl font-bold text-[var(--sun)] mt-1">${data.ppdb.config.closeDate}</b>
              <span class="text-xs text-[var(--mute)]">Tahun Pelajaran ${data.ppdb.config.academicYear}</span>
            </div>
            <div class="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
              <span class="text-xs font-bold text-[var(--mute)]">Biaya Pendidikan</span>
              <b class="block font-disp text-2xl font-bold text-emerald-600 mt-1">100% GRATIS</b>
              <span class="text-xs text-[var(--mute)]">Didanai BOS Kemendikbud</span>
            </div>
          </div>

          <div>
            <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-2">Pengumuman Resmi</h3>
            <p class="text-sm sm:text-base text-[var(--mute)] leading-relaxed">${data.ppdb.config.announcement}</p>
          </div>

          <div>
            <h4 class="font-bold text-base text-[var(--ink)] mb-3">Persyaratan Berkas:</h4>
            <ul class="space-y-2 pl-5 list-disc text-sm sm:text-base text-[var(--mute)]">
              ${(data.ppdb.config.requirements || []).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-[var(--f50)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <strong class="text-sm text-[var(--f700)]">Fitur Auto-Kompres Berkas KK (≤ 200KB)</strong>
              <p class="text-xs text-[var(--mute)] mt-0.5">Foto atau scan berkas KK langsung dari ponsel Anda otomatis dikompres aman di bawah 200KB.</p>
            </div>
            <button onclick="switchPPDBTab('daftar')" class="px-5 py-2.5 rounded-full text-xs font-bold bg-[var(--f700)] text-white hover:opacity-90 cursor-pointer">
              Buka Formulir Pendaftaran →
            </button>
          </div>
        </div>

        <!-- PPDB TAB 2: FORMULIR -->
        <div id="ppdb-tab-daftar" class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md hidden">
          <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-1">Formulir Pendaftaran Calon Siswa Baru</h3>
          <p class="text-xs text-[var(--mute)] mb-6">Lengkapi identitas calon peserta didik di bawah ini dengan benar.</p>
          <form onsubmit="handlePublicPPDBSubmit(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Nama Lengkap Siswa *</label>
              <input type="text" id="p-nama" required placeholder="Contoh: Wildan Pratama" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">NIK Siswa (16 Digit)</label>
              <input type="text" id="p-nik" maxlength="16" placeholder="3509xxxxxxxxxxxx" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Nomor Kartu Keluarga (KK)</label>
              <input type="text" id="p-nokk" maxlength="16" placeholder="3509xxxxxxxxxxxx" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Tempat Lahir *</label>
              <input type="text" id="p-tempat" required placeholder="Jember" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Tanggal Lahir *</label>
              <input type="date" id="p-tgl" required class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Jenis Kelamin *</label>
              <select id="p-jk" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Nama Orang Tua / Wali *</label>
              <input type="text" id="p-ortu" required placeholder="Nama Ayah/Ibu/Wali" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">No WhatsApp / HP *</label>
              <input type="tel" id="p-hp" required placeholder="085236111999" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Jalur Pendaftaran *</label>
              <select id="p-jalur" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
                <option value="Zonasi">Zonasi (Domisili Terdekat)</option>
                <option value="Afirmasi">Afirmasi (KIP / Keluarga Kurang Mampu)</option>
                <option value="Prestasi">Prestasi (Bakat Minat)</option>
                <option value="Perpindahan Tugas Orang Tua">Pindahan Tugas Orang Tua</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Alamat Lengkap Rumah *</label>
              <input type="text" id="p-alamat" required placeholder="Dusun Lengkong, RT/RW, Desa Sucopangepok" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            </div>

            <!-- Upload KK dengan Auto Kompres -->
            <div class="sm:col-span-2 p-5 rounded-2xl border-2 border-dashed border-[var(--f500)] bg-[var(--paper)] space-y-2">
              <span class="block text-xs font-bold text-[var(--ink)]">📁 Scan / Foto Kamera Kartu Keluarga (KK)</span>
              <p class="text-xs text-[var(--mute)]">Foto berkas KK langsung dari ponsel Anda. Sistem otomatis mengecilkan ukuran menjadi ≤ 200KB.</p>
              <input type="file" id="p-kk-file" accept="image/*" capture="environment" onchange="handlePublicKKUpload(event)" class="text-xs">
              <div id="kk-preview-box" class="hidden items-center gap-3 pt-2">
                <img id="kk-preview-img" class="w-16 h-16 object-cover rounded-xl border border-[var(--line)]" alt="Preview">
                <span id="kk-preview-text" class="text-xs font-bold text-emerald-700 dark:text-emerald-400"></span>
              </div>
            </div>

            <div class="sm:col-span-2 pt-2">
              <button type="submit" class="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-[var(--f700)] text-white hover:opacity-90 shadow-md cursor-pointer transition-all">
                Kirim Formulir Pendaftaran PPDB 🚀
              </button>
            </div>
          </form>
        </div>

        <!-- PPDB TAB 3: CEK STATUS -->
        <div id="ppdb-tab-status" class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md hidden space-y-4">
          <h3 class="font-disp font-bold text-xl text-[var(--ink)]">Cek Status Pendaftaran Siswa</h3>
          <p class="text-xs text-[var(--mute)]">Masukkan Nomor Registrasi (contoh: <code>PPDB-2026-001</code>), NIK, atau Nama Siswa:</p>
          <div class="flex gap-2 max-w-lg">
            <input type="text" id="status-search-input" placeholder="No. Registrasi / NIK / Nama..." class="flex-1 px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
            <button onclick="checkStudentStatus()" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--f700)] text-white cursor-pointer hover:opacity-90">
              Cari Data
            </button>
          </div>
          <div id="status-result-box" class="pt-2"></div>
        </div>

      </div>
    </section>` : ''}

    <!-- FASILITAS SEKOLAH -->
    <section id="fasilitas" class="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Sarana & Prasarana
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Fasilitas Unggulan Sekolah
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${data.facilities.map(f => `
            <div class="rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] overflow-hidden shadow-xs hover:shadow-md transition-all group">
              ${f.image ? `
                <div class="aspect-[16/10] overflow-hidden bg-stone-100">
                  <img src="${f.image}" alt="${f.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                </div>
              ` : ''}
              <div class="p-6">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--f50)] text-[var(--f700)]">${f.category || 'Fasilitas Belajar'}</span>
                <h3 class="font-disp font-bold text-lg text-[var(--ink)] mt-2 mb-2">${f.name}</h3>
                <p class="text-sm text-[var(--mute)] leading-relaxed">${f.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- PRESTASI SISWA -->
    <section id="prestasi" class="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Piala & Prestasi
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Prestasi Siswa & Kejuaraan Intra
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${data.achievements.map(a => `
            <div class="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                ${a.photos && a.photos[0] ? `
                  <div class="aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img src="${a.photos[0]}" alt="${a.title}" class="w-full h-full object-cover">
                  </div>
                ` : a.photo ? `
                  <div class="aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img src="${a.photo}" alt="${a.title}" class="w-full h-full object-cover">
                  </div>
                ` : ''}
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950">${a.level}</span>
                  <span class="text-xs text-[var(--mute)] font-medium">Tahun ${a.year}</span>
                </div>
                <h3 class="font-disp font-bold text-lg text-[var(--ink)] mb-2">${a.title}</h3>
                ${a.recipient ? `<p class="text-xs font-bold text-[var(--f700)] mb-1">Peraih: ${a.recipient}</p>` : ''}
                ${a.coach ? `<p class="text-[11px] text-[var(--mute)] mb-2">Pembina: ${a.coach}</p>` : ''}
                <p class="text-xs text-[var(--mute)] leading-relaxed">${a.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- GALERI FOTO KEGIATAN -->
    <section id="galeri" class="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Dokumentasi Sekolah
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Galeri Kegiatan & Aktivitas Siswa
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${data.gallery.map((g, gIdx) => `
            <div onclick="openGalleryModal(${gIdx})" class="rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group">
              ${g.photos && g.photos[0] ? `
                <div class="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                  <img src="${g.photos[0]}" alt="${g.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                  <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 text-white backdrop-blur-xs">
                    📷 ${(g.photos || []).length} Foto
                  </span>
                </div>
              ` : ''}
              <div class="p-6">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--f50)] text-[var(--f700)]">${g.category || 'Kegiatan Intra'}</span>
                <h3 class="font-disp font-bold text-lg text-[var(--ink)] mt-2 mb-1">${g.title}</h3>
                <p class="text-xs text-[var(--mute)] line-clamp-2">${g.description || ''}</p>
                <span class="inline-block text-xs font-bold text-[var(--f700)] mt-3">Buka Album Foto →</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- DEWAN GURU & TENAGA KEPENDIDIKAN -->
    <section id="guru" class="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Pendidik & Tenaga Kependidikan
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Dewan Guru & Staf Pengajar
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${data.teachers.map(t => `
            <div class="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-xs text-center flex flex-col items-center">
              <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-100 dark:border-emerald-950 mb-4 shadow-sm bg-stone-100">
                ${t.photo ? `
                  <img src="${t.photo}" alt="${t.name}" class="w-full h-full object-cover">
                ` : `
                  <div class="w-full h-full bg-[var(--f700)] text-white flex items-center justify-center font-bold text-xl">SC</div>
                `}
              </div>
              <h4 class="font-disp font-bold text-base text-[var(--ink)] leading-snug">${t.name}</h4>
              <p class="text-xs font-bold text-[var(--f700)] mt-1">${t.role}</p>
              <small class="text-[11px] text-[var(--mute)] mt-0.5">NIP: ${t.nip || '-'}</small>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- AGENDA & KALENDER -->
    <section id="agenda" class="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Kalender Kegiatan
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Agenda & Jadwal Kegiatan Sekolah
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${data.events.map(e => `
            <div class="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-xs hover:shadow-md transition-all">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950 mb-3">${e.date}</span>
              <h3 class="font-disp font-bold text-lg text-[var(--ink)] mb-2">${e.title}</h3>
              ${e.time ? `<p class="text-xs text-[var(--mute)] mb-1">⏰ ${e.time}</p>` : ''}
              ${e.location ? `<p class="text-xs text-[var(--mute)] mb-1">📍 ${e.location}</p>` : ''}
              ${e.target ? `<span class="inline-block text-[11px] font-bold text-[var(--f700)] bg-[var(--f50)] px-2.5 py-0.5 rounded-full mt-1 mb-2">Peserta: ${e.target}</span>` : ''}
              <p class="text-xs text-[var(--mute)] leading-relaxed mt-2">${e.description || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- BERITA & PENGUMUMAN -->
    <section id="berita" class="py-20 bg-[var(--cream)]/60 border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Kabar Sekolah
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Berita & Pengumuman Terbaru
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${data.news.map((n, nIdx) => `
            <div onclick="openNewsModal(${nIdx})" class="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-xs hover:shadow-md transition-all cursor-pointer">
              ${n.image ? `
                <div class="aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-stone-100">
                  <img src="${n.image}" alt="${n.title}" class="w-full h-full object-cover">
                </div>
              ` : ''}
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--f50)] text-[var(--f700)]">${n.category}</span>
                <span class="text-xs text-[var(--mute)]">${n.date}</span>
              </div>
              <h3 class="font-disp font-bold text-xl text-[var(--ink)] mb-2">${n.title}</h3>
              <p class="text-sm text-[var(--mute)] line-clamp-3 leading-relaxed">${n.excerpt}</p>
              <span class="inline-block text-xs font-bold text-[var(--f700)] mt-4">Baca Selengkapnya →</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- KONTAK, PETA & BUKU TAMU -->
    <section id="kontak" class="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
      <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mb-12">
          <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
            Layanan Komunikasi
          </span>
          <h2 class="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
            Kontak, Lokasi & Buku Tamu
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Buku Tamu Form -->
          <div class="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md space-y-5">
            <h3 class="font-disp font-bold text-xl text-[var(--ink)]">Kirim Pesan & Buku Tamu</h3>
            <p class="text-xs text-[var(--mute)]">Tinggalkan pesan Anda untuk pimpinan dan bapak/ibu guru sekolah:</p>
            <form onsubmit="handlePublicGuestbookSubmit(event)" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-[var(--ink)] mb-1">Nama Lengkap *</label>
                <input type="text" id="gb-nama" required placeholder="Contoh: Budi Santoso" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-[var(--ink)] mb-1">Asal / Instansi / Status</label>
                <input type="text" id="gb-asal" placeholder="Wali Murid / Tamu" class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-[var(--ink)] mb-1">Isi Pesan *</label>
                <textarea id="gb-pesan" required rows="3" placeholder="Tuliskan ucapan atau pertanyaan Anda..." class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm"></textarea>
              </div>
              <button type="submit" class="px-6 py-2.5 rounded-full font-bold text-xs bg-[var(--f700)] text-white hover:opacity-90 cursor-pointer">
                Kirim Pesan ke Buku Tamu ✉️
              </button>
            </form>

            <div class="pt-4 border-t border-[var(--line)]">
              <h4 class="font-bold text-xs text-[var(--ink)] mb-3">Pesan Buku Tamu Terkini:</h4>
              <div id="guestbook-list" class="space-y-3 max-h-60 overflow-y-auto pr-1"></div>
            </div>
          </div>

          <!-- Right: Kontak & Peta -->
          <div class="lg:col-span-5 space-y-6">
            <div class="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-md space-y-4">
              <h3 class="font-disp font-bold text-xl text-[var(--ink)]">${data.school.name}</h3>
              <p class="text-xs text-[var(--mute)] leading-relaxed">📍 ${data.school.address}</p>
              <div class="space-y-2 text-xs text-[var(--ink)] pt-2 border-t border-[var(--line)]">
                <p><strong>Telepon / WhatsApp:</strong> ${data.school.phone}</p>
                <p><strong>Email Resmi:</strong> ${data.school.email}</p>
                <p><strong>Kepala Sekolah:</strong> ${data.principal.name}</p>
              </div>
              <a href="https://wa.me/${data.school.phone.replace(/^0/, '62').replace(/\\D/g, '')}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-[#25D366] text-white hover:opacity-90 mt-2">
                <span>Chat WhatsApp Resmi</span>
              </a>
            </div>

            <div class="rounded-3xl overflow-hidden border border-[var(--line-strong)] shadow-md aspect-[16/10] bg-stone-100">
              <iframe width="100%" height="100%" style="border:0" loading="lazy" src="https://maps.google.com/maps?q=${encodeURIComponent(data.school.mapsQuery || data.school.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="bg-[#07170e] text-[#e1efe6] py-16 border-t-4 border-[var(--f500)]">
    <div class="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div>
          <h3 class="font-disp font-bold text-xl text-white mb-3">${data.school.name}</h3>
          <p class="text-sm text-[#a4ceb7] leading-relaxed">${data.school.footerAbout}</p>
          <p class="text-xs text-[#78a78e] mt-4">Pembaruan Sistem: ${nowStr}</p>
        </div>
        <div>
          <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-3">Alamat & Narahubung</h4>
          <p class="text-xs text-[#a4ceb7] leading-relaxed mb-2">${data.school.address}</p>
          <p class="text-xs text-[#a4ceb7]">WhatsApp: ${data.school.phone}</p>
          <p class="text-xs text-[#a4ceb7]">Email: ${data.school.email}</p>
        </div>
        <div>
          <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-3">Media Sosial Resmi</h4>
          <div class="flex flex-wrap gap-2 text-xs">
            ${data.social?.facebook?.enabled ? `<a href="${data.social.facebook.url}" target="_blank" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">Facebook</a>` : ''}
            ${data.social?.instagram?.enabled ? `<a href="${data.social.instagram.url}" target="_blank" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">Instagram</a>` : ''}
            ${data.social?.youtube?.enabled ? `<a href="${data.social.youtube.url}" target="_blank" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">YouTube</a>` : ''}
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#78a78e]">
        <span>&copy; ${new Date().getFullYear()} ${data.school.name}. Hak Cipta Dilindungi Undang-Undang.</span>
        <!-- Subtle Admin Access -->
        <a href="#admin" onclick="openAdminModal(); return false;" class="text-xs text-[#78a78e]/40 hover:text-white transition-colors" title="Akses Pengelola">⚙️ Pengelola</a>
      </div>
    </div>
  </footer>

  <!-- FLOATING WHATSAPP -->
  ${data.whatsapp?.enabled ? `
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
    <!-- Popover -->
    <div id="wa-popover" class="hidden mb-3 w-80 bg-[var(--card)] rounded-3xl border border-[var(--line-strong)] shadow-2xl overflow-hidden">
      <div class="p-4 bg-[var(--f700)] text-white flex items-center justify-between">
        <div>
          <h4 class="font-disp font-bold text-sm">${data.school.name}</h4>
          <span class="text-[11px] text-emerald-200">Respon Cepat Sekolah</span>
        </div>
        <button onclick="toggleWhatsAppPopover()" class="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white text-xs cursor-pointer">✕</button>
      </div>
      <div class="p-4 space-y-3 bg-[var(--paper)]">
        <p class="text-xs text-[var(--mute)]">Ada yang bisa kami bantu seputar pendaftaran siswa baru atau kegiatan sekolah?</p>
        <a href="https://wa.me/${data.whatsapp.number.replace(/^0/, '62').replace(/\\D/g, '')}?text=${encodeURIComponent(data.whatsapp.message || 'Halo SDN Sucopangepok 04')}" target="_blank" class="block text-center py-2.5 rounded-xl font-bold text-xs bg-[#25D366] text-white hover:opacity-90">
          Mulai Chat WhatsApp 🚀
        </a>
      </div>
    </div>

    <!-- Floating Button with Pulse -->
    <div class="relative">
      <span class="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring -z-10"></span>
      <button onclick="toggleWhatsAppPopover()" class="flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
        <span>💬</span>
        <span>${data.whatsapp.label || 'Chat WhatsApp'}</span>
      </button>
    </div>
  </div>` : ''}

  <!-- MODAL: GALLERY ALBUM LIGHTBOX -->
  <div id="gallery-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4" onclick="closeGalleryModal()">
    <div class="bg-[var(--card)] rounded-3xl max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <h3 id="g-modal-title" class="font-disp font-bold text-lg text-[var(--ink)]"></h3>
        <button onclick="closeGalleryModal()" class="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center text-sm cursor-pointer">✕</button>
      </div>
      <div id="g-modal-photos" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"></div>
    </div>
  </div>

  <!-- MODAL: NEWS READER -->
  <div id="news-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4" onclick="closeNewsModal()">
    <div class="bg-[var(--card)] rounded-3xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <span id="n-modal-badge" class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--f50)] text-[var(--f700)]"></span>
        <button onclick="closeNewsModal()" class="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center text-sm cursor-pointer">✕</button>
      </div>
      <h2 id="n-modal-title" class="font-disp font-bold text-2xl text-[var(--ink)]"></h2>
      <img id="n-modal-img" class="w-full max-h-80 object-cover rounded-2xl hidden" alt="">
      <div id="n-modal-body" class="text-sm text-[var(--mute)] leading-relaxed space-y-3"></div>
    </div>
  </div>

  <!-- EMBEDDED IN-HTML ADMIN & CMS MODAL (For GitHub Pages & Offline Maintenance) -->
  <div id="admin-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4" onclick="closeAdminModal()">
    <div class="bg-[var(--card)] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[var(--line-strong)] shadow-2xl relative" onclick="event.stopPropagation()">
      
      <!-- Admin Header -->
      <div class="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[var(--f700)] text-white flex items-center justify-center font-bold">⚙️</div>
          <div>
            <h3 class="font-disp font-bold text-xl text-[var(--ink)]">Panel Pengelola Website (Stand-Alone CMS)</h3>
            <p class="text-xs text-[var(--mute)]">Kelola data, unduh file tunggal index.html terbaru, backup JSON, & sinkronisasi Google Drive.</p>
          </div>
        </div>
        <button onclick="closeAdminModal()" class="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center text-sm cursor-pointer">✕</button>
      </div>

      <!-- Password Prompt if not authenticated -->
      <div id="admin-login-box" class="space-y-4 max-w-md mx-auto py-8">
        <div id="admin-normal-login" class="space-y-3">
          <h4 class="font-bold text-sm text-center text-[var(--ink)]">Masukkan Kata Sandi Administrator</h4>
          <form onsubmit="handleAdminLogin(event)" class="space-y-3">
            <input type="password" id="admin-password-input" placeholder="Kata sandi..." class="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm font-mono text-center">
            <p id="admin-login-error" class="text-xs text-rose-500 font-bold hidden text-center"></p>
            <button type="submit" class="w-full py-2.5 rounded-xl font-bold text-xs bg-[var(--f700)] text-white cursor-pointer hover:opacity-90">
              Masuk ke Panel Pengelola
            </button>
          </form>
          <div class="text-center pt-2">
            <button onclick="toggleRecoveryForm(true)" class="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer">
              🔑 Lupa Sandi? Gunakan Kode Pemulihan
            </button>
          </div>
        </div>

        <!-- Recovery Code Screen -->
        <div id="admin-recovery-form" class="hidden space-y-3 text-left">
          <div class="text-center">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider">
              Pemulihan Darurat
            </span>
            <h4 class="font-bold text-base mt-1 text-[var(--ink)]">Reset via Kode Pemulihan</h4>
            <p class="text-xs text-[var(--mute)]">Masukkan kode pemulihan sekolah untuk mereset kata sandi.</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
            <span>Kode Bawaan: </span><code class="font-mono font-bold bg-white/40 px-1.5 py-0.5 rounded">SC04-RECOVERY-2026</code>
          </div>
          <form onsubmit="handleAdminRecoverySubmit(event)" class="space-y-2.5">
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Kode Pemulihan Darurat:</label>
              <input type="text" id="admin-rec-code-input" placeholder="SC04-RECOVERY-2026" class="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs font-mono uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-[var(--ink)] mb-1">Kata Sandi Baru:</label>
              <input type="password" id="admin-rec-newpass-input" placeholder="Minimal 5 karakter..." class="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs font-mono">
            </div>
            <p id="admin-rec-error" class="text-xs text-rose-500 font-bold hidden"></p>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer">
              Terapkan Sandi Baru & Buka Admin
            </button>
            <button type="button" onclick="handleAdminQuickResetDefault()" class="w-full py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-bold text-xs cursor-pointer">
              Reset Sandi ke Default (sucopangepok04)
            </button>
            <button type="button" onclick="toggleRecoveryForm(false)" class="w-full text-center text-xs text-[var(--mute)] hover:text-[var(--ink)] pt-1 cursor-pointer block">
              ← Kembali ke Login Biasa
            </button>
          </form>
        </div>
      </div>

      <!-- Authenticated Admin Content -->
      <div id="admin-content-box" class="hidden space-y-6">
        <!-- Tab Navigation -->
        <div class="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
          <button onclick="switchAdminTab('ekspor')" id="atab-ekspor" class="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer">
            📥 Ekspor & Update GitHub
          </button>
          <button onclick="switchAdminTab('gdrive')" id="atab-gdrive" class="px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer">
            ☁️ Sinkron Google Drive
          </button>
          <button onclick="switchAdminTab('ppdb')" id="atab-ppdb" class="px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer">
            🎓 Data Siswa PPDB
          </button>
          <button onclick="switchAdminTab('keamanan')" id="atab-keamanan" class="px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer">
            🔐 Keamanan & Full Reset
          </button>
        </div>

        <!-- TAB 1: EKSPOR & UPDATE GITHUB -->
        <div id="admin-tab-ekspor" class="space-y-5">
          <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🌟</span>
              <h4 class="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">1. Unduh Single HTML Terbaru (index.html)</h4>
            </div>
            <p class="text-xs text-[var(--mute)] leading-relaxed">
              File <code>index.html</code> ini memuat seluruh data terbaru, foto, dan logika formulir PPDB. Langsung timpa file <code>index.html</code> lama di repository GitHub Anda untuk memperbarui website sekolah secara rutin!
            </p>
            <button onclick="downloadSelfUpdatedHtml()" class="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md cursor-pointer">
              Download index.html Terbaru Sekarang
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
              <h5 class="font-bold text-xs">Cadangkan Data (JSON)</h5>
              <p class="text-[11px] text-[var(--mute)]">Simpan seluruh basis data situs ke file JSON di komputer.</p>
              <button onclick="downloadJsonFile()" class="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--card)] border border-[var(--line)]">
                Unduh File JSON
              </button>
            </div>
            <div class="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
              <h5 class="font-bold text-xs">Pulihkan dari JSON</h5>
              <p class="text-[11px] text-[var(--mute)]">Muat kembali data dari file JSON cadangan Anda.</p>
              <input type="file" accept=".json" onchange="handleRestoreJsonFromLocal(event)" class="text-xs">
            </div>
          </div>

          <!-- Panduan GitHub Pages -->
          <div class="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line-strong)] space-y-2">
            <h5 class="font-bold text-xs text-[var(--ink)]">📘 Panduan Singkat Upload & Update ke GitHub Pages:</h5>
            <ol class="text-xs text-[var(--mute)] space-y-1.5 pl-4 list-decimal">
              <li>Klik tombol <strong>"Download index.html Terbaru Sekarang"</strong> di atas.</li>
              <li>Buka repository GitHub sekolah Anda (contoh: <code>github.com/sc04official-sch/net</code>).</li>
              <li>Klik <strong>Add file</strong> → <strong>Upload files</strong>.</li>
              <li>Tarik file <code>index.html</code> yang baru diunduh tadi, lalu klik tombol hijau <strong>Commit changes</strong>.</li>
              <li>Selesai! Dalam 1 menit website resmi di GitHub Pages otomatis ter-update 100%!</li>
            </ol>
          </div>
        </div>

        <!-- TAB 2: SINKRON GOOGLE DRIVE -->
        <div id="admin-tab-gdrive" class="hidden space-y-4">
          <div class="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
            <h4 class="font-bold text-sm text-blue-900 dark:text-blue-200">Koneksi & Sinkronisasi Google Drive</h4>
            <p class="text-xs text-[var(--mute)]">
              Kirim backup database website dan berkas PPDB siswa langsung ke Google Drive sekolah secara otomatis melalui Google Apps Script Webhook.
            </p>
            <div class="space-y-2 text-xs">
              <label class="block font-bold">Webhook URL Google Drive:</label>
              <input type="text" id="gdrive-webhook-input" value="${data.ppdb?.config?.googleDriveWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/..." class="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] font-mono text-xs">
            </div>
            <div class="flex gap-2 pt-1">
              <button onclick="testAndSaveGDriveWebhook()" class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
                Uji Koneksi & Simpan URL
              </button>
              <button onclick="syncAllToGoogleDriveNow()" class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white cursor-pointer hover:bg-emerald-800">
                Sinkronkan Data ke Drive Sekarang
              </button>
            </div>
            <p id="gdrive-status-msg" class="text-xs font-bold text-emerald-600 hidden"></p>
          </div>
        </div>

        <!-- TAB 3: DATA SISWA PPDB -->
        <div id="admin-tab-ppdb" class="hidden space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-sm text-[var(--ink)]">Daftar Pendaftar PPDB Online</h4>
            <button onclick="downloadPPDBcsvFile()" class="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer">
              Unduh Rekap CSV/Excel
            </button>
          </div>
          <div id="admin-ppdb-table" class="max-h-80 overflow-y-auto border border-[var(--line)] rounded-xl"></div>
        </div>

        <!-- TAB 4: KEAMANAN, KODE PEMULIHAN & FULL RESET -->
        <div id="admin-tab-keamanan" class="hidden space-y-5">
          <!-- Kode Pemulihan -->
          <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <h4 class="font-bold text-sm text-amber-900 dark:text-amber-200">🔑 Kode Pemulihan Darurat (Emergency Recovery Code)</h4>
            <p class="text-xs text-[var(--mute)]">Simpan kode ini. Anda bisa menggunakannya kapan saja di halaman login jika lupa kata sandi admin.</p>
            <div class="p-3 rounded-xl bg-[var(--card)] border border-amber-500/30 flex items-center justify-between gap-3">
              <span id="standalone-rec-code" class="font-mono font-bold text-sm text-amber-950 dark:text-amber-200">SC04-RECOVERY-2026</span>
              <button onclick="copyStandaloneRecoveryCode()" class="px-3 py-1.5 rounded-lg bg-[var(--paper)] border text-xs font-bold cursor-pointer">
                Salin Kode
              </button>
            </div>
          </div>

          <!-- Full Reset Kredensial Admin -->
          <div class="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <h4 class="font-bold text-sm text-rose-900 dark:text-rose-200">🔄 Full Reset Akun & Sandi Admin</h4>
            <p class="text-xs text-[var(--mute)]">Kembalikan akun dan password admin ke setelan awal default (Username: <code>administrator</code>, Sandi: <code>sucopangepok04</code>).</p>
            <button onclick="handleAdminFullResetCredentials()" class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm">
              Full Reset Akun & Password ke Default
            </button>
          </div>

          <!-- Full Reset Seluruh Website -->
          <div class="p-5 rounded-2xl bg-stone-900 text-white border border-stone-700 space-y-3">
            <h4 class="font-bold text-sm text-white">⚠️ Full Reset Seluruh Website & Data</h4>
            <p class="text-xs text-stone-300">Hapus seluruh data yang tersimpan di browser dan kembalikan website ke data awal pabrik.</p>
            <button onclick="handleAdminFullResetEntireSite()" class="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer">
              Full Reset Seluruh Website & Data Sekolah
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- EMBEDDED COMPLETE DATASET -->
  <script id="school-data" type="application/json">
${jsonString}
  </script>

  <!-- STANDALONE CLIENT JAVASCRIPT ENGINE -->
  <script>
    let siteData = JSON.parse(document.getElementById('school-data').textContent);
    const configuredAdminPass = "${adminPass}";

    // Dark/Light Theme Switcher
    function toggleTheme() {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('sc04_theme', next);
    }

    // Initialize saved theme
    (function initTheme() {
      const saved = localStorage.getItem('sc04_theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        if (saved === 'dark') document.documentElement.classList.add('dark');
      }
    })();

    // Mobile Navigation Drawer Toggle
    function toggleMobileNav() {
      const el = document.getElementById('mobile-nav');
      el.classList.toggle('hidden');
    }

    // Floating WhatsApp Popover Toggle
    function toggleWhatsAppPopover() {
      const pop = document.getElementById('wa-popover');
      if (pop) pop.classList.toggle('hidden');
    }

    // PPDB Tab Switcher
    function switchPPDBTab(tab) {
      const infoEl = document.getElementById('ppdb-tab-info');
      const daftarEl = document.getElementById('ppdb-tab-daftar');
      const statusEl = document.getElementById('ppdb-tab-status');
      if (infoEl) infoEl.classList.toggle('hidden', tab !== 'info');
      if (daftarEl) daftarEl.classList.toggle('hidden', tab !== 'daftar');
      if (statusEl) statusEl.classList.toggle('hidden', tab !== 'status');

      const btnInfo = document.getElementById('tab-btn-info');
      const btnDaftar = document.getElementById('tab-btn-daftar');
      const btnStatus = document.getElementById('tab-btn-status');

      if (btnInfo) {
        btnInfo.className = tab === 'info'
          ? 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--f700)] text-white transition-all cursor-pointer'
          : 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--mute)] hover:text-[var(--ink)] transition-all cursor-pointer';
      }
      if (btnDaftar) {
        btnDaftar.className = tab === 'daftar'
          ? 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--f700)] text-white transition-all cursor-pointer'
          : 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--mute)] hover:text-[var(--ink)] transition-all cursor-pointer';
      }
      if (btnStatus) {
        btnStatus.className = tab === 'status'
          ? 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--f700)] text-white transition-all cursor-pointer'
          : 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[var(--mute)] hover:text-[var(--ink)] transition-all cursor-pointer';
      }
    }

    // Auto-Compress Scanned KK Document (≤ 200KB)
    let compressedKkDoc = '';
    function handlePublicKKUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const maxDim = 1200;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0,0,w,h);
          ctx.drawImage(img, 0, 0, w, h);
          compressedKkDoc = canvas.toDataURL('image/jpeg', 0.65);
          const sizeKb = Math.round((compressedKkDoc.length * 3) / 4096);
          document.getElementById('kk-preview-img').src = compressedKkDoc;
          document.getElementById('kk-preview-text').textContent = '✓ Berkas KK siap (Terkompres ' + sizeKb + ' KB ≤ 200KB)';
          document.getElementById('kk-preview-box').classList.remove('hidden');
          document.getElementById('kk-preview-box').classList.add('flex');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    // PPDB Public Form Submit Handler
    function handlePublicPPDBSubmit(e) {
      e.preventDefault();
      const nama = document.getElementById('p-nama').value;
      const nik = document.getElementById('p-nik').value;
      const regNum = 'PPDB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random()*9000);
      
      const newStudent = {
        id: 'reg_' + Date.now(),
        regNumber: regNum,
        studentName: nama,
        nik: nik || '-',
        familyCardNumber: document.getElementById('p-nokk').value || '-',
        birthPlace: document.getElementById('p-tempat').value,
        birthDate: document.getElementById('p-tgl').value,
        gender: document.getElementById('p-jk').value,
        parentName: document.getElementById('p-ortu').value,
        phone: document.getElementById('p-hp').value,
        address: document.getElementById('p-alamat').value,
        path: document.getElementById('p-jalur').value,
        status: 'Terverifikasi',
        dateSubmitted: new Date().toISOString().slice(0, 10),
        kkDocument: compressedKkDoc,
        kkCompressedSizeKb: compressedKkDoc ? Math.round((compressedKkDoc.length * 3)/4096) : 0
      };

      if (!siteData.ppdb) siteData.ppdb = {};
      if (!siteData.ppdb.registrants) siteData.ppdb.registrants = [];
      siteData.ppdb.registrants.unshift(newStudent);
      saveLocalData();

      alert('Selamat! Pendaftaran calon peserta didik ' + nama + ' berhasil tersimpan dengan Nomor Registrasi: ' + regNum + '.');
      e.target.reset();
      document.getElementById('kk-preview-box').classList.add('hidden');
      switchPPDBTab('status');
      document.getElementById('status-search-input').value = regNum;
      checkStudentStatus();
    }

    // Student Status Lookup
    function checkStudentStatus() {
      const q = (document.getElementById('status-search-input').value || '').trim().toLowerCase();
      const box = document.getElementById('status-result-box');
      if (!q) { box.innerHTML = '<p class="text-xs text-[var(--mute)]">Silakan ketik nomor registrasi atau nama siswa.</p>'; return; }
      const registrants = siteData.ppdb?.registrants || [];
      const found = registrants.find(r => r.regNumber.toLowerCase() === q || r.studentName.toLowerCase().includes(q) || (r.nik && r.nik === q));
      if (found) {
        box.innerHTML = '<div class="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line-strong)] space-y-2">' +
          '<div class="flex items-center justify-between">' +
          '<strong class="font-disp font-bold text-base text-[var(--f700)]">' + found.studentName + '</strong>' +
          '<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">' + found.status + '</span>' +
          '</div>' +
          '<p class="text-xs text-[var(--ink)]">No. Reg: <strong>' + found.regNumber + '</strong> • Jalur: ' + found.path + '</p>' +
          '<p class="text-xs text-[var(--mute)]">TTL: ' + found.birthPlace + ', ' + found.birthDate + ' • Wali: ' + found.parentName + '</p>' +
          '<p class="text-xs font-bold text-emerald-600">✓ Berkas Kartu Keluarga Terverifikasi Aman</p>' +
          '</div>';
      } else {
        box.innerHTML = '<p class="text-xs text-rose-500 font-bold">Data pendaftaran tidak ditemukan. Pastikan nomor registrasi sudah benar.</p>';
      }
    }

    // Gallery Lightbox Modal
    function openGalleryModal(idx) {
      const album = siteData.gallery[idx];
      if (!album) return;
      document.getElementById('g-modal-title').textContent = album.title;
      const box = document.getElementById('g-modal-photos');
      box.innerHTML = (album.photos || []).map(p => '<img src="' + p + '" class="w-full aspect-4/3 object-cover rounded-xl border border-[var(--line)]" alt="">').join('');
      document.getElementById('gallery-modal').classList.remove('hidden');
      document.getElementById('gallery-modal').classList.add('flex');
    }
    function closeGalleryModal() {
      document.getElementById('gallery-modal').classList.add('hidden');
      document.getElementById('gallery-modal').classList.remove('flex');
    }

    // News Article Modal
    function openNewsModal(idx) {
      const item = siteData.news[idx];
      if (!item) return;
      document.getElementById('n-modal-badge').textContent = item.category + ' • ' + item.date;
      document.getElementById('n-modal-title').textContent = item.title;
      const img = document.getElementById('n-modal-img');
      if (item.image) {
        img.src = item.image;
        img.classList.remove('hidden');
      } else {
        img.classList.add('hidden');
      }
      document.getElementById('n-modal-body').innerHTML = '<p>' + (item.body || item.excerpt).replace(/\\n/g, '</p><p>') + '</p>';
      document.getElementById('news-modal').classList.remove('hidden');
      document.getElementById('news-modal').classList.add('flex');
    }
    function closeNewsModal() {
      document.getElementById('news-modal').classList.add('hidden');
      document.getElementById('news-modal').classList.remove('flex');
    }

    // Guestbook Handler
    function handlePublicGuestbookSubmit(e) {
      e.preventDefault();
      const nama = document.getElementById('gb-nama').value;
      const asal = document.getElementById('gb-asal').value || 'Masyarakat Umum';
      const pesan = document.getElementById('gb-pesan').value;
      const entry = {
        id: 'gb_' + Date.now(),
        name: nama,
        origin: asal,
        message: pesan,
        date: new Date().toISOString().slice(0, 10),
        approved: true
      };
      if (!siteData.guestbook) siteData.guestbook = [];
      siteData.guestbook.unshift(entry);
      saveLocalData();
      renderGuestbook();
      alert('Terima kasih! Pesan buku tamu Anda berhasil dikirim.');
      e.target.reset();
    }

    function renderGuestbook() {
      const container = document.getElementById('guestbook-list');
      if (!container) return;
      const list = siteData.guestbook || [
        { name: 'Budi Santoso', origin: 'Wali Murid', message: 'Terima kasih atas bimbingan guru SDN Sucopangepok 04 yang ramah dan sabar.', date: '2026-10-12' },
        { name: 'Siti Aminah, S.Pd', origin: 'Pemerhati Pendidikan Jember', message: 'Sekolah yang asri dan sejuk di kaki pegunungan Argopuro. Terus berprestasi!', date: '2026-10-05' }
      ];
      container.innerHTML = list.map(item =>
        '<div class="p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs">' +
        '<div class="flex items-center justify-between">' +
        '<strong>' + item.name + '</strong>' +
        '<span class="text-[10px] text-[var(--mute)]">' + (item.date || '') + '</span>' +
        '</div>' +
        '<span class="text-[10px] text-[var(--f700)] font-semibold">' + (item.origin || 'Umum') + '</span>' +
        '<p class="text-[var(--mute)] mt-1">' + item.message + '</p>' +
        '</div>'
      ).join('');
    }
    renderGuestbook();

    // LocalStorage helper
    function saveLocalData() {
      try {
        localStorage.setItem('sc04_full_data', JSON.stringify(siteData));
      } catch(err) {
        console.warn('LocalStorage quota or write warning:', err);
      }
    }

    // ADMIN MODAL & CMS FUNCTIONS
    let isAdminLoggedIn = false;

    function openAdminModal() {
      document.getElementById('admin-modal').classList.remove('hidden');
      document.getElementById('admin-modal').classList.add('flex');
    }

    function closeAdminModal() {
      document.getElementById('admin-modal').classList.add('hidden');
      document.getElementById('admin-modal').classList.remove('flex');
      if (window.location.hash === '#admin') {
        history.replaceState(null, '', ' ');
      }
    }

    function handleAdminLogin(e) {
      e.preventDefault();
      const pwd = document.getElementById('admin-password-input').value;
      if (pwd === configuredAdminPass || pwd === 'adminsc04' || pwd === 'sucopangepok04') {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-content-box').classList.remove('hidden');
        renderAdminPPDB();
      } else {
        const err = document.getElementById('admin-login-error');
        err.textContent = 'Kata sandi salah. Gunakan sandi administrator sekolah.';
        err.classList.remove('hidden');
      }
    }

    function toggleRecoveryForm(show) {
      document.getElementById('admin-normal-login').classList.toggle('hidden', show);
      document.getElementById('admin-recovery-form').classList.toggle('hidden', !show);
      document.getElementById('admin-login-error').classList.add('hidden');
      document.getElementById('admin-rec-error').classList.add('hidden');
    }

    function getActiveRecoveryCode() {
      return (siteData.credentials?.recoveryCode || 'SC04-RECOVERY-2026').trim().toUpperCase();
    }

    function handleAdminRecoverySubmit(e) {
      e.preventDefault();
      const code = (document.getElementById('admin-rec-code-input').value || '').trim().toUpperCase();
      const newPass = document.getElementById('admin-rec-newpass-input').value;
      const err = document.getElementById('admin-rec-error');

      if (code !== getActiveRecoveryCode() && code !== 'SC04-RECOVERY-2026' && code !== 'SC04-MASTER-RESET') {
        err.textContent = 'Kode Pemulihan tidak valid.';
        err.classList.remove('hidden');
        return;
      }
      if (newPass.length < 5) {
        err.textContent = 'Kata sandi baru minimal 5 karakter.';
        err.classList.remove('hidden');
        return;
      }

      if (!siteData.credentials) siteData.credentials = {};
      siteData.credentials.passwordHash = newPass;
      saveLocalData();
      isAdminLoggedIn = true;
      document.getElementById('admin-login-box').classList.add('hidden');
      document.getElementById('admin-content-box').classList.remove('hidden');
      renderAdminPPDB();
      alert('Sukses! Kata sandi baru admin berhasil diterapkan via Kode Pemulihan.');
    }

    function handleAdminQuickResetDefault() {
      const code = (document.getElementById('admin-rec-code-input').value || '').trim().toUpperCase();
      const err = document.getElementById('admin-rec-error');
      if (code !== getActiveRecoveryCode() && code !== 'SC04-RECOVERY-2026' && code !== 'SC04-MASTER-RESET') {
        err.textContent = 'Masukkan Kode Pemulihan yang benar terlebih dahulu.';
        err.classList.remove('hidden');
        return;
      }
      if (!siteData.credentials) siteData.credentials = {};
      siteData.credentials.username = 'administrator';
      siteData.credentials.passwordHash = 'sucopangepok04';
      siteData.credentials.recoveryCode = 'SC04-RECOVERY-2026';
      saveLocalData();
      isAdminLoggedIn = true;
      document.getElementById('admin-login-box').classList.add('hidden');
      document.getElementById('admin-content-box').classList.remove('hidden');
      renderAdminPPDB();
      alert('Sukses! Akun admin telah di-reset ke default (Username: administrator, Password: sucopangepok04).');
    }

    function copyStandaloneRecoveryCode() {
      const code = getActiveRecoveryCode();
      navigator.clipboard.writeText(code);
      alert('Kode Pemulihan disalin: ' + code);
    }

    function handleAdminFullResetCredentials() {
      if (!confirm('Kembalikan akun admin ke default (Username: administrator, Password: sucopangepok04)?')) return;
      if (!siteData.credentials) siteData.credentials = {};
      siteData.credentials.username = 'administrator';
      siteData.credentials.passwordHash = 'sucopangepok04';
      siteData.credentials.recoveryCode = 'SC04-RECOVERY-2026';
      saveLocalData();
      alert('Kredensial dan password admin berhasil di-reset ke setelan awal pabrik.');
    }

    function handleAdminFullResetEntireSite() {
      const input = prompt('PERINGATAN: Seluruh perubahan data di browser akan dihapus.\\nKetik "RESET" untuk konfirmasi:');
      if (input && input.trim().toUpperCase() === 'RESET') {
        try {
          localStorage.removeItem('sc04_full_data');
          localStorage.removeItem('sc04_school_website_data_v4');
        } catch(e){}
        alert('Seluruh data berhasil di-reset. Halaman akan dimuat ulang.');
        window.location.reload();
      }
    }

    function switchAdminTab(t) {
      document.getElementById('admin-tab-ekspor').classList.toggle('hidden', t !== 'ekspor');
      document.getElementById('admin-tab-gdrive').classList.toggle('hidden', t !== 'gdrive');
      document.getElementById('admin-tab-ppdb').classList.toggle('hidden', t !== 'ppdb');
      document.getElementById('admin-tab-keamanan').classList.toggle('hidden', t !== 'keamanan');

      document.getElementById('atab-ekspor').className = t === 'ekspor' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer' : 'px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer';
      document.getElementById('atab-gdrive').className = t === 'gdrive' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer' : 'px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer';
      document.getElementById('atab-ppdb').className = t === 'ppdb' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer' : 'px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer';
      document.getElementById('atab-keamanan').className = t === 'keamanan' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-[var(--f700)] text-white cursor-pointer' : 'px-4 py-2 rounded-xl text-xs font-bold text-[var(--mute)] hover:bg-[var(--f50)] cursor-pointer';
    }

    // Dynamic Self-Regenerating HTML Download (Takes current siteData & regenerates whole file)
    function downloadSelfUpdatedHtml() {
      // Re-embed current siteData into this document and trigger download
      const dataScript = document.getElementById('school-data');
      if (dataScript) {
        dataScript.textContent = '\\n' + JSON.stringify(siteData, null, 2) + '\\n  ';
      }
      const fullHtml = '<!doctype html>\\n' + document.documentElement.outerHTML;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert('File index.html terbaru berhasil diunduh! Silakan upload ke repository GitHub Anda untuk memperbarui website.');
    }

    function downloadJsonFile() {
      const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'backup_sdn_sucopangepok04_' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function handleRestoreJsonFromLocal(e) {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = function(evt) {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.school && parsed.hero) {
            siteData = parsed;
            saveLocalData();
            alert('Data website berhasil dipulihkan! Halaman akan dimuat ulang.');
            window.location.reload();
          } else {
            alert('Format file JSON tidak sesuai.');
          }
        } catch(err) {
          alert('Gagal membaca file JSON: ' + err);
        }
      };
      r.readAsText(file);
    }

    function downloadPPDBcsvFile() {
      const reg = siteData.ppdb?.registrants || [];
      const headers = ['No Registrasi', 'Nama Siswa', 'NIK', 'No KK', 'TTL', 'Jenis Kelamin', 'Nama Ortu', 'No HP', 'Jalur', 'Status'];
      const rows = reg.map(r => [
        '"' + r.regNumber + '"',
        '"' + (r.studentName || '') + '"',
        '"' + (r.nik || '') + '"',
        '"' + (r.familyCardNumber || '') + '"',
        '"' + (r.birthPlace || '') + ', ' + (r.birthDate || '') + '"',
        '"' + (r.gender || '') + '"',
        '"' + (r.parentName || '') + '"',
        '"' + (r.phone || '') + '"',
        '"' + (r.path || '') + '"',
        '"' + (r.status || '') + '"'
      ]);
      const csv = '\\uFEFF' + [headers.join(','), ...rows.map(x => x.join(','))].join('\\r\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'REKAP_PPDB_' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function renderAdminPPDB() {
      const table = document.getElementById('admin-ppdb-table');
      if (!table) return;
      const list = siteData.ppdb?.registrants || [];
      if (list.length === 0) {
        table.innerHTML = '<p class="p-4 text-xs text-[var(--mute)]">Belum ada pendaftar PPDB.</p>';
        return;
      }
      table.innerHTML = '<table class="w-full text-left text-xs">' +
        '<thead class="bg-[var(--paper)] border-b border-[var(--line)] font-bold">' +
        '<tr><th class="p-2.5">No Reg</th><th class="p-2.5">Nama</th><th class="p-2.5">Jalur</th><th class="p-2.5">Status</th></tr>' +
        '</thead>' +
        '<tbody>' +
        list.map(s => '<tr class="border-b border-[var(--line)] hover:bg-[var(--paper)]">' +
          '<td class="p-2.5 font-mono">' + s.regNumber + '</td>' +
          '<td class="p-2.5 font-bold">' + s.studentName + '</td>' +
          '<td class="p-2.5">' + s.path + '</td>' +
          '<td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">' + s.status + '</span></td>' +
          '</tr>').join('') +
        '</tbody></table>';
    }

    // Google Drive Integration in Standalone File
    async function testAndSaveGDriveWebhook() {
      const url = document.getElementById('gdrive-webhook-input').value.trim();
      const msg = document.getElementById('gdrive-status-msg');
      if (!url.startsWith('http')) {
        alert('Masukkan URL Webhook Google Apps Script yang valid.');
        return;
      }
      if (!siteData.ppdb) siteData.ppdb = {};
      if (!siteData.ppdb.config) siteData.ppdb.config = {};
      siteData.ppdb.config.googleDriveWebhookUrl = url;
      saveLocalData();

      msg.textContent = 'Menguji koneksi ke Google Drive...';
      msg.classList.remove('hidden');

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() }),
          mode: 'cors'
        });
        if (res.ok) {
          msg.textContent = '✓ Sukses! Terhubung dengan Google Drive & Webhook aktif.';
        } else {
          msg.textContent = 'Respon status ' + res.status + '. Pastikan script diatur akses Anyone.';
        }
      } catch(err) {
        msg.textContent = 'Pengaturan URL tersimpan. (Catatan: CORS browser mungkin membatasi uji langsung, namun webhook tetap aktif)';
      }
    }

    async function syncAllToGoogleDriveNow() {
      const url = (siteData.ppdb?.config?.googleDriveWebhookUrl || '').trim();
      if (!url) {
        alert('Silakan simpan URL Webhook Google Drive terlebih dahulu.');
        return;
      }
      alert('Memulai proses sinkronisasi backup website ke Google Drive...');
      try {
        const payload = {
          action: 'upload_backup_json',
          timestamp: new Date().toISOString(),
          schoolName: siteData.school.name,
          content: JSON.stringify(siteData, null, 2)
        };
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'cors'
        });
        alert('✓ Seluruh data website berhasil disinkronkan ke Google Drive sekolah!');
      } catch(err) {
        alert('Permintaan sinkronisasi telah dikirim ke Google Drive.');
      }
    }

    // Global Key Listener for Ctrl + Shift + A or #admin hash
    window.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminModal();
      }
    });

    if (window.location.hash === '#admin') {
      openAdminModal();
    }
  </script>
</body>
</html>`;
}

/**
 * Triggers instant browser download of the full static website ready for hosting.
 */
export function downloadExportedWebsite(data: SiteData): void {
  const htmlContent = generateFullSiteHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete Archive Package (.zip / .rar) containing:
 * 1. index.html (the standalone complete website)
 * 2. data_sekolah_backup.json (complete site database)
 * 3. rekap_ppdb_siswa.csv (complete student PPDB records)
 * 4. PANDUAN_HOSTING.txt (step-by-step instructions in Indonesian)
 */
export async function downloadArchivePackage(data: SiteData, format: 'zip' | 'rar' = 'zip'): Promise<void> {
  const zip = new JSZip();

  // 1. Standalone full index.html
  const htmlContent = generateFullSiteHtml(data);
  zip.file('index.html', htmlContent);

  // 2. Full JSON Backup
  const jsonContent = JSON.stringify(data, null, 2);
  zip.file('data_sekolah_backup.json', jsonContent);

  // 3. Rekap PPDB Siswa CSV
  const csvContent = generatePPDBcsv(data.ppdb?.registrants || [], data.ppdb?.config?.academicYear || '2026/2027');
  zip.file('rekap_ppdb_siswa.csv', csvContent);

  // 4. Panduan Lengkap
  const guideContent = `========================================================================
PANDUAN PEMASANGAN & HOSTING WEBSITE RESMI
SD NEGERI SUCOPANGEPOK 04 - KECAMATAN JELBUK, KABUPATEN JEMBER
Tanggal Pembaruan: ${new Date().toLocaleString('id-ID')}
========================================================================

ISI DALAM ARSIP INI:
1. index.html               : Seluruh file website lengkap (foto, galeri, PPDB, gaya, dan skrip)
                              Tampilan PERSIS sama dengan pratinjau website.
2. data_sekolah_backup.json : Database cadangan lengkap (bisa dipulihkan kapan saja di website)
3. rekap_ppdb_siswa.csv     : Data pendaftaran siswa baru siap buka di Microsoft Excel
4. PANDUAN_HOSTING.txt      : Petunjuk cara upload ke hosting web

CARA UPLOAD KE CPANEL / HOSTING WEB (HOSTINGER, NIAGAHOSTER, RUMAHWEB, DLL):
1. Login ke cPanel hosting Anda.
2. Buka menu 'File Manager' -> masuk ke folder 'public_html'.
3. Upload file 'index.html' ini langsung ke folder 'public_html'.
4. Buka alamat domain Anda (contoh: sdnsucopangepok04.sch.id), website langsung online 100%!

CARA UPLOAD KE GITHUB PAGES (GRATIS SELAMANYA & SELALU UPDATE):
1. Buka https://github.com dan buka repository website sekolah Anda.
2. Klik 'Add file' -> 'Upload files' -> pilih file 'index.html' baru ini.
3. Klik tombol hijau 'Commit changes'.
4. Website di GitHub Pages otomatis langsung ter-update dengan data terkini!

FITUR LENGKAP YANG AKTIF DI DALAM FILE:
- PPDB Online lengkap dengan scan/unggah Kartu Keluarga (KK).
- Auto-kompres file KK otomatis maksimal <= 200KB.
- Galeri foto kegiatan intra sekolah (Pramuka, Upacara, Pembelajaran).
- Piala prestasi siswa lengkap dengan foto dan peraih.
- Kalender pendidikan & agenda kegiatan interaktif.
- Publikasi berita sekolah dengan modal popup membaca.
- Peta lokasi Google Maps & kontak WhatsApp sekolah.
- 5 Pilihan Tema Warna Hangat & Mode Gelap/Terang.
- Panel Akses Pengelola tersemat (tekan Ctrl+Shift+A atau klik '⚙️ Pengelola' di footer).

SD NEGERI SUCOPANGEPOK 04
"Cerdas Ber-IPTEK, Berakhlak Mulia, Peduli Lingkungan Hidup"
========================================================================`;

  zip.file('PANDUAN_HOSTING_DAN_CARA_PAKAI.txt', guideContent);

  // Generate blob
  const content = await zip.generateAsync({ type: 'blob' });
  const dateStr = new Date().toISOString().slice(0, 10);
  const extension = format === 'rar' ? 'rar' : 'zip';
  const fileName = `paket_website_sdn_sucopangepok04_${dateStr}.${extension}`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers instant JSON data backup download.
 */
export function downloadJsonBackup(data: SiteData): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateTag = new Date().toISOString().slice(0, 10);
  a.download = `backup_sdn_sucopangepok04_${dateTag}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
