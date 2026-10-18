export interface StatItem {
  id?: string;
  value: string;
  label: string;
}

export interface SchoolInfo {
  name: string;
  npsn: string;
  accreditation: string;
  status: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  mapsQuery: string;
  footerAbout: string;
  logo: string;
  secondaryLogo?: string;
  qrCode: string;
  qrCaption: string;
  headerTagline?: string;
  headerNotice?: string;
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  academicYear?: string;
  semester?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: 'TAMBAH' | 'UBAH' | 'HAPUS' | 'PUBLISH' | 'PULIHKAN';
  section: string;
  description: string;
  author?: string;
}

export interface HeroData {
  title: string;
  subtitle: string;
  image: string;
  badgeText?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  stats: StatItem[];
}

export interface PrincipalData {
  name: string;
  nip: string;
  period: string;
  photo: string;
  focus: string[];
  title?: string;
}

export interface WelcomeData {
  title: string;
  paragraphs: string[];
  paragraphAlignment?: 'left' | 'justify';
  paragraphSpacing?: 'normal' | 'relaxed';
}

export interface ProfileData {
  title: string;
  intro: string;
  introParagraphs?: string[];
  history: string;
  historyParagraphs?: string[];
  videoUrl: string;
  videoTitle?: string;
  videoDescription?: string;
  videoEnabled?: boolean;
  vision: string;
  missions: string[];
  supportingPhotos?: string[];
  paragraphAlignment?: 'left' | 'justify';
  paragraphSpacing?: 'normal' | 'relaxed' | 'loose';
}

export interface FacilityItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  category?: string;
}

export interface TeacherItem {
  id?: string;
  name: string;
  role: string;
  nip: string;
  photo: string;
}

export interface PrincipalHistoryItem {
  id?: string;
  period: string;
  name: string;
}

export interface HallOfFameItem {
  id?: string;
  year: string;
  name: string;
  title: string;
  description: string;
}

export interface GalleryAlbum {
  id?: string;
  title: string;
  date: string;
  photos: string[];
  captions?: string[];
  description?: string;
  category?: 'Kegiatan Intra' | 'Pramuka' | 'Upacara' | 'Pembelajaran' | 'Outing Class' | 'Umum' | string;
}

export interface AchievementItem {
  id?: string;
  year: string;
  level: string;
  title: string;
  description: string;
  photo?: string;
  photos?: string[];
  category?: 'Intra Sekolah' | 'Akademik' | 'Olahraga' | 'Seni & Budaya' | 'Pramuka' | 'Keagamaan' | string;
  recipient?: string;
  coach?: string;
}

export interface EventItem {
  id?: string;
  date: string;
  title: string;
  type: 'nasional' | 'akademik' | 'keagamaan' | 'libur' | 'intra' | string;
  time?: string;
  location?: string;
  description?: string;
  organizer?: string;
  target?: string;
}

export interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  images?: string[];
  author?: string;
  tags?: string[];
}

export interface SocialLink {
  enabled: boolean;
  url: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  number: string;
  label: string;
  message: string;
}

export interface GuestbookEntry {
  id?: string;
  name: string;
  origin?: string;
  message: string;
  date: string;
  approved?: boolean;
}

export interface PPDBItem {
  id: string;
  regNumber: string;
  studentName: string;
  nik?: string;
  familyCardNumber?: string; // 16 digit nomor KK
  nisn?: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  parentName: string;
  parentJob?: string;
  phone: string;
  address: string;
  originSchool?: string; // Asal TK / PAUD
  path: 'Zonasi' | 'Afirmasi' | 'Perpindahan Tugas Orang Tua' | 'Prestasi' | string;
  notes?: string;
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Diterima' | 'Ditolak';
  dateSubmitted: string;
  // Kartu Keluarga Document Data
  kkDocument?: string; // Base64 data for auto-compressed KK (strictly <= 200KB for system)
  kkOriginalDocument?: string; // Base64 data for full-size KK (for Google Drive)
  kkFileName?: string;
  kkOriginalSizeKb?: number;
  kkCompressedSizeKb?: number;
  storageMode?: 'sistem' | 'google_drive' | 'keduanya';
  driveSyncStatus?: 'Belum Disinkron' | 'Tersimpan di Drive' | 'Gagal Sync';
  driveFileUrl?: string;
}

export interface PPDBConfig {
  enabled: boolean;
  academicYear: string;
  title: string;
  subtitle: string;
  openDate: string;
  closeDate: string;
  quota: number;
  contactPerson: string;
  requirements: string[];
  announcement: string;
  googleDriveFolderUrl?: string;
  googleDriveWebhookUrl?: string;
  autoSyncDrive?: boolean;
  maxLocalFileSizeKb?: number; // default 200KB limit
  saveMode?: 'sistem_only' | 'drive_only' | 'both';
}

export interface AdSenseConfig {
  enabled: boolean;
  clientId: string;
  slotHeader?: string;
  slotFooter?: string;
  slotInFeed?: string;
}

export interface AppearanceSettings {
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Poppins' | 'Roboto' | 'Outfit' | 'Lexend' | string;
  fontSize: 'sm' | 'md' | 'lg';
  colorPalette: 'emerald' | 'amber_gold' | 'ocean_blue' | 'terracotta' | 'royal_violet';
  customTextColor?: string;
  customAccentColor?: string;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  email: string;
  lastUpdated: string;
  recoveryCode?: string;
}

export interface SiteData {
  stamp: number;
  school: SchoolInfo;
  hero: HeroData;
  principal: PrincipalData;
  welcome: WelcomeData;
  profile: ProfileData;
  facilities: FacilityItem[];
  teachers: TeacherItem[];
  principalsHistory: PrincipalHistoryItem[];
  hallOfFame: HallOfFameItem[];
  gallery: GalleryAlbum[];
  achievements: AchievementItem[];
  events: EventItem[];
  news: NewsItem[];
  social: {
    facebook: SocialLink;
    instagram: SocialLink;
    tiktok: SocialLink;
    youtube: SocialLink;
  };
  whatsapp: WhatsAppConfig;
  theme: {
    defaultTheme: string;
    allowToggle: boolean;
  };
  guestbook: GuestbookEntry[];
  ppdb?: {
    config: PPDBConfig;
    registrants: PPDBItem[];
  };
  adsense?: AdSenseConfig;
  appearance?: AppearanceSettings;
  credentials?: AdminCredentials;
  activityLogs?: ActivityLogItem[];
  auth?: {
    user: string;
    salt?: string;
    hash?: string;
    rsalt?: string;
    rhash?: string;
  };
}
