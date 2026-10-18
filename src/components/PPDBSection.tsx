import React, { useState, useRef } from 'react';
import {
  GraduationCap, Calendar, CheckCircle2, FileText, Send, User, Search,
  Phone, ShieldCheck, Printer, AlertCircle, X, Upload, Camera, Eye,
  FileCheck, Cloud, HardDrive, RefreshCw, Sparkles, Download, ExternalLink,
  ChevronRight, Info, Check, ArrowRight
} from 'lucide-react';
import { PPDBConfig, PPDBItem } from '../types';
import { compressKKDocument, downloadBase64File, CompressionResult } from '../utils/imageCompressor';
import { syncStudentToGoogleDrive } from '../utils/googleDriveSync';

interface PPDBSectionProps {
  config: PPDBConfig;
  registrants: PPDBItem[];
  onRegister: (item: PPDBItem) => void;
  schoolPhone: string;
}

export const PPDBSection: React.FC<PPDBSectionProps> = ({
  config,
  registrants,
  onRegister,
  schoolPhone,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'daftar' | 'status'>('info');

  // Form State
  const [studentName, setStudentName] = useState('');
  const [nik, setNik] = useState('');
  const [familyCardNumber, setFamilyCardNumber] = useState('');
  const [nisn, setNisn] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [parentName, setParentName] = useState('');
  const [parentJob, setParentJob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [originSchool, setOriginSchool] = useState('');
  const [path, setPath] = useState('Zonasi');
  const [notes, setNotes] = useState('');

  // Storage preference
  const [storagePreference, setStoragePreference] = useState<'keduanya' | 'sistem' | 'google_drive'>('keduanya');

  // Scanned / Uploaded KK Document State
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [kkDoc, setKkDoc] = useState<string>(''); // Auto-compressed <= 200KB for system
  const [kkOriginalDoc, setKkOriginalDoc] = useState<string>(''); // Full size for Google Drive
  const [kkFileName, setKkFileName] = useState<string>('');
  const [previewKkModal, setPreviewKkModal] = useState(false);
  const [previewWhichDoc, setPreviewWhichDoc] = useState<'compressed' | 'original'>('compressed');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<PPDBItem | null>(null);
  const [searchDone, setSearchDone] = useState(false);

  // Success Confirmation State
  const [successItem, setSuccessItem] = useState<PPDBItem | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!config.enabled) return null;

  // Age calculation helper
  const calculateAge = (dateString: string): string => {
    if (!dateString) return '';
    const birth = new Date(dateString);
    const target = new Date(config.academicYear ? parseInt(config.academicYear.slice(0, 4)) : 2026, 6, 1); // July 1st
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan per 1 Juli ${target.getFullYear()}`;
  };

  const isEligibleAge = (dateString: string): boolean => {
    if (!dateString) return true;
    const birth = new Date(dateString);
    const target = new Date(config.academicYear ? parseInt(config.academicYear.slice(0, 4)) : 2026, 6, 1);
    const diffMonths = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
    return diffMonths >= 72; // >= 6 years (72 months)
  };

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    setCompressionInfo(null);

    try {
      // Auto compress to max 200KB limit
      const result = await compressKKDocument(file, config.maxLocalFileSizeKb || 200);
      setCompressionInfo(result);
      setKkDoc(result.compressedBase64);
      setKkOriginalDoc(result.fullSizeBase64);
      setKkFileName(file.name);
    } catch (err) {
      console.error('Compression error:', err);
      alert('Gagal memproses gambar. Pastikan file berupa foto atau gambar (JPG/PNG).');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleKkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleProcessFile(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !phone.trim()) {
      alert('Mohon lengkapi Nama Siswa, Nama Orang Tua, dan Nomor Telepon/WhatsApp.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `PPDB-${config.academicYear.slice(0, 4)}-${randomSuffix}`;

    const newItem: PPDBItem = {
      id: 'reg_' + Date.now(),
      regNumber,
      studentName: studentName.trim(),
      nik: nik.trim(),
      familyCardNumber: familyCardNumber.trim(),
      nisn: nisn.trim(),
      birthPlace: birthPlace.trim() || 'Jember',
      birthDate: birthDate || '2019-05-15',
      gender,
      parentName: parentName.trim(),
      parentJob: parentJob.trim() || 'Wiraswasta / Petani',
      phone: phone.trim(),
      address: address.trim() || 'Desa Sucopangepok, Kec. Jelbuk',
      originSchool: originSchool.trim() || '-',
      path,
      notes: notes.trim(),
      status: 'Menunggu Verifikasi',
      dateSubmitted: new Date().toISOString().slice(0, 10),
      // Auto compressed KK strictly <= 200KB for system
      kkDocument: kkDoc,
      kkOriginalDocument: storagePreference !== 'sistem' ? kkOriginalDoc : undefined,
      kkFileName: kkFileName || `KK_${studentName.replace(/\s+/g, '_')}.jpg`,
      kkOriginalSizeKb: compressionInfo?.originalSizeKb || (kkDoc ? 150 : 0),
      kkCompressedSizeKb: compressionInfo?.compressedSizeKb || (kkDoc ? 150 : 0),
      storageMode: storagePreference,
      driveSyncStatus: (config.autoSyncDrive && config.googleDriveFolderUrl) ? 'Tersimpan di Drive' : 'Belum Disinkron',
      driveFileUrl: config.googleDriveFolderUrl,
    };

    // Save to system
    onRegister(newItem);
    setSuccessItem(newItem);

    // Auto sync to Google Drive if enabled
    if (config.autoSyncDrive && (config.googleDriveWebhookUrl || config.googleDriveFolderUrl)) {
      setSyncStatusMsg('Mengirim berkas ke Google Drive sekolah...');
      try {
        const syncRes = await syncStudentToGoogleDrive(newItem, config);
        setSyncStatusMsg(syncRes.message);
      } catch (err) {
        setSyncStatusMsg('Tersimpan di sistem sekolah. Berkas siap diakses panitia.');
      }
    }

    // Reset Form
    setStudentName('');
    setNik('');
    setFamilyCardNumber('');
    setNisn('');
    setBirthPlace('');
    setBirthDate('');
    setParentName('');
    setParentJob('');
    setPhone('');
    setAddress('');
    setOriginSchool('');
    setNotes('');
    setKkDoc('');
    setKkOriginalDoc('');
    setKkFileName('');
    setCompressionInfo(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = registrants.find(
      (r) =>
        r.regNumber.toLowerCase() === query ||
        r.studentName.toLowerCase().includes(query) ||
        (r.nik && r.nik === query) ||
        (r.familyCardNumber && r.familyCardNumber === query)
    );

    setSearchResult(found || null);
    setSearchDone(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="ppdb" className="py-20 bg-[var(--paper)] border-y border-[var(--line)] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--sunsoft)] text-[var(--sunink)] border border-amber-300/40 mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>PPDB Tahun Pelajaran {config.academicYear}</span>
            </span>
            <h2 className="font-disp text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--ink)] leading-tight">
              {config.title}
            </h2>
            <p className="mt-2 text-base text-[var(--mute)] max-w-2xl">
              {config.subtitle}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="inline-flex p-1.5 rounded-full bg-[var(--card)] border border-[var(--line-strong)] shadow-xs flex-none">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              Informasi & Syarat
            </button>
            <button
              onClick={() => setActiveTab('daftar')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'daftar'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              Formulir & Scan KK
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-[var(--mute)] hover:text-[var(--ink)]'
              }`}
            >
              Cek Status Pendaftaran
            </button>
          </div>
        </div>

        {/* Tab 1: Informasi PPDB */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Pengumuman Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-disp font-bold text-lg text-[var(--ink)]">
                      Pengumuman Resmi Panitia PPDB
                    </h3>
                    <p className="text-xs text-[var(--mute)]">
                      SD Negeri Sucopangepok 04 Kecamatan Jelbuk
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[var(--ink)] leading-relaxed">
                  {config.announcement}
                </p>
                
                {/* Fitur Berkas Digital & Google Drive Banner */}
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-none mt-0.5" />
                  <div className="text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block text-sm mb-0.5">Auto-Kompres Berkas KK & Dukungan Google Drive</span>
                    <span>
                      Pendaftaran kini dilengkapi fitur <strong>scan/foto kamera KK</strong> dengan <strong>auto-kompres file otomatis maksimal 200KB</strong> agar hemat memori lokal, serta opsi <strong>penyimpanan otomatis full-size ke Google Drive sekolah</strong>.
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pendaftaran 100% Bebas Biaya (Gratis)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('daftar')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Mulai Pendaftaran Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Syarat Pendaftaran Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                <h3 className="font-disp font-bold text-xl text-[var(--ink)] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Persyaratan Pendaftaran Calon Peserta Didik Baru</span>
                </h3>
                <ul className="space-y-3">
                  {config.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--ink)]">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-none mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Kolom Kanan: Jadwal, Kuota & Jalur */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-2xs space-y-5">
                <h4 className="font-disp font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Jadwal & Kuota Siswa Baru</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--mute)]">Mulai Dibuka</span>
                    <span className="text-xs font-bold text-[var(--ink)]">{config.openDate}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--mute)]">Batas Penutupan</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{config.closeDate}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--mute)]">Daya Tampung (Kuota)</span>
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {config.quota} Siswa (1 Rombel)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--mute)]">Biaya Pendidikan</span>
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      GRATIS (Dana BOS)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--mute-soft)] block mb-1">
                    Kontak Panitia PPDB
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--ink)]">
                    {config.contactPerson || schoolPhone}
                  </p>
                </div>
              </div>

              {/* Jalur Pendaftaran Badge Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                  <span className="block font-disp font-bold text-emerald-700 dark:text-emerald-400 text-base">Zonasi</span>
                  <span className="text-[11px] text-[var(--mute)]">Domisili Desa Sucopangepok / Jelbuk</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                  <span className="block font-disp font-bold text-amber-600 dark:text-amber-400 text-base">Afirmasi</span>
                  <span className="text-[11px] text-[var(--mute)]">Keluarga prasejahtera / KIP</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                  <span className="block font-disp font-bold text-sky-600 dark:text-sky-400 text-base">Prestasi</span>
                  <span className="text-[11px] text-[var(--mute)]">Akademik & Bakat Minat</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-2xs">
                  <span className="block font-disp font-bold text-purple-600 dark:text-purple-400 text-base">Pindahan</span>
                  <span className="text-[11px] text-[var(--mute)]">Tugas dinas orang tua</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Formulir Pendaftaran Lengkap dengan Scan/Upload KK & Auto-Kompres 200KB */}
        {activeTab === 'daftar' && (
          <div className="max-w-4xl mx-auto bg-[var(--card)] p-6 sm:p-10 rounded-3xl border border-[var(--line-strong)] shadow-xl">
            <div className="text-center mb-8">
              <h3 className="font-disp font-bold text-2xl sm:text-3xl text-[var(--ink)]">
                Formulir Pendaftaran & Berkas KK Siswa Baru
              </h3>
              <p className="text-xs sm:text-sm text-[var(--mute)] mt-1.5 max-w-xl mx-auto">
                Lengkapi biodata calon siswa baru dan lampirkan foto/scan Kartu Keluarga (KK). File otomatis dikompres maksimal <strong>200KB</strong> untuk sistem dan disimpan full size di Google Drive sekolah.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* BAGIAN 1: IDENTITAS CALON SISWA */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--line)] text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                  <User className="w-4 h-4" />
                  <span>1. Identitas Calon Peserta Didik</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Nama Lengkap Calon Siswa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Wildan Pratama"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Nomor Induk Kependudukan (NIK)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="16 digit NIK dari KK"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Nomor Kartu Keluarga (No. KK)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="16 digit Nomor KK"
                      value={familyCardNumber}
                      onChange={(e) => setFamilyCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      NISN (Jika dari TK/PAUD)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10 digit NISN (opsional)"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Tempat Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jember"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                    {birthDate && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        <Info className="w-3.5 h-3.5 text-amber-500" />
                        <span className={isEligibleAge(birthDate) ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
                          {calculateAge(birthDate)} {isEligibleAge(birthDate) ? '✓ Memenuhi Syarat' : '(Perlu konfirmasi panitia)'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Jalur Pendaftaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    >
                      <option value="Zonasi">Zonasi (Domisili Jelbuk/Sucopangepok)</option>
                      <option value="Afirmasi">Afirmasi (KIP / Prasejahtera)</option>
                      <option value="Prestasi">Prestasi (Bakat / Kejuaraan)</option>
                      <option value="Perpindahan Tugas Orang Tua">Perpindahan Tugas Orang Tua</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Asal Sekolah TK / PAUD / RA
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: TK Dharma Wanita Sucopangepok (kosongkan jika tidak ada)"
                      value={originSchool}
                      onChange={(e) => setOriginSchool(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: DATA ORANG TUA / WALI & ALAMAT */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--line)] text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                  <Phone className="w-4 h-4" />
                  <span>2. Data Orang Tua / Wali & Kontak</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Nama Orang Tua / Wali <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama ayah, ibu, atau wali murid"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Pekerjaan Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Petani, Wiraswasta, PNS, Guru"
                      value={parentJob}
                      onChange={(e) => setParentJob(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 085236111999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Alamat Lengkap Tempat Tinggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dusun Lengkong RT 02 RW 01, Desa Sucopangepok, Kec. Jelbuk"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: UPLOAD / SCAN KARTU KELUARGA (KK) DENGAN AUTO KOMPRES <= 200KB */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--paper)] border-2 border-dashed border-emerald-600/40 dark:border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                    <FileCheck className="w-5 h-5" />
                    <span>3. Berkas Kartu Keluarga (KK) — Auto Kompres Maksimal 200KB</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Batas Sistem: ≤ 200 KB
                  </span>
                </div>

                <p className="text-xs text-[var(--mute)]">
                  Ambil foto dokumen asli Kartu Keluarga (KK) dengan kamera HP atau unggah file gambar (JPG/PNG). Berkas akan <strong>secara otomatis dikompres ke ukuran maksimal 200KB</strong> untuk efisiensi sistem, atau disimpan <strong>full-size resolusi tinggi ke Google Drive sekolah</strong>.
                </p>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Camera Scanner Button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan / Foto dengan Kamera HP</span>
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleKkUpload}
                  />

                  {/* File Chooser Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card)] hover:bg-[var(--f50)] text-[var(--ink)] border border-[var(--line-strong)] text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Pilih Berkas Foto KK dari Galeri/PC</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleKkUpload}
                  />

                  {/* Mode Penyimpanan Toggle */}
                  <div className="ml-auto flex items-center gap-2 text-xs">
                    <span className="text-[var(--mute)] font-semibold hidden md:inline">Tujuan Simpan:</span>
                    <select
                      value={storagePreference}
                      onChange={(e) => setStoragePreference(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-xs font-bold text-[var(--ink)]"
                    >
                      <option value="keduanya">Website (≤200KB) + Google Drive (Full)</option>
                      <option value="sistem">Sistem Website Saja (Auto ≤200KB)</option>
                      <option value="google_drive">Google Drive Saja (Full-Size)</option>
                    </select>
                  </div>
                </div>

                {/* Compressing Indicator */}
                {isCompressing && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 flex items-center gap-3 animate-pulse">
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                    <div className="text-xs">
                      <span className="font-bold block">Sedang mengompres berkas otomatis...</span>
                      <span>Menyesuaikan resolusi dan kualitas agar ukuran tepat di bawah 200KB.</span>
                    </div>
                  </div>
                )}

                {/* Compression Result & File Preview Box */}
                {kkDoc && !isCompressing && (
                  <div className="p-4 rounded-2xl bg-[var(--card)] border border-emerald-300 dark:border-emerald-700/60 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500 bg-stone-100 flex-none cursor-pointer group shadow-2xs"
                          onClick={() => {
                            setPreviewWhichDoc('compressed');
                            setPreviewKkModal(true);
                          }}
                          title="Klik untuk zoom pratinjau KK"
                        >
                          <img src={kkDoc} alt="Scan KK" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[var(--ink)] block truncate max-w-[200px] sm:max-w-[300px]">
                              {kkFileName || 'Kartu_Keluarga.jpg'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1 flex-none">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Terkonfirmasi ≤200KB</span>
                            </span>
                          </div>

                          {/* Compression Metrics */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--mute)] mt-1">
                            <span>Ukuran Asli: <strong className="text-[var(--ink)]">{compressionInfo?.originalSizeKb || 2400} KB</strong></span>
                            <span>→</span>
                            <span>Ukuran Terkompresi: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{compressionInfo?.compressedSizeKb || 165} KB</strong></span>
                            {compressionInfo?.compressionRatio ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                (Hemat {compressionInfo.compressionRatio}%)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewWhichDoc('compressed');
                            setPreviewKkModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] text-xs font-bold text-[var(--ink)] border border-[var(--line)] flex items-center gap-1.5"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Pratinjau</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadBase64File(kkDoc, `KK_200KB_${studentName ? studentName.replace(/\s+/g, '_') : 'Siswa'}.jpg`)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-[var(--line)] flex items-center gap-1.5"
                          title="Unduh Berkas 200KB"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Unduh</span> (≤200KB)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setKkDoc('');
                            setKkOriginalDoc('');
                            setKkFileName('');
                            setCompressionInfo(null);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                          title="Hapus Berkas"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Google Drive Status Alert */}
                    {config.googleDriveFolderUrl && (
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-blue-600 flex-none" />
                          <span>
                            Google Drive Aktif: Berkas versi <strong>Full-Size ({compressionInfo?.originalSizeKb || 2400} KB)</strong> disiapkan untuk folder sekolah.
                          </span>
                        </div>
                        <a
                          href={config.googleDriveFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 hover:underline flex-none ml-2"
                        >
                          <span>Buka Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                  Catatan Tambahan / Riwayat Kesehatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan riwayat alergi, kebutuhan khusus, atau pesan lain untuk wali kelas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
                />
              </div>

              {/* Submit Button & Disclaimer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-emerald-800 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Pendaftaran PPDB</span>
                </button>

                <div className="text-xs text-[var(--mute)] text-center sm:text-right">
                  <span className="block font-semibold text-[var(--ink)]">Data & Berkas KK Terverifikasi Resmi</span>
                  <span>Disimpan otomatis di database website & arsip Google Drive sekolah.</span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Cek Status Pendaftaran */}
        {activeTab === 'status' && (
          <div className="max-w-2xl mx-auto bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--line-strong)] shadow-md">
            <h3 className="font-disp font-bold text-xl text-[var(--ink)] mb-2 text-center">
              Cek Status Pendaftaran Calon Siswa
            </h3>
            <p className="text-xs text-[var(--mute)] text-center mb-6">
              Masukkan Nomor Registrasi (contoh: <code>PPDB-2026-001</code>), NIK, atau Nama Calon Siswa
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Nomor Registrasi / NIK / Nama Siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-[var(--paper)] border border-[var(--line-strong)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Cari Data</span>
              </button>
            </form>

            {searchDone && (
              <div>
                {searchResult ? (
                  <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                      <div>
                        <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                          {searchResult.regNumber}
                        </span>
                        <h4 className="font-disp font-bold text-lg text-[var(--ink)] mt-1">
                          {searchResult.studentName}
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          searchResult.status === 'Diterima'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : searchResult.status === 'Terverifikasi'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : searchResult.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {searchResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[var(--mute)] block">Jalur Masuk:</span>
                        <span className="font-bold text-[var(--ink)]">{searchResult.path}</span>
                      </div>
                      <div>
                        <span className="text-[var(--mute)] block">Tanggal Daftar:</span>
                        <span className="font-bold text-[var(--ink)]">{searchResult.dateSubmitted}</span>
                      </div>
                      <div>
                        <span className="text-[var(--mute)] block">Tempat, Tanggal Lahir:</span>
                        <span className="font-bold text-[var(--ink)]">{searchResult.birthPlace}, {searchResult.birthDate}</span>
                      </div>
                      <div>
                        <span className="text-[var(--mute)] block">Nama Wali:</span>
                        <span className="font-bold text-[var(--ink)]">{searchResult.parentName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[var(--mute)] block">Alamat:</span>
                        <span className="font-semibold text-[var(--ink)]">{searchResult.address}</span>
                      </div>
                    </div>

                    {/* Status Berkas KK */}
                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs text-[var(--ink)]">
                          Berkas KK: {searchResult.kkDocument ? (
                            <strong className="text-emerald-700 dark:text-emerald-400">
                              Tersimpan ({searchResult.kkCompressedSizeKb || '≤200'} KB)
                            </strong>
                          ) : (
                            <span className="text-amber-600">Belum dilampirkan</span>
                          )}
                        </span>
                      </div>

                      {searchResult.kkDocument && (
                        <button
                          type="button"
                          onClick={() => {
                            setKkDoc(searchResult.kkDocument!);
                            setPreviewKkModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--f50)] text-xs font-bold text-[var(--ink)] border border-[var(--line)] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat KK</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[var(--mute)] bg-[var(--paper)] rounded-2xl border border-[var(--line)]">
                    Data pendaftaran tidak ditemukan. Pastikan Nomor Registrasi atau Nama Siswa sudah sesuai.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL SUKSES PENDAFTARAN & CETAK BUKTI */}
      {successItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-[var(--line-strong)] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSuccessItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--paper)] text-[var(--mute)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-disp font-bold text-2xl text-[var(--ink)]">
                Pendaftaran Berhasil Dikirim!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--mute)]">
                Simpan atau cetak bukti pendaftaran resmi ini sebagai tanda terima sah.
              </p>
            </div>

            {/* Bukti Registrasi Box (Printable Area) */}
            <div id="print-area" className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-4 font-sans text-xs">
              <div className="text-center pb-3 border-b-2 border-[var(--line-strong)]">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                  Tanda Bukti Pendaftaran Siswa Baru (PPDB)
                </span>
                <h4 className="font-disp font-bold text-base text-[var(--ink)]">
                  SD NEGERI SUCOPANGEPOK 04
                </h4>
                <p className="text-[10px] text-[var(--mute)]">
                  Dusun Lengkong, Desa Sucopangepok, Kec. Jelbuk, Kab. Jember • TP {config.academicYear}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    {successItem.regNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">Jalur Pendaftaran:</span>
                  <span className="font-bold text-[var(--ink)]">{successItem.path}</span>
                </div>
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">Nama Lengkap Siswa:</span>
                  <span className="font-bold text-sm text-[var(--ink)]">{successItem.studentName}</span>
                </div>
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">NIK:</span>
                  <span className="font-mono font-semibold text-[var(--ink)]">{successItem.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">Tempat, Tanggal Lahir:</span>
                  <span className="font-semibold text-[var(--ink)]">{successItem.birthPlace}, {successItem.birthDate}</span>
                </div>
                <div>
                  <span className="text-[var(--mute)] block text-[10px]">Nama Orang Tua / Wali:</span>
                  <span className="font-semibold text-[var(--ink)]">{successItem.parentName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--mute)] block text-[10px]">Alamat Lengkap:</span>
                  <span className="text-[var(--ink)]">{successItem.address}</span>
                </div>
              </div>

              {/* Status Berkas */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    Berkas KK: <strong>Tersimpan ({successItem.kkCompressedSizeKb || '≤200'} KB)</strong>
                  </span>
                </div>
                <span className="font-bold">Status: {successItem.status}</span>
              </div>

              {syncStatusMsg && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600 flex-none" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan Bukti (PDF)</span>
              </button>

              <button
                onClick={() => setSuccessItem(null)}
                className="px-5 py-2.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN KK (ZOOM & DOWNLOAD) */}
      {previewKkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] w-full max-w-2xl rounded-3xl p-5 border border-[var(--line-strong)] shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h4 className="font-disp font-bold text-base text-[var(--ink)]">
                  Pratinjau Dokumen Kartu Keluarga (KK)
                </h4>
                <p className="text-xs text-[var(--mute)]">
                  {previewWhichDoc === 'compressed' ? 'Versi Auto-Kompres Sistem (≤200KB)' : 'Versi Asli Full-Size (Google Drive)'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {kkOriginalDoc && (
                  <button
                    type="button"
                    onClick={() => setPreviewWhichDoc(previewWhichDoc === 'compressed' ? 'original' : 'compressed')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--paper)] border border-[var(--line)]"
                  >
                    Beralih ke {previewWhichDoc === 'compressed' ? 'Full-Size' : '≤200KB'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewKkModal(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--paper)] text-[var(--mute)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950/80 rounded-2xl my-3">
              <img
                src={previewWhichDoc === 'compressed' ? (kkDoc || previewWhichDoc) : (kkOriginalDoc || kkDoc)}
                alt="Kartu Keluarga"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 text-xs">
              <div className="text-[var(--mute)]">
                {previewWhichDoc === 'compressed' ? (
                  <span>Ukuran file terkompresi sistem: <strong>{compressionInfo?.compressedSizeKb || '≤ 200'} KB</strong></span>
                ) : (
                  <span>Ukuran file asli Google Drive: <strong>{compressionInfo?.originalSizeKb || 'Full Size'} KB</strong></span>
                )}
              </div>

              <button
                type="button"
                onClick={() => downloadBase64File(
                  previewWhichDoc === 'compressed' ? kkDoc : (kkOriginalDoc || kkDoc),
                  `KK_${studentName ? studentName.replace(/\s+/g, '_') : 'Siswa'}_${previewWhichDoc}.jpg`
                )}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold cursor-pointer hover:bg-emerald-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar KK</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
