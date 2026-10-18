import rawData from './schoolData.json';
import { SiteData, PPDBConfig, PPDBItem, ActivityLogItem } from '../types';

export const defaultPPDBConfig: PPDBConfig = {
  enabled: true,
  academicYear: '2026/2027',
  title: 'Penerimaan Peserta Didik Baru (PPDB) Online',
  subtitle: 'Mari bergabung bersama Keluarga Besar SD Negeri Sucopangepok 04 Jember. Membentuk generasi berakhlak mulia, cerdas, dan cinta alam.',
  openDate: '2026-05-01',
  closeDate: '2026-07-15',
  quota: 28,
  contactPerson: '085236111999 (Bpk. Arif Harimardi / Panitia PPDB)',
  requirements: [
    'Berusia minimal 6 tahun pada tanggal 1 Juli tahun berjalan.',
    'Memiliki Akta Kelahiran atau Surat Keterangan Lahir resmi.',
    'Kartu Keluarga (KK) orang tua / wali (Scan/Foto otomatis dikompres <= 200KB).',
    'Ijazah / Surat Keterangan Lulus TK/RA/PAUD (jika ada).',
    'Pas foto calon peserta didik ukuran 3x4 berwarna.'
  ],
  announcement: 'Pendaftaran Tahun Ajaran Baru telah dibuka. Silakan mengisi formulir di bawah ini atau menghubungi panitia PPDB sekolah.',
  googleDriveFolderUrl: 'https://drive.google.com/drive/folders/1SDN_Sucopangepok04_PPDB2026',
  googleDriveWebhookUrl: '',
  autoSyncDrive: true,
  maxLocalFileSizeKb: 200,
  saveMode: 'both'
};

export const defaultRegistrants: PPDBItem[] = [
  {
    id: 'reg_101',
    regNumber: 'PPDB-2026-001',
    studentName: 'Ahmad Raihan Pratama',
    nik: '3509121204190001',
    familyCardNumber: '3509122008120005',
    nisn: '3194567891',
    birthPlace: 'Jember',
    birthDate: '2019-04-12',
    gender: 'Laki-laki',
    parentName: 'Hariyanto',
    parentJob: 'Petani / Wiraswasta',
    phone: '085234567890',
    address: 'Dusun Lengkong RT 02 RW 01, Desa Sucopangepok, Kec. Jelbuk',
    originSchool: 'TK Dharma Wanita Sucopangepok',
    path: 'Zonasi',
    status: 'Terverifikasi',
    dateSubmitted: '2026-05-05',
    kkFileName: 'KK_Ahmad_Raihan.jpg',
    kkOriginalSizeKb: 2840,
    kkCompressedSizeKb: 165,
    storageMode: 'keduanya',
    driveSyncStatus: 'Tersimpan di Drive',
    driveFileUrl: 'https://drive.google.com/drive/folders/1SDN_Sucopangepok04_PPDB2026'
  }
];

export const defaultActivityLogs: ActivityLogItem[] = [
  {
    id: 'log_init_1',
    timestamp: '2026-10-18 09:15:00',
    action: 'PUBLISH',
    section: 'Sistem Website',
    description: 'Inisialisasi sistem website resmi dan sinkronisasi modul CMS.',
    author: 'Administrator'
  },
  {
    id: 'log_init_2',
    timestamp: '2026-10-18 10:20:00',
    action: 'TAMBAH',
    section: 'PPDB & Kartu Keluarga',
    description: 'Aktivasi formulir PPDB online dan sistem scan/upload Kartu Keluarga.',
    author: 'Panitia PPDB'
  },
  {
    id: 'log_init_3',
    timestamp: '2026-10-18 11:00:00',
    action: 'UBAH',
    section: 'Profil & Sejarah',
    description: 'Penataan paragraf selayang pandang dan dokumentasi video sekolah.',
    author: 'Kepala Sekolah'
  }
];

export const fallbackData: SiteData = {
  ...(rawData as SiteData),
  school: {
    ...(rawData as SiteData).school,
    headerNotice: 'Pendaftaran Siswa Baru (PPDB) Tahun Ajaran 2026/2027 Resmi Dibuka! Klik PPDB untuk mendaftar.',
    headerTagline: 'Sekolah Kaki Langit Religius, Ber-IPTEK & Peduli Lingkungan',
    showCtaButton: true,
    ctaButtonText: 'Daftar PPDB Online',
    ctaButtonLink: 'ppdb',
    academicYear: '2026/2027',
    semester: 'Semester Ganjil'
  },
  welcome: {
    ...(rawData as SiteData).welcome,
    paragraphAlignment: 'justify',
    paragraphSpacing: 'relaxed'
  },
  profile: {
    ...(rawData as SiteData).profile,
    videoTitle: 'Profil Resmi SDN Sucopangepok 04',
    videoDescription: 'Keindahan alam pegunungan menyatu dengan semangat belajar anak-anak Sucopangepok.',
    videoEnabled: true,
    paragraphAlignment: 'justify',
    paragraphSpacing: 'relaxed'
  },
  ppdb: {
    config: defaultPPDBConfig,
    registrants: defaultRegistrants
  },
  adsense: {
    enabled: false,
    clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
    slotHeader: '',
    slotFooter: '',
    slotInFeed: ''
  },
  appearance: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 'md',
    colorPalette: 'emerald'
  },
  credentials: {
    username: 'administrator',
    passwordHash: 'sucopangepok04',
    email: 'sdnsucopangepok04jember@gmail.com',
    lastUpdated: '2026-10-18',
    recoveryCode: 'SC04-RECOVERY-2026'
  },
  activityLogs: defaultActivityLogs
};

const STORAGE_KEY = 'sc04_school_website_data_v4';

export function getStoredData(): SiteData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.school && parsed.hero && parsed.principal) {
        return {
          ...fallbackData,
          ...parsed,
          school: { ...fallbackData.school, ...parsed.school },
          hero: { ...fallbackData.hero, ...parsed.hero },
          principal: { ...fallbackData.principal, ...parsed.principal },
          welcome: { ...fallbackData.welcome, ...parsed.welcome },
          profile: { ...fallbackData.profile, ...parsed.profile },
          social: { ...fallbackData.social, ...parsed.social },
          whatsapp: { ...fallbackData.whatsapp, ...parsed.whatsapp },
          facilities: parsed.facilities?.length ? parsed.facilities : fallbackData.facilities,
          teachers: parsed.teachers?.length ? parsed.teachers : fallbackData.teachers,
          principalsHistory: parsed.principalsHistory?.length ? parsed.principalsHistory : fallbackData.principalsHistory,
          hallOfFame: parsed.hallOfFame?.length ? parsed.hallOfFame : fallbackData.hallOfFame,
          gallery: parsed.gallery?.length ? parsed.gallery : fallbackData.gallery,
          achievements: parsed.achievements?.length ? parsed.achievements : fallbackData.achievements,
          events: parsed.events?.length ? parsed.events : fallbackData.events,
          news: parsed.news?.length ? parsed.news : fallbackData.news,
          guestbook: parsed.guestbook || fallbackData.guestbook || [],
          ppdb: {
            config: { ...defaultPPDBConfig, ...(parsed.ppdb?.config || {}) },
            registrants: parsed.ppdb?.registrants || defaultRegistrants
          },
          adsense: { ...fallbackData.adsense, ...(parsed.adsense || {}) },
          appearance: { ...fallbackData.appearance, ...(parsed.appearance || {}) },
          credentials: { ...fallbackData.credentials, ...(parsed.credentials || {}) },
          activityLogs: parsed.activityLogs || defaultActivityLogs
        };
      }
    }
  } catch (e) {
    console.error('Failed to load local storage data', e);
  }
  return fallbackData;
}

export function saveStoredData(data: SiteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

export function resetStoredData(): SiteData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
  return fallbackData;
}
