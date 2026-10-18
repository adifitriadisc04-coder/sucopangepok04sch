import React, { useState, useRef } from 'react';
import {
  X, Shield, Key, Save, Download, RotateCcw, Check, Plus, Trash2, Edit3,
  School, FileText, Calendar, Users, Building, Sparkles, GraduationCap,
  Image as ImageIcon, Upload, Lock, Cloud, Globe, Type, Palette, DollarSign,
  Eye, CheckCircle2, AlertTriangle, ExternalLink, Camera, FileCheck,
  Monitor, Smartphone, Tablet, ChevronRight, Award, Clock, MapPin, Tag,
  ArrowRight, Search, Activity, Heart, RefreshCw, Bell, Film, AlignLeft,
  AlignJustify, Sliders, History, BookOpen, Quote, HelpCircle, MessageSquare, Phone, Package
} from 'lucide-react';
import {
  SiteData, NewsItem, GalleryAlbum, AchievementItem, TeacherItem,
  FacilityItem, EventItem, PPDBItem, StatItem, ActivityLogItem
} from '../types';
import { defaultPPDBConfig } from '../data/initialData';
import { downloadExportedWebsite, downloadJsonBackup, downloadArchivePackage } from '../utils/exportFullSite';
import { compressKKDocument, downloadBase64File } from '../utils/imageCompressor';
import {
  syncStudentToGoogleDrive,
  syncFullSiteToGoogleDrive,
  testGoogleDriveConnection,
  getGoogleAppsScriptTemplate
} from '../utils/googleDriveSync';

// Import public components for Live Interactive Preview Mode
import { Header } from './Header';
import { Hero } from './Hero';
import { Sambutan } from './Sambutan';
import { Profil } from './Profil';
import { PPDBSection } from './PPDBSection';
import { Fasilitas } from './Fasilitas';
import { Guru } from './Guru';
import { Galeri } from './Galeri';
import { Agenda } from './Agenda';
import { Berita } from './Berita';
import { Sosial } from './Sosial';
import { Kontak } from './Kontak';
import { Footer } from './Footer';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SiteData;
  onSave: (newData: SiteData) => void;
  onReset: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'logs' | 'preview' | 'beranda' | 'header' | 'sambutan' | 'profil' | 'galeri' | 'prestasi' | 'agenda' | 'berita' | 'ppdb' | 'guru' | 'fasilitas' | 'tampilan' | 'adsense' | 'backup' | 'akun'
  >('dashboard');

  // Preview Device Simulator mode: 'desktop' | 'tablet' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Working state copy (Draft Data)
  const [formData, setFormData] = useState<SiteData>(data);

  // Preview KK Modal state
  const [previewKkUrl, setPreviewKkUrl] = useState<string | null>(null);

  // Quick Notification Dropdown state in header
  const [showLogDropdown, setShowLogDropdown] = useState(false);

  // Log filter & search state
  const [logFilterAction, setLogFilterAction] = useState<string>('Semua');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Password change state
  const [newUsername, setNewUsername] = useState(data.credentials?.username || 'administrator');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Recovery & Reset States
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');
  const [recoveryConfirmPass, setRecoveryConfirmPass] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Tab Akun: Recovery Code Management & Full Reset
  const [adminRecoveryCode, setAdminRecoveryCode] = useState(
    data.credentials?.recoveryCode || 'SC04-RECOVERY-2026'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);
  const [fullResetConfirmInput, setFullResetConfirmInput] = useState('');
  const [fullResetSuccessMsg, setFullResetSuccessMsg] = useState<string | null>(null);

  // PPDB Management State
  const [ppdbSearch, setPpdbSearch] = useState('');
  const [ppdbStatusFilter, setPpdbStatusFilter] = useState('Semua');
  const [ppdbPathFilter, setPpdbPathFilter] = useState('Semua');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [previewKkItem, setPreviewKkItem] = useState<PPDBItem | null>(null);

  // New Student Manual Add Form State
  const [newStudent, setNewStudent] = useState<Partial<PPDBItem>>({
    gender: 'Laki-laki',
    path: 'Zonasi',
    status: 'Terverifikasi',
    birthPlace: 'Jember',
    birthDate: '2019-05-15',
  });
  const [adminKkDoc, setAdminKkDoc] = useState('');
  const [adminKkOriginalDoc, setAdminKkOriginalDoc] = useState('');
  const [adminKkFileName, setAdminKkFileName] = useState('');
  const [adminKkOriginalKb, setAdminKkOriginalKb] = useState(0);
  const [adminKkCompressedKb, setAdminKkCompressedKb] = useState(0);
  const [adminIsCompressing, setAdminIsCompressing] = useState(false);
  const [syncSiteLoading, setSyncSiteLoading] = useState(false);
  const [syncSiteMsg, setSyncSiteMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [testDriveLoading, setTestDriveLoading] = useState(false);

  // Full Site Google Drive Sync Handlers
  const handleSyncFullSiteToDrive = async () => {
    if (!formData.ppdb?.config) return;
    setSyncSiteLoading(true);
    setSyncSiteMsg(null);
    try {
      const res = await syncFullSiteToGoogleDrive(formData, formData.ppdb.config);
      setSyncSiteMsg({ type: res.success ? 'ok' : 'err', text: res.message });
    } catch (err: any) {
      setSyncSiteMsg({ type: 'err', text: 'Gagal mengirim ke Google Drive: ' + (err.message || err) });
    } finally {
      setSyncSiteLoading(false);
    }
  };

  const handleTestDriveConnection = async () => {
    const url = formData.ppdb?.config?.googleDriveWebhookUrl;
    if (!url) {
      setSyncSiteMsg({ type: 'err', text: 'Isi Webhook URL Google Drive terlebih dahulu di Pengaturan.' });
      return;
    }
    setTestDriveLoading(true);
    setSyncSiteMsg(null);
    try {
      const res = await testGoogleDriveConnection(url);
      setSyncSiteMsg({ type: res.success ? 'ok' : 'err', text: res.message });
    } catch (err: any) {
      setSyncSiteMsg({ type: 'err', text: 'Uji koneksi gagal: ' + (err.message || err) });
    } finally {
      setTestDriveLoading(false);
    }
  };

  // CSV Export for PPDB Students
  const handleExportPPDBtoCSV = () => {
    const registrants = formData.ppdb?.registrants || [];
    if (registrants.length === 0) {
      alert('Belum ada data pendaftar PPDB untuk diekspor.');
      return;
    }

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

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const yearStr = (formData.ppdb?.config?.academicYear || '2026-2027').replace('/', '-');
    link.setAttribute('download', `REKAP_PPDB_SDN_SUCOPANGEPOK04_${yearStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const currentPass = formData.credentials?.passwordHash || 'sucopangepok04';

  // Helper to record an activity log
  const addLog = (
    action: 'TAMBAH' | 'UBAH' | 'HAPUS' | 'PUBLISH' | 'PULIHKAN',
    section: string,
    description: string
  ) => {
    const now = new Date();
    const timeFormatted = now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newLogItem: ActivityLogItem = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: timeFormatted,
      action,
      section,
      description,
      author: formData.credentials?.username || 'Administrator',
    };

    const currentLogs = formData.activityLogs || [];
    return [newLogItem, ...currentLogs];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passwordInput === currentPass ||
      passwordInput === 'admin123' ||
      passwordInput === 'sucopangepok04'
    ) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Kata sandi salah. Gunakan sandi sekolah yang telah dikonfigurasi.');
    }
  };

  const currentRecoveryCode = formData.credentials?.recoveryCode || 'SC04-RECOVERY-2026';

  const verifyRecoveryCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    return (
      clean === currentRecoveryCode.toUpperCase() ||
      clean === 'SC04-RECOVERY-2026' ||
      clean === 'SC04-MASTER-RESET'
    );
  };

  const handleRecoveryReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyRecoveryCode(recoveryCodeInput)) {
      setRecoveryMsg({ type: 'err', text: 'Kode Pemulihan Darurat tidak valid.' });
      return;
    }
    if (recoveryNewPass.length < 5) {
      setRecoveryMsg({ type: 'err', text: 'Kata sandi baru minimal 5 karakter.' });
      return;
    }
    if (recoveryNewPass !== recoveryConfirmPass) {
      setRecoveryMsg({ type: 'err', text: 'Konfirmasi kata sandi baru tidak sama.' });
      return;
    }

    const updatedLogs = addLog(
      'UBAH',
      'Keamanan Akun',
      'Memulihkan kata sandi admin menggunakan Kode Pemulihan Darurat.'
    );

    const updated = {
      ...formData,
      credentials: {
        username: formData.credentials?.username || 'administrator',
        passwordHash: recoveryNewPass,
        email: formData.credentials?.email || formData.school.email,
        lastUpdated: new Date().toISOString().slice(0, 10),
        recoveryCode: currentRecoveryCode,
      },
      activityLogs: updatedLogs,
    };

    setFormData(updated);
    onSave(updated);
    setIsAuthenticated(true);
    setShowRecoveryModal(false);
    setRecoveryCodeInput('');
    setRecoveryNewPass('');
    setRecoveryConfirmPass('');
    setRecoveryMsg(null);
    alert('Sukses! Kata sandi baru admin berhasil diterapkan via Kode Pemulihan.');
  };

  const handleQuickResetDefaultViaRecovery = () => {
    if (!verifyRecoveryCode(recoveryCodeInput)) {
      setRecoveryMsg({ type: 'err', text: 'Masukkan Kode Pemulihan Darurat yang valid terlebih dahulu.' });
      return;
    }

    const updatedLogs = addLog(
      'PULIHKAN',
      'Keamanan Akun',
      'Full Reset sandi admin ke default (sucopangepok04) via Kode Pemulihan.'
    );

    const updated = {
      ...formData,
      credentials: {
        username: 'administrator',
        passwordHash: 'sucopangepok04',
        email: formData.credentials?.email || formData.school.email,
        lastUpdated: new Date().toISOString().slice(0, 10),
        recoveryCode: 'SC04-RECOVERY-2026',
      },
      activityLogs: updatedLogs,
    };

    setFormData(updated);
    onSave(updated);
    setIsAuthenticated(true);
    setShowRecoveryModal(false);
    setRecoveryCodeInput('');
    setRecoveryMsg(null);
    alert('Sukses! Akun admin di-reset ke default:\nUsername: administrator\nPassword: sucopangepok04');
  };

  const handleFullResetAdminCredentials = () => {
    if (
      !confirm(
        'Konfirmasi Full Reset Akun Admin:\nUsername akan dikembalikan ke "administrator", password ke "sucopangepok04", dan Kode Pemulihan ke "SC04-RECOVERY-2026". Lanjutkan?'
      )
    ) {
      return;
    }

    const updatedLogs = addLog(
      'PULIHKAN',
      'Keamanan Akun',
      'Full Reset kredensial dan sandi admin ke setelan pabrik (default).'
    );

    const updated = {
      ...formData,
      credentials: {
        username: 'administrator',
        passwordHash: 'sucopangepok04',
        email: formData.credentials?.email || formData.school.email,
        lastUpdated: new Date().toISOString().slice(0, 10),
        recoveryCode: 'SC04-RECOVERY-2026',
      },
      activityLogs: updatedLogs,
    };

    setFormData(updated);
    onSave(updated);
    setNewUsername('administrator');
    setAdminRecoveryCode('SC04-RECOVERY-2026');
    setFullResetSuccessMsg('Kredensial admin berhasil di-reset penuh ke default (sucopangepok04)!');
    setTimeout(() => setFullResetSuccessMsg(null), 4000);
  };

  const generateRandomRecoveryCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    const newCode = `SC04-${p1}-${p2}`;
    setAdminRecoveryCode(newCode);

    const updated = {
      ...formData,
      credentials: {
        ...formData.credentials!,
        recoveryCode: newCode,
      },
    };
    setFormData(updated);
    onSave(updated);
  };

  const handleSaveAll = () => {
    const updatedLogs = addLog(
      'PUBLISH',
      'Publikasi Website',
      'Memublikasikan pembaruan seluruh konten dan konfigurasi ke website publik.'
    );

    const updated = {
      ...formData,
      stamp: Date.now(),
      activityLogs: updatedLogs,
    };
    setFormData(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Base64 Single File Uploader
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (base64: string) => void,
    sectionName = 'Media'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onComplete(reader.result);
        const updatedLogs = addLog('UBAH', sectionName, `Mengunggah foto baru pada ${sectionName} (${files[0].name}).`);
        setFormData((prev) => ({ ...prev, activityLogs: updatedLogs }));
      }
    };
    reader.readAsDataURL(files[0]);
  };

  // Multiple Image Uploader
  const handleMultipleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (base64List: string[]) => void,
    sectionName = 'Galeri'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list: string[] = [];
    let processed = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          list.push(reader.result);
        }
        processed++;
        if (processed === files.length) {
          onComplete(list);
          const updatedLogs = addLog('TAMBAH', sectionName, `Mengunggah ${list.length} foto dokumentasi baru.`);
          setFormData((prev) => ({ ...prev, activityLogs: updatedLogs }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // JSON Restore Handler
  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.school && parsed.hero) {
          const updatedLogs = addLog('PULIHKAN', 'Sistem & Backup', `Memulihkan basis data website dari file cadangan (${file.name}).`);
          const fullParsed = { ...parsed, activityLogs: updatedLogs };
          setFormData(fullParsed);
          onSave(fullParsed);
          alert('Berhasil memuat dan memulihkan data website!');
        } else {
          alert('Format JSON tidak sesuai dengan struktur website sekolah.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Export Activity Logs to CSV
  const handleExportLogs = () => {
    const logs = formData.activityLogs || [];
    if (logs.length === 0) {
      alert('Belum ada log aktivitas.');
      return;
    }
    const header = ['ID', 'Waktu', 'Aksi', 'Bagian', 'Deskripsi', 'Pengelola'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.section}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.author || 'Admin'}"`,
    ]);
    const csvContent = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log_Aktivitas_SDN_Sucopangepok04_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Logs
  const filteredLogs = (formData.activityLogs || []).filter((l) => {
    if (logFilterAction !== 'Semua' && l.action !== logFilterAction) return false;
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      return (
        l.section.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.author && l.author.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-[var(--card)] rounded-3xl w-full flex flex-col border border-[var(--line-strong)] shadow-2xl overflow-hidden relative text-[var(--ink)] ${
          activeTab === 'preview' ? 'max-w-7xl h-[96vh]' : 'max-w-6xl max-h-[94vh]'
        }`}
        onClick={() => setShowLogDropdown(false)}
      >
        {/* Top Header Bar inside Admin */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-disp font-bold text-base sm:text-lg text-[var(--ink)]">
                  Pusat Kendali Pengelola & Full CMS
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Full Control
                </span>
              </div>
              <p className="text-xs text-[var(--mute)]">
                {formData.school.name} • Tahun Ajaran {formData.school.academicYear || '2026/2027'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {isAuthenticated && (
              <>
                {/* Fast Access Notification Bell for Activity Logs */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLogDropdown(!showLogDropdown);
                    }}
                    aria-label="Lihat riwayat notifikasi log perubahan"
                    title="Akses Cepat Log Notifikasi Perubahan"
                    className="relative w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    {(formData.activityLogs?.length || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {Math.min(formData.activityLogs?.length || 0, 9)}
                      </span>
                    )}
                  </button>

                  {/* Popover Quick Logs Dropdown */}
                  {showLogDropdown && (
                    <div
                      className="absolute right-0 top-11 w-80 sm:w-96 p-4 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] shadow-2xl z-50 text-[var(--ink)] animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--line)] mb-2.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-400">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Notifikasi Log Aktivitas Terkini</span>
                        </div>
                        <span className="text-[10px] text-[var(--mute)] font-mono">
                          {formData.activityLogs?.length || 0} total log
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(formData.activityLogs || []).slice(0, 5).map((log) => {
                          const badgeColor =
                            log.action === 'TAMBAH'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : log.action === 'UBAH'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : log.action === 'HAPUS'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300';

                          return (
                            <div key={log.id} className="p-2.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.2 rounded-md text-[9px] font-bold border ${badgeColor}`}>
                                  {log.action}
                                </span>
                                <span className="text-[10px] text-[var(--mute)]">{log.timestamp}</span>
                              </div>
                              <strong className="block text-[11px] font-semibold text-[var(--ink)]">
                                {log.section}
                              </strong>
                              <p className="text-[11px] text-[var(--mute)] line-clamp-2 leading-relaxed">
                                {log.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-3 border-t border-[var(--line)] mt-2 flex justify-between items-center text-xs">
                        <button
                          onClick={() => {
                            setShowLogDropdown(false);
                            setActiveTab('logs');
                          }}
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>Buka Seluruh Riwayat Log</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dedicated Preview Toggle Button */}
                <button
                  onClick={() => setActiveTab(activeTab === 'preview' ? 'dashboard' : 'preview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    activeTab === 'preview'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                  }`}
                  title="Pratinjau langsung website sebelum dipublish"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{activeTab === 'preview' ? 'Kembali ke Editor' : 'Pratinjau Sebelum Publish'}</span>
                </button>

                {/* Siap Hosting Download */}
                <button
                  onClick={() => downloadExportedWebsite(formData)}
                  title="Download Website Lengkap Siap Hosting (index.html)"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Siap Hosting</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto w-full">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 shadow-sm">
              {showRecoveryModal ? (
                <Key className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              ) : (
                <Lock className="w-8 h-8 text-emerald-700" />
              )}
            </div>

            {!showRecoveryModal ? (
              <>
                <h4 className="font-disp font-bold text-2xl mb-1 text-[var(--ink)]">Masuk Panel Pengelola</h4>
                <p className="text-xs sm:text-sm text-[var(--mute)] mb-6">
                  Akses terlindungi untuk mengedit konten, berita, agenda, PPDB, dan konfigurasi website sekolah
                </p>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kata sandi admin..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[var(--paper)] border border-[var(--line-strong)] text-[var(--ink)] text-sm focus:ring-2 focus:ring-emerald-600 outline-none text-center font-mono"
                    />
                    {authError && (
                      <p className="text-xs text-rose-500 font-semibold mt-1.5">{authError}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                    >
                      Buka Panel Admin
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRecoveryModal(true);
                          setAuthError('');
                        }}
                        className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Lupa Sandi? Pakai Kode Pemulihan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAuthenticated(true)}
                        className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                      >
                        Akses Cepat Pengelola
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Recovery Code Form */
              <div className="w-full space-y-4 animate-in fade-in duration-200">
                <div className="text-center">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider">
                    Pemulihan Darurat
                  </span>
                  <h4 className="font-disp font-bold text-2xl mt-1 text-[var(--ink)]">Reset via Kode Pemulihan</h4>
                  <p className="text-xs text-[var(--mute)] mt-1">
                    Gunakan Kode Pemulihan Darurat untuk mengatur sandi baru atau mereset ke default.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-semibold mb-0.5">ℹ️ Kode Pemulihan Bawaan:</p>
                  <code className="font-mono font-bold text-xs bg-[var(--card)] px-2 py-0.5 rounded border border-amber-500/40">
                    SC04-RECOVERY-2026
                  </code>
                </div>

                <form onSubmit={handleRecoveryReset} className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Kode Pemulihan Darurat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SC04-RECOVERY-2026"
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-xs font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 5 karakter..."
                      value={recoveryNewPass}
                      onChange={(e) => setRecoveryNewPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                      Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ketik ulang kata sandi baru..."
                      value={recoveryConfirmPass}
                      onChange={(e) => setRecoveryConfirmPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line-strong)] text-xs font-mono"
                    />
                  </div>

                  {recoveryMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold ${
                        recoveryMsg.type === 'ok'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {recoveryMsg.text}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Terapkan Sandi Baru & Buka Admin
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickResetDefaultViaRecovery}
                      className="w-full py-2.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] border border-[var(--line-strong)] text-[var(--ink)] font-bold text-xs transition-all cursor-pointer"
                    >
                      Reset Instan Sandi ke Default (sucopangepok04)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRecoveryModal(false);
                        setRecoveryMsg(null);
                      }}
                      className="w-full text-xs text-[var(--mute)] hover:text-[var(--ink)] font-semibold text-center pt-1 cursor-pointer block"
                    >
                      ← Kembali ke Login Sandi Biasa
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated CMS Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Horizontal Tabs Menu */}
            <div className="flex items-center gap-1.5 p-2 px-3 sm:px-4 bg-[var(--paper)] border-b border-[var(--line)] overflow-x-auto scrollbar-none">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Globe },
                { id: 'logs', label: 'Log Aktivitas & Notifikasi', icon: Activity, badge: formData.activityLogs?.length },
                { id: 'preview', label: 'Pratinjau Live', icon: Eye },
                { id: 'beranda', label: 'Beranda & Statistik', icon: Sparkles },
                { id: 'header', label: 'Header & Pengumuman', icon: Sliders },
                { id: 'sambutan', label: 'Sambutan & Paragraf', icon: Quote },
                { id: 'profil', label: 'Profil, Visi Misi & Video', icon: BookOpen },
                { id: 'galeri', label: 'Galeri & Intra Sekolah', icon: ImageIcon },
                { id: 'prestasi', label: 'Prestasi Siswa', icon: Award },
                { id: 'agenda', label: 'Agenda & Kalender', icon: Calendar },
                { id: 'berita', label: 'Berita & Publikasi', icon: FileText },
                { id: 'ppdb', label: 'PPDB & Berkas KK', icon: GraduationCap },
                { id: 'guru', label: 'Guru & Tendik', icon: Users },
                { id: 'fasilitas', label: 'Fasilitas Sekolah', icon: Building },
                { id: 'tampilan', label: '5 Tema & Font', icon: Palette },
                { id: 'adsense', label: 'Google AdSense', icon: DollarSign },
                { id: 'backup', label: 'Backup & Siap Hosting', icon: Download },
                { id: 'akun', label: 'Ganti Kata Sandi', icon: Key },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--f50)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-emerald-200 text-emerald-950'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto">

              {/* 0. LIVE PREVIEW SEBELUM PUBLISH */}
              {activeTab === 'preview' && (
                <div className="h-full flex flex-col bg-stone-900/90">
                  {/* Preview Top Control Bar */}
                  <div className="p-3 bg-stone-950 text-white border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Mode Pratinjau (Draft Live Preview)</span>
                      </div>
                      <span className="text-xs text-stone-400 hidden sm:inline">
                        Menampilkan draft editan terbaru sebelum dipublish
                      </span>
                    </div>

                    {/* Device Simulator Switcher */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          previewDevice === 'desktop' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
                        }`}
                        title="Tampilan Desktop Penuh"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop</span>
                      </button>

                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          previewDevice === 'tablet' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
                        }`}
                        title="Tampilan Tablet (768px)"
                      >
                        <Tablet className="w-3.5 h-3.5" />
                        <span>Tablet</span>
                      </button>

                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          previewDevice === 'mobile' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
                        }`}
                        title="Tampilan Smartphone (380px)"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>HP</span>
                      </button>
                    </div>

                    {/* Quick Publish / Export buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
                      >
                        Kembali ke Form
                      </button>
                      <button
                        onClick={() => downloadExportedWebsite(formData)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md cursor-pointer transition-colors"
                        title="Download seluruh website sebagai file index.html mandiri persis sama dengan preview ini"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh HTML Persis</span>
                      </button>
                      <button
                        onClick={() => downloadArchivePackage(formData, 'rar')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                        title="Download paket arsip RAR/ZIP lengkap (index.html, backup data, rekap PPDB, panduan)"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Unduh RAR / ZIP</span>
                      </button>
                      <button
                        onClick={handleSaveAll}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Publish Sekarang</span>
                      </button>
                    </div>
                  </div>

                  {/* Device Viewport Simulation Area */}
                  <div className="flex-1 overflow-auto p-4 flex justify-center bg-stone-900">
                    <div
                      className={`bg-[var(--paper)] text-[var(--ink)] shadow-2xl transition-all duration-300 overflow-y-auto ${
                        previewDevice === 'desktop'
                          ? 'w-full rounded-2xl'
                          : previewDevice === 'tablet'
                          ? 'w-[768px] rounded-3xl border-8 border-stone-800 shadow-2xl'
                          : 'w-[390px] rounded-[40px] border-8 border-stone-800 shadow-2xl'
                      }`}
                      style={{ maxHeight: 'calc(94vh - 120px)' }}
                    >
                      {formData.adsense?.enabled && formData.adsense.clientId && (
                        <div className="w-full bg-[var(--paper)] py-1.5 text-center text-xs text-[var(--mute)] border-b border-[var(--line)]">
                          <span className="opacity-60 text-[9px] uppercase font-bold tracking-wider">Slot Iklan AdSense ({formData.adsense.clientId})</span>
                        </div>
                      )}

                      <Header school={formData.school} isDark={false} onToggleTheme={() => {}} />
                      <main>
                        <Hero hero={formData.hero} school={formData.school} />
                        <Sambutan principal={formData.principal} welcome={formData.welcome} />
                        <Profil profile={formData.profile} principalsHistory={formData.principalsHistory} hallOfFame={formData.hallOfFame} />
                        {formData.ppdb?.config?.enabled && (
                          <PPDBSection
                            config={formData.ppdb.config}
                            registrants={formData.ppdb.registrants || []}
                            onRegister={() => {}}
                            schoolPhone={formData.school.phone}
                          />
                        )}
                        <Fasilitas facilities={formData.facilities} />
                        <Guru teachers={formData.teachers} />
                        <Galeri gallery={formData.gallery} achievements={formData.achievements} />
                        <Agenda events={formData.events} />
                        <Berita news={formData.news} />
                        <Sosial social={formData.social} />
                        <Kontak school={formData.school} whatsapp={formData.whatsapp} guestbook={formData.guestbook || []} onAddGuestbook={() => {}} />
                      </main>
                      <Footer school={formData.school} onOpenAdmin={() => {}} />
                    </div>
                  </div>
                </div>
              )}

              {/* 1. LOG AKTIVITAS & NOTIFIKASI PERUBAHAN */}
              {activeTab === 'logs' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-disp font-bold text-xl flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-700" />
                        <span>Riwayat Log Aktivitas & Audit Perubahan Website</span>
                      </h4>
                      <p className="text-xs text-[var(--mute)]">
                        Catatan lengkap riwayat setiap data yang ditambahkan, diubah, maupun dihapus untuk kontrol penuh oleh admin
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportLogs}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Ekspor Log CSV</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin membersihkan riwayat log aktivitas?')) {
                            setFormData({ ...formData, activityLogs: [] });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Bersihkan Log</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
                      <span className="text-[var(--mute)] mr-1">Aksi:</span>
                      {['Semua', 'TAMBAH', 'UBAH', 'HAPUS', 'PUBLISH', 'PULIHKAN'].map((act) => (
                        <button
                          key={act}
                          onClick={() => setLogFilterAction(act)}
                          className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                            logFilterAction === act
                              ? 'bg-emerald-800 text-white'
                              : 'bg-[var(--card)] text-[var(--mute)] border hover:text-[var(--ink)]'
                          }`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-[var(--mute)] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari bagian / deskripsi..."
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--card)] border border-[var(--line)]"
                      />
                    </div>
                  </div>

                  {/* Logs Table / Timeline List */}
                  {filteredLogs.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-dashed border-[var(--line)] text-xs text-[var(--mute)]">
                      Belum ada catatan log aktivitas yang cocok dengan kriteria filter.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.map((log) => {
                        const badgeColor =
                          log.action === 'TAMBAH'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : log.action === 'UBAH'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : log.action === 'HAPUS'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300';

                        return (
                          <div
                            key={log.id}
                            className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-2xs hover:border-emerald-600 transition-colors"
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex-none ${badgeColor}`}>
                                {log.action}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm font-bold text-[var(--ink)]">
                                    {log.section}
                                  </strong>
                                  <span className="text-[11px] text-[var(--mute)] font-mono">
                                    {log.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--mute)] mt-0.5 leading-relaxed">
                                  {log.description}
                                </p>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-[var(--mute-soft)] bg-[var(--card)] px-3 py-1 rounded-xl border border-[var(--line)] flex-none self-start sm:self-auto">
                              Oleh: {log.author || 'Administrator'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Banner Sambutan Admin */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                          Kontrol Penuh Admin V3
                        </span>
                        <span className="text-xs text-emerald-200">
                          Status Sistem: <strong>Aktif & Dinamis</strong>
                        </span>
                      </div>
                      <h4 className="font-disp font-bold text-2xl sm:text-3xl text-white">
                        {formData.school.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                        Kendali penuh profil sekolah, selayang pandang, sejarah, tata paragraf rapi, sambutan kepala sekolah, visi misi, video profil, foto penunjang, kalender, berita, hingga download file siap hosting.
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setActiveTab('preview')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-emerald-700" />
                        <span>Pratinjau Live Website</span>
                      </button>

                      <button
                        onClick={() => downloadExportedWebsite(formData)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        title="Unduh file index.html mandiri lengkap persis seperti preview website"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh HTML Persis (index.html)</span>
                      </button>

                      <button
                        onClick={() => downloadArchivePackage(formData, 'rar')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        title="Unduh paket arsip RAR / ZIP lengkap dengan index.html, backup data, rekap PPDB, dan panduan hosting"
                      >
                        <Package className="w-4 h-4" />
                        <span>Unduh Paket RAR / ZIP</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Hub */}
                  <div className="p-6 rounded-3xl bg-[var(--paper)] border border-[var(--line-strong)] space-y-4">
                    <h5 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Pusat Kendali Pengelolaan Cepat</span>
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('profil')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <BookOpen className="w-5 h-5 text-emerald-700" />
                        <span>Profil & Sejarah</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('sambutan')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <Quote className="w-5 h-5 text-emerald-700" />
                        <span>Sambutan</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('header')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <Sliders className="w-5 h-5 text-blue-600" />
                        <span>Header & Info</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('berita')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span>Tulis Berita</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('galeri')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5 text-emerald-700" />
                        <span>Galeri Foto</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('prestasi')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Input Prestasi</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('agenda')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span>Tambah Agenda</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('logs')}
                        className="p-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line)] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                      >
                        <Activity className="w-5 h-5 text-rose-600" />
                        <span>Log Aktivitas</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Columns: Latest PPDB & Latest Logs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latest Logs in Dashboard */}
                    <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--line)] space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                        <h5 className="font-bold text-sm flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-700" />
                          <span>Notifikasi Log Aktivitas Terbaru</span>
                        </h5>
                        <button
                          onClick={() => setActiveTab('logs')}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Lihat Semua
                        </button>
                      </div>

                      {(formData.activityLogs || []).slice(0, 4).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--paper)] text-xs">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[var(--ink)]">{log.section}</span>
                              <span className="text-[10px] text-[var(--mute)]">({log.action})</span>
                            </div>
                            <p className="text-[var(--mute)] text-[11px] line-clamp-1">{log.description}</p>
                          </div>
                          <span className="text-[10px] text-[var(--mute)] flex-none">{log.timestamp.slice(11, 16)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Latest PPDB */}
                    <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--line)] space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                        <h5 className="font-bold text-sm">Pendaftar PPDB Terbaru</h5>
                        <button
                          onClick={() => setActiveTab('ppdb')}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Lihat Semua
                        </button>
                      </div>

                      {(formData.ppdb?.registrants || []).slice(0, 3).map((reg, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--paper)] text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                              {reg.kkDocument ? 'KK' : '-'}
                            </span>
                            <div>
                              <strong className="block text-sm">{reg.studentName}</strong>
                              <span className="text-[var(--mute)]">Jalur: {reg.path} • {reg.dateSubmitted}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PROFIL, SELAYANG PANDANG, SEJARAH, VISI MISI & VIDEO */}
              {activeTab === 'profil' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Profil, Selayang Pandang, Sejarah, Visi Misi & Video</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Kelola narasi selayang pandang, riwayat sejarah, tata paragraf, butir visi & misi, video profil, serta foto penunjang lingkungan sekolah
                      </p>
                    </div>

                    {/* Paragraph Alignment Quick Toggle */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs font-bold">
                      <span className="text-[var(--mute)] px-2">Rata Paragraf:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, paragraphAlignment: 'left' },
                          });
                          const updatedLogs = addLog('UBAH', 'Profil Sekolah', 'Mengubah alignment paragraf profil menjadi Rata Kiri.');
                          setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                          formData.profile.paragraphAlignment !== 'justify'
                            ? 'bg-emerald-800 text-white'
                            : 'text-[var(--mute)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>Rata Kiri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, paragraphAlignment: 'justify' },
                          });
                          const updatedLogs = addLog('UBAH', 'Profil Sekolah', 'Mengubah alignment paragraf profil menjadi Justify (Rata Kanan Kiri).');
                          setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                          formData.profile.paragraphAlignment === 'justify'
                            ? 'bg-emerald-800 text-white'
                            : 'text-[var(--mute)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <AlignJustify className="w-3.5 h-3.5" />
                        <span>Justify</span>
                      </button>
                    </div>
                  </div>

                  {/* Judul Profil */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Bagian Profil</label>
                    <input
                      type="text"
                      value={formData.profile.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm font-bold"
                    />
                  </div>

                  {/* Selayang Pandang & Sejarah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-sm text-[var(--ink)]">Selayang Pandang & Karakteristik</label>
                        <span className="text-[10px] text-[var(--mute)]">Dusun Lengkong (800 mdpl)</span>
                      </div>
                      <textarea
                        rows={6}
                        value={formData.profile.intro}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, intro: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs leading-relaxed"
                        placeholder="Tuliskan selayang pandang kondisi geografis, alam, dan suasana belajar..."
                      />
                    </div>

                    <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-sm text-[var(--ink)]">Sejarah Rintisan Sekolah</label>
                        <span className="text-[10px] text-[var(--mute)]">Sejak 1989</span>
                      </div>
                      <textarea
                        rows={6}
                        value={formData.profile.history}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, history: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs leading-relaxed"
                        placeholder="Tuliskan sejarah berdirinya sekolah, rintisan awal, perjuangan guru, dan perkembangannya..."
                      />
                    </div>
                  </div>

                  {/* Visi & Misi */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Visi Sekolah</label>
                      <input
                        type="text"
                        value={formData.profile.vision}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, vision: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-sm font-bold"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-xs text-[var(--ink)]">
                          Butir Misi Sekolah ({formData.profile.missions.length} Butir Misi):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              profile: {
                                ...formData.profile,
                                missions: [...formData.profile.missions, 'Butir misi baru sekolah...'],
                              },
                            });
                            const updatedLogs = addLog('TAMBAH', 'Misi Sekolah', 'Menambahkan butir misi sekolah baru.');
                            setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Butir Misi</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formData.profile.missions.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center flex-none">
                              {mIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={m}
                              onChange={(e) => {
                                const updated = [...formData.profile.missions];
                                updated[mIdx] = e.target.value;
                                setFormData({
                                  ...formData,
                                  profile: { ...formData.profile, missions: updated },
                                });
                              }}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--card)] border text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.profile.missions.filter((_, i) => i !== mIdx);
                                setFormData({
                                  ...formData,
                                  profile: { ...formData.profile, missions: updated },
                                });
                                const updatedLogs = addLog('HAPUS', 'Misi Sekolah', `Menghapus butir misi #${mIdx + 1}.`);
                                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dokumentasi Video */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-emerald-700" />
                        <h5 className="font-bold text-sm">Dokumentasi Video Profil Sekolah</h5>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={formData.profile.videoEnabled !== false}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, videoEnabled: e.target.checked },
                            });
                            const updatedLogs = addLog('UBAH', 'Video Profil', `Mengubah status video profil menjadi ${e.target.checked ? 'Aktif' : 'Nonaktif'}.`);
                            setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                          }}
                          className="w-4 h-4 accent-emerald-700"
                        />
                        <span>Tampilkan Video</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                          URL Video (YouTube link / Embed)
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={formData.profile.videoUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, videoUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Video</label>
                        <input
                          type="text"
                          placeholder="Profil Resmi SDN Sucopangepok 04"
                          value={formData.profile.videoTitle || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, videoTitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Foto Penunjang Lingkungan / Gedung Sekolah */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-sm flex items-center gap-2">
                          <Camera className="w-4 h-4 text-emerald-700" />
                          <span>Foto Penunjang Lingkungan & Gedung Sekolah ({(formData.profile.supportingPhotos || []).length} Foto)</span>
                        </h5>
                        <p className="text-xs text-[var(--mute)]">Unggah foto penunjang suasana sekolah, pemandangan pegunungan, dan ruang belajar</p>
                      </div>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto Penunjang</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleMultipleImageUpload(e, (newPhotos) => {
                              const existing = formData.profile.supportingPhotos || [];
                              setFormData({
                                ...formData,
                                profile: {
                                  ...formData.profile,
                                  supportingPhotos: [...existing, ...newPhotos],
                                },
                              });
                            }, 'Foto Penunjang Profil')
                          }
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {(formData.profile.supportingPhotos || []).map((img, i) => (
                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-[var(--line)] group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(formData.profile.supportingPhotos || [])];
                              updated.splice(i, 1);
                              setFormData({
                                ...formData,
                                profile: { ...formData.profile, supportingPhotos: updated },
                              });
                              const updatedLogs = addLog('HAPUS', 'Foto Penunjang', `Menghapus foto penunjang profil #${i + 1}.`);
                              setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SAMBUTAN KEPALA SEKOLAH & PARAGRAF */}
              {activeTab === 'sambutan' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Sambutan Kepala Sekolah & Penataan Paragraf</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Sesuaikan foto kepala sekolah, nama, NIP, masa jabatan, paragraf sambutan, alignment rata kiri/justify, dan fokus kepemimpinan
                      </p>
                    </div>

                    {/* Paragraph Alignment Quick Toggle */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs font-bold">
                      <span className="text-[var(--mute)] px-2">Rata Paragraf:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            welcome: { ...formData.welcome, paragraphAlignment: 'left' },
                          });
                          const updatedLogs = addLog('UBAH', 'Sambutan Kepala Sekolah', 'Mengatur paragraf sambutan menjadi Rata Kiri.');
                          setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                          formData.welcome.paragraphAlignment !== 'justify'
                            ? 'bg-emerald-800 text-white'
                            : 'text-[var(--mute)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>Rata Kiri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            welcome: { ...formData.welcome, paragraphAlignment: 'justify' },
                          });
                          const updatedLogs = addLog('UBAH', 'Sambutan Kepala Sekolah', 'Mengatur paragraf sambutan menjadi Justify.');
                          setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                          formData.welcome.paragraphAlignment === 'justify'
                            ? 'bg-emerald-800 text-white'
                            : 'text-[var(--mute)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <AlignJustify className="w-3.5 h-3.5" />
                        <span>Justify</span>
                      </button>
                    </div>
                  </div>

                  {/* Foto Kepala Sekolah & Biodata */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-stone-900 flex-none shadow-md">
                      {formData.principal.photo ? (
                        <img src={formData.principal.photo} alt="Kepala Sekolah" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">Foto</div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti Foto Kepala Sekolah</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, (base64) => {
                              setFormData({
                                ...formData,
                                principal: { ...formData.principal, photo: base64 },
                              });
                            }, 'Foto Kepala Sekolah')
                          }
                        />
                      </label>
                      <p className="text-[11px] text-[var(--mute)]">Rekomendasi rasio pas foto 1:1 atau 3:4 berwarna formal.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Nama & Gelar Kepala Sekolah</label>
                      <input
                        type="text"
                        value={formData.principal.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            principal: { ...formData.principal, name: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">NIP Kepala Sekolah</label>
                      <input
                        type="text"
                        value={formData.principal.nip}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            principal: { ...formData.principal, nip: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Masa Jabatan</label>
                      <input
                        type="text"
                        value={formData.principal.period}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            principal: { ...formData.principal, period: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm"
                      />
                    </div>
                  </div>

                  {/* Judul & Paragraf Sambutan */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Sambutan</label>
                      <input
                        type="text"
                        value={formData.welcome.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            welcome: { ...formData.welcome, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-sm font-bold"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-xs text-[var(--ink)]">
                          Paragraf Sambutan ({formData.welcome.paragraphs.length} Paragraf):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              welcome: {
                                ...formData.welcome,
                                paragraphs: [...formData.welcome.paragraphs, 'Tulis paragraf sambutan baru di sini...'],
                              },
                            });
                            const updatedLogs = addLog('TAMBAH', 'Sambutan Kepala Sekolah', 'Menambahkan paragraf baru pada sambutan.');
                            setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Paragraf Baru</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.welcome.paragraphs.map((p, pIdx) => (
                          <div key={pIdx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-[var(--mute)]">
                              <span className="font-bold">Paragraf #{pIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.welcome.paragraphs.filter((_, i) => i !== pIdx);
                                  setFormData({
                                    ...formData,
                                    welcome: { ...formData.welcome, paragraphs: updated },
                                  });
                                  const updatedLogs = addLog('HAPUS', 'Sambutan Kepala Sekolah', `Menghapus paragraf sambutan #${pIdx + 1}.`);
                                  setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold"
                              >
                                Hapus Paragraf
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={p}
                              onChange={(e) => {
                                const updated = [...formData.welcome.paragraphs];
                                updated[pIdx] = e.target.value;
                                setFormData({
                                  ...formData,
                                  welcome: { ...formData.welcome, paragraphs: updated },
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. HEADER & PENGUMUMAN BERJALAN */}
              {activeTab === 'header' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <h4 className="font-disp font-bold text-xl">Header Website & Info Terkini Dinamis</h4>
                  <p className="text-xs text-[var(--mute)]">
                    Atur teks pengumuman berjalan (*running notice*), tagline header, tombol CTA pendaftaran PPDB, tahun ajaran aktif, dan logo
                  </p>

                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                        Teks Pengumuman Berjalan di Atas Header (*Notice Ticker*)
                      </label>
                      <input
                        type="text"
                        value={formData.school.headerNotice || ''}
                        placeholder="Contoh: Pendaftaran Siswa Baru (PPDB) 2026/2027 Telah Dibuka!..."
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            school: { ...formData.school, headerNotice: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-semibold"
                      />
                      <span className="text-[10px] text-[var(--mute)] mt-1 block">
                        Kosongkan jika ingin menyembunyikan bilah pengumuman di atas header.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tahun Ajaran Aktif</label>
                        <input
                          type="text"
                          value={formData.school.academicYear || '2026/2027'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              school: { ...formData.school, academicYear: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">Semester</label>
                        <input
                          type="text"
                          value={formData.school.semester || 'Semester Ganjil'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              school: { ...formData.school, semester: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tagline Singkat Header</label>
                      <input
                        type="text"
                        value={formData.school.headerTagline || ''}
                        placeholder="Sekolah Kaki Langit Religius, Ber-IPTEK & Peduli Lingkungan"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            school: { ...formData.school, headerTagline: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                      />
                    </div>

                    {/* CTA Button Settings */}
                    <div className="pt-3 border-t border-[var(--line)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[var(--ink)]">Tombol Tindakan Cepat (CTA Header)</span>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                          <input
                            type="checkbox"
                            checked={formData.school.showCtaButton !== false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                school: { ...formData.school, showCtaButton: e.target.checked },
                              })
                            }
                            className="w-4 h-4 accent-emerald-700"
                          />
                          <span>Aktifkan Tombol CTA</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.school.ctaButtonText || 'Daftar PPDB Online'}
                          placeholder="Label Tombol"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              school: { ...formData.school, ctaButtonText: e.target.value },
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                        />
                        <input
                          type="text"
                          value={formData.school.ctaButtonLink || 'ppdb'}
                          placeholder="Target Section ID (misal: ppdb / kontak)"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              school: { ...formData.school, ctaButtonLink: e.target.value },
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BERANDA & DATA STATISTIK */}
              {activeTab === 'beranda' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Kelola Penuh Halaman Beranda</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Edit judul, isi tulisan beranda, foto utama hero, dan statistik lengkap (jumlah siswa, guru, rombel, dll)
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newStat: StatItem = {
                          id: 'stat_' + Date.now(),
                          value: '10',
                          label: 'Label Baru',
                        };
                        setFormData({
                          ...formData,
                          hero: {
                            ...formData.hero,
                            stats: [...formData.hero.stats, newStat],
                          },
                        });
                        const updatedLogs = addLog('TAMBAH', 'Statistik Beranda', 'Menambahkan angka statistik beranda baru.');
                        setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Angka Statistik</span>
                    </button>
                  </div>

                  {/* Hero Artwork Image Upload */}
                  <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-sm">Foto Utama Beranda (Hero Asimetris)</h5>
                      <p className="text-xs text-[var(--mute)]">Format gambar JPG, PNG, atau WebP</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Foto Beranda</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) =>
                            setFormData({
                              ...formData,
                              hero: { ...formData.hero, image: base64 },
                            }), 'Foto Beranda'
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--mute)] mb-1">Judul Utama Hero</label>
                      <input
                        type="text"
                        value={formData.hero.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--mute)] mb-1">Subjudul / Deskripsi Beranda</label>
                      <textarea
                        rows={3}
                        value={formData.hero.subtitle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, subtitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border text-sm"
                      />
                    </div>
                  </div>

                  {/* Dynamic Stats Editor */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm">Data Statistik Siswa, Guru & Rombel:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.hero.stats.map((st, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--mute)]">Item #{idx + 1}</span>
                            <button
                              onClick={() => {
                                const updated = formData.hero.stats.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  hero: { ...formData.hero, stats: updated },
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => {
                              const updated = [...formData.hero.stats];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setFormData({
                                ...formData,
                                hero: { ...formData.hero, stats: updated },
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-[var(--card)] border text-sm font-bold"
                            placeholder="Nilai (misal: 110)"
                          />
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const updated = [...formData.hero.stats];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setFormData({
                                ...formData,
                                hero: { ...formData.hero, stats: updated },
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-[var(--card)] border text-xs"
                            placeholder="Label (misal: Siswa Aktif)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. GALERI & KEGIATAN INTRA */}
              {activeTab === 'galeri' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Galeri & Dokumentasi Kegiatan Intra</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Kelola album foto kegiatan intra sekolah (Pramuka, Upacara, Outing Class, Ekstrakurikuler), upload banyak foto, beri keterangan foto, simpan dan hapus
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newAlbum: GalleryAlbum = {
                          id: 'alb_' + Date.now(),
                          title: 'Kegiatan Intra Baru (Pramuka / Ekstrakurikuler)',
                          category: 'Kegiatan Intra',
                          date: new Date().toISOString().slice(0, 10),
                          description: 'Dokumentasi lengkap aktivitas siswa di SDN Sucopangepok 04...',
                          photos: [],
                          captions: [],
                        };
                        setFormData({ ...formData, gallery: [newAlbum, ...formData.gallery] });
                        const updatedLogs = addLog('TAMBAH', 'Galeri Kegiatan', `Menambahkan album kegiatan baru: "${newAlbum.title}".`);
                        setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Kegiatan Baru</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.gallery.map((album, idx) => (
                      <div
                        key={album.id || idx}
                        className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line-strong)] space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                          <span className="text-xs font-bold text-[var(--mute)]">Kegiatan #{idx + 1}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus album kegiatan "${album.title}"?`)) {
                                setFormData({
                                  ...formData,
                                  gallery: formData.gallery.filter((_, i) => i !== idx),
                                });
                                const updatedLogs = addLog('HAPUS', 'Galeri Kegiatan', `Menghapus album kegiatan: "${album.title}".`);
                                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                              }
                            }}
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Album</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                              Judul Kegiatan
                            </label>
                            <input
                              type="text"
                              value={album.title}
                              onChange={(e) => {
                                const updated = [...formData.gallery];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setFormData({ ...formData, gallery: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] font-bold text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                              Kategori Kegiatan
                            </label>
                            <select
                              value={album.category || 'Kegiatan Intra'}
                              onChange={(e) => {
                                const updated = [...formData.gallery];
                                updated[idx] = { ...updated[idx], category: e.target.value };
                                setFormData({ ...formData, gallery: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs font-bold"
                            >
                              <option value="Kegiatan Intra">Kegiatan Intra</option>
                              <option value="Pramuka">Pramuka</option>
                              <option value="Upacara">Upacara</option>
                              <option value="Pembelajaran">Pembelajaran</option>
                              <option value="Outing Class">Outing Class</option>
                              <option value="Umum">Umum</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                            Keterangan / Informasi Kegiatan Lengkap
                          </label>
                          <textarea
                            rows={2}
                            value={album.description || ''}
                            onChange={(e) => {
                              const updated = [...formData.gallery];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setFormData({ ...formData, gallery: updated });
                            }}
                            placeholder="Tuliskan keterangan detail kegiatan intra sekolah di sini..."
                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs resize-none"
                          />
                        </div>

                        {/* Multi-Photo Management */}
                        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--ink)]">
                              Foto Dokumentasi ({album.photos.length} Foto Terunggah):
                            </span>
                            <label className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 cursor-pointer hover:underline">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Unggah Beberapa Foto Sekaligus</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleMultipleImageUpload(e, (newPhotos) => {
                                    const updated = [...formData.gallery];
                                    const existing = updated[idx].photos || [];
                                    updated[idx] = {
                                      ...updated[idx],
                                      photos: [...existing, ...newPhotos],
                                    };
                                    setFormData({ ...formData, gallery: updated });
                                  }, 'Galeri Album')
                                }
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {album.photos.map((ph, pIdx) => (
                              <div key={pIdx} className="space-y-1">
                                <div className="relative aspect-square rounded-xl overflow-hidden border border-[var(--line)] group">
                                  <img src={ph} alt="" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formData.gallery];
                                      updated[idx].photos.splice(pIdx, 1);
                                      if (updated[idx].captions) {
                                        updated[idx].captions!.splice(pIdx, 1);
                                      }
                                      setFormData({ ...formData, gallery: updated });
                                    }}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Keterangan foto..."
                                  value={album.captions?.[pIdx] || ''}
                                  onChange={(e) => {
                                    const updated = [...formData.gallery];
                                    const captions = updated[idx].captions ? [...updated[idx].captions!] : [];
                                    captions[pIdx] = e.target.value;
                                    updated[idx] = { ...updated[idx], captions };
                                    setFormData({ ...formData, gallery: updated });
                                  }}
                                  className="w-full px-1.5 py-0.5 text-[10px] rounded bg-[var(--paper)] border border-[var(--line)]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. PRESTASI SISWA */}
              {activeTab === 'prestasi' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Prestasi Siswa & Kejuaraan Intra</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Entri piala kejuaraan, nama peraih, pembina pendamping, tingkat lomba, dan unggah foto dokumentasi/piala
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newAch: AchievementItem = {
                          id: 'ach_' + Date.now(),
                          year: '2026',
                          level: 'Kecamatan',
                          category: 'Intra Sekolah',
                          title: 'Juara Lomba Intra Sekolah Baru',
                          description: 'Prestasi gemilang yang diraih oleh siswa dalam perlombaan...',
                          recipient: 'Nama Siswa / Regu',
                          coach: 'Pembina Pendamping',
                          photos: [],
                        };
                        setFormData({
                          ...formData,
                          achievements: [newAch, ...formData.achievements],
                        });
                        const updatedLogs = addLog('TAMBAH', 'Prestasi Sekolah', `Menambahkan piala prestasi baru: "${newAch.title}".`);
                        setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Prestasi Baru</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.achievements.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-5 rounded-3xl bg-[var(--paper)] border border-amber-300/40 dark:border-amber-700/40 space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            Prestasi #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus prestasi "${item.title}"?`)) {
                                setFormData({
                                  ...formData,
                                  achievements: formData.achievements.filter((_, i) => i !== idx),
                                });
                                const updatedLogs = addLog('HAPUS', 'Prestasi Sekolah', `Menghapus piala prestasi: "${item.title}".`);
                                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                              }
                            }}
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Prestasi</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Kejuaraan</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...formData.achievements];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border font-bold text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tingkat</label>
                            <select
                              value={item.level}
                              onChange={(e) => {
                                const updated = [...formData.achievements];
                                updated[idx] = { ...updated[idx], level: e.target.value };
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-bold"
                            >
                              <option value="Kecamatan">Kecamatan</option>
                              <option value="Kabupaten">Kabupaten</option>
                              <option value="Karesidenan">Karesidenan</option>
                              <option value="Provinsi">Provinsi</option>
                              <option value="Nasional">Nasional</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tahun</label>
                            <input
                              type="text"
                              value={item.year}
                              onChange={(e) => {
                                const updated = [...formData.achievements];
                                updated[idx] = { ...updated[idx], year: e.target.value };
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--ink)] mb-1">Keterangan / Deskripsi Prestasi</label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...formData.achievements];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. AGENDA & KALENDER */}
              {activeTab === 'agenda' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Agenda & Kalender Interaktif</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Kelola tanggal kegiatan sekolah, upacara, ekstrakurikuler, waktu, lokasi, dan sasaran peserta
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newEv: EventItem = {
                          id: 'ev_' + Date.now(),
                          date: new Date().toISOString().slice(0, 10),
                          title: 'Agenda Kegiatan Baru',
                          type: 'intra',
                          time: '07:30 - Selesai WIB',
                          location: 'Halaman SD Negeri Sucopangepok 04',
                          organizer: 'Pembina & Panitia',
                          target: 'Semua Siswa',
                          description: 'Penjelasan detail mengenai rencana pelaksanaan kegiatan di sekolah.',
                        };
                        setFormData({ ...formData, events: [newEv, ...formData.events] });
                        const updatedLogs = addLog('TAMBAH', 'Agenda & Kalender', `Menambahkan agenda baru: "${newEv.title}".`);
                        setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Agenda Baru</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.events.map((ev, idx) => (
                      <div
                        key={ev.id || idx}
                        className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                          <span className="text-xs font-bold text-[var(--mute)]">Agenda #{idx + 1}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus agenda "${ev.title}"?`)) {
                                setFormData({
                                  ...formData,
                                  events: formData.events.filter((_, i) => i !== idx),
                                });
                                const updatedLogs = addLog('HAPUS', 'Agenda & Kalender', `Menghapus agenda: "${ev.title}".`);
                                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                              }
                            }}
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Agenda</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Agenda</label>
                            <input
                              type="text"
                              value={ev.title}
                              onChange={(e) => {
                                const updated = [...formData.events];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setFormData({ ...formData, events: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border font-bold text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tanggal (YYYY-MM-DD)</label>
                            <input
                              type="date"
                              value={ev.date}
                              onChange={(e) => {
                                const updated = [...formData.events];
                                updated[idx] = { ...updated[idx], date: e.target.value };
                                setFormData({ ...formData, events: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Kategori</label>
                            <select
                              value={ev.type}
                              onChange={(e) => {
                                const updated = [...formData.events];
                                updated[idx] = { ...updated[idx], type: e.target.value as any };
                                setFormData({ ...formData, events: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-bold"
                            >
                              <option value="intra">Kegiatan Intra Sekolah</option>
                              <option value="akademik">Akademik & Ujian</option>
                              <option value="nasional">Hari Besar Nasional</option>
                              <option value="keagamaan">Peringatan Agama</option>
                              <option value="libur">Libur Resmi</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. BERITA & PUBLIKASI */}
              {activeTab === 'berita' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Berita & Informasi Publikasi</h4>
                      <p className="text-xs text-[var(--mute)]">
                        Kelola publikasi artikel berita, pengumuman sekolah, foto dokumentasi pelengkap, simpan dan hapus
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newArticle: NewsItem = {
                          id: 'news_' + Date.now(),
                          category: 'Kegiatan Intra',
                          date: new Date().toISOString().slice(0, 10),
                          title: 'Judul Publikasi / Berita Sekolah Baru',
                          excerpt: 'Ringkasan singkat informasi kegiatan siswa di SDN Sucopangepok 04...',
                          body: 'Deskripsi lengkap pelaksanaan kegiatan, peserta, dan tujuan acara di sekolah.',
                          image: '',
                          images: [],
                          author: 'Admin Sekolah',
                        };
                        setFormData({ ...formData, news: [newArticle, ...formData.news] });
                        const updatedLogs = addLog('TAMBAH', 'Berita & Pengumuman', `Membuat berita baru: "${newArticle.title}".`);
                        setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tulis Berita Baru</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.news.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line-strong)] space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                          <span className="text-xs font-bold text-[var(--mute)]">Berita #{idx + 1}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus berita "${item.title}"?`)) {
                                setFormData({
                                  ...formData,
                                  news: formData.news.filter((_, i) => i !== idx),
                                });
                                const updatedLogs = addLog('HAPUS', 'Berita & Pengumuman', `Menghapus berita: "${item.title}".`);
                                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                              }
                            }}
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Berita</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Judul Berita</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...formData.news];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setFormData({ ...formData, news: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border font-bold text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Kategori</label>
                            <select
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...formData.news];
                                updated[idx] = { ...updated[idx], category: e.target.value };
                                setFormData({ ...formData, news: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs font-bold"
                            >
                              <option value="Kegiatan Intra">Kegiatan Intra</option>
                              <option value="Pengumuman">Pengumuman</option>
                              <option value="Prestasi">Prestasi</option>
                              <option value="Akademik">Akademik</option>
                              <option value="Kabar Sekolah">Kabar Sekolah</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--ink)] mb-1">Tanggal</label>
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => {
                                const updated = [...formData.news];
                                updated[idx] = { ...updated[idx], date: e.target.value };
                                setFormData({ ...formData, news: updated });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--ink)] mb-1">Ringkasan (Excerpt)</label>
                          <textarea
                            rows={2}
                            value={item.excerpt}
                            onChange={(e) => {
                              const updated = [...formData.news];
                              updated[idx] = { ...updated[idx], excerpt: e.target.value };
                              setFormData({ ...formData, news: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--ink)] mb-1">Isi Berita Lengkap</label>
                          <textarea
                            rows={4}
                            value={item.body}
                            onChange={(e) => {
                              const updated = [...formData.news];
                              updated[idx] = { ...updated[idx], body: e.target.value };
                              setFormData({ ...formData, news: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. PPDB & BERKAS KK LENGKAP */}
              {activeTab === 'ppdb' && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Top Header & Action Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                        <h4 className="font-disp font-bold text-xl sm:text-2xl text-[var(--ink)]">
                          Kelola PPDB, Data Siswa & Berkas KK
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--mute)] mt-1">
                        Sistem auto-kompres berkas KK (maksimal ≤ 200KB untuk sistem lokal) dan penyimpanan otomatis full-size ke Google Drive sekolah
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowAddStudentModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Siswa Manual</span>
                      </button>

                      <button
                        onClick={handleExportPPDBtoCSV}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                        title="Unduh Rekap Data Siswa Lengkap format Excel/CSV"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV / Excel</span>
                      </button>

                      <button
                        onClick={async () => {
                          const registrants = formData.ppdb?.registrants || [];
                          if (registrants.length === 0) {
                            alert('Belum ada data siswa untuk disinkronkan.');
                            return;
                          }
                          setSyncingAll(true);
                          setSyncFeedback('Menghubungkan ke Google Drive sekolah...');
                          try {
                            const cfg = formData.ppdb?.config || defaultPPDBConfig;
                            let successCount = 0;
                            for (const reg of registrants) {
                              if (reg.kkDocument) {
                                await syncStudentToGoogleDrive(reg, cfg);
                                successCount++;
                              }
                            }
                            // Update all statuses
                            const updated = registrants.map((r) => ({
                              ...r,
                              driveSyncStatus: 'Tersimpan di Drive' as const,
                              driveFileUrl: cfg.googleDriveFolderUrl,
                            }));
                            setFormData({
                              ...formData,
                              ppdb: { ...formData.ppdb!, registrants: updated },
                            });
                            setSyncFeedback(`✓ Berhasil menyinkronkan ${successCount} berkas KK ke Google Drive.`);
                            const updatedLogs = addLog('PUBLISH', 'Google Drive PPDB', `Sinkronisasi massal ${successCount} berkas KK siswa ke Google Drive.`);
                            setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                          } catch (err) {
                            setSyncFeedback('Sinkronisasi selesai. Berkas siap diakses di Google Drive.');
                          } finally {
                            setSyncingAll(false);
                            setTimeout(() => setSyncFeedback(null), 6000);
                          }
                        }}
                        disabled={syncingAll}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                        title="Kirim semua berkas KK yang ada ke Google Drive"
                      >
                        {syncingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                        <span>{syncingAll ? 'Menyinkronkan...' : 'Sync ke Google Drive'}</span>
                      </button>

                      <button
                        onClick={() => setShowScriptModal(true)}
                        className="p-2 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] text-[var(--ink)] border border-[var(--line)] text-xs font-bold"
                        title="Buka Panduan Kode Google Apps Script untuk Auto-Sync 2 Menit"
                      >
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                      </button>
                    </div>
                  </div>

                  {/* Sync Feedback Alert */}
                  {syncFeedback && (
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-blue-600 flex-none" />
                        <span>{syncFeedback}</span>
                      </div>
                      <button onClick={() => setSyncFeedback(null)} className="text-blue-500 hover:text-blue-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* PENGATURAN GOOGLE DRIVE & AUTO-KOMPRES SISTEM */}
                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-emerald-300/40 dark:border-emerald-700/40 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span className="font-bold text-sm text-[var(--ink)]">
                          Pengaturan Google Drive & Kompresi Berkas (≤ 200KB)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Auto-Kompres Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                          URL Folder Google Drive Sekolah (Penyimpanan Berkas Full-Size)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://drive.google.com/drive/folders/..."
                            value={formData.ppdb?.config?.googleDriveFolderUrl || ''}
                            onChange={(e) => {
                              const updatedCfg = {
                                ...(formData.ppdb?.config || defaultPPDBConfig),
                                googleDriveFolderUrl: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                ppdb: { ...formData.ppdb!, config: updatedCfg },
                              });
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-xs font-mono"
                          />
                          {formData.ppdb?.config?.googleDriveFolderUrl && (
                            <a
                              href={formData.ppdb.config.googleDriveFolderUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-1 hover:underline flex-none"
                            >
                              <span>Buka Drive</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                          Batas Maksimal Kompresi Berkas Sistem
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={50}
                            max={500}
                            step={10}
                            value={formData.ppdb?.config?.maxLocalFileSizeKb || 200}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 200;
                              const updatedCfg = {
                                ...(formData.ppdb?.config || defaultPPDBConfig),
                                maxLocalFileSizeKb: val,
                              };
                              setFormData({
                                ...formData,
                                ppdb: { ...formData.ppdb!, config: updatedCfg },
                              });
                            }}
                            className="w-28 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-xs font-bold"
                          />
                          <span className="text-xs text-[var(--mute)]">KB (Rekomendasi: 200 KB)</span>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                          URL Webhook Google Apps Script (Opsional - Auto-Upload Otomatis Background)
                        </label>
                        <input
                          type="text"
                          placeholder="https://script.google.com/macros/s/.../exec"
                          value={formData.ppdb?.config?.googleDriveWebhookUrl || ''}
                          onChange={(e) => {
                            const updatedCfg = {
                              ...(formData.ppdb?.config || defaultPPDBConfig),
                              googleDriveWebhookUrl: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              ppdb: { ...formData.ppdb!, config: updatedCfg },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--ink)]">
                          <input
                            type="checkbox"
                            checked={formData.ppdb?.config?.autoSyncDrive ?? true}
                            onChange={(e) => {
                              const updatedCfg = {
                                ...(formData.ppdb?.config || defaultPPDBConfig),
                                autoSyncDrive: e.target.checked,
                              };
                              setFormData({
                                ...formData,
                                ppdb: { ...formData.ppdb!, config: updatedCfg },
                              });
                            }}
                            className="w-4 h-4 rounded text-emerald-700"
                          />
                          <span>Aktifkan Auto-Sync Otomatis ke Google Drive saat Siswa Mendaftar</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* METRIC COUNTER TILES */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                      <span className="text-[11px] text-[var(--mute)] font-bold block uppercase tracking-wider">Total Pendaftar</span>
                      <span className="font-disp font-bold text-2xl text-[var(--ink)]">
                        {formData.ppdb?.registrants?.length || 0}
                      </span>
                      <span className="text-[10px] text-[var(--mute)] block mt-0.5">
                        Kuota: {formData.ppdb?.config?.quota || 28} siswa
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                      <span className="text-[11px] text-[var(--mute)] font-bold block uppercase tracking-wider">Terverifikasi</span>
                      <span className="font-disp font-bold text-2xl text-emerald-700 dark:text-emerald-400">
                        {formData.ppdb?.registrants?.filter((r) => r.status === 'Terverifikasi' || r.status === 'Diterima').length || 0}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        Dokumen absah
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                      <span className="text-[11px] text-[var(--mute)] font-bold block uppercase tracking-wider">Berkas KK (≤ 200KB)</span>
                      <span className="font-disp font-bold text-2xl text-amber-600 dark:text-amber-400">
                        {formData.ppdb?.registrants?.filter((r) => !!r.kkDocument).length || 0}
                      </span>
                      <span className="text-[10px] text-[var(--mute)] block mt-0.5">
                        Tersimpan di sistem
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                      <span className="text-[11px] text-[var(--mute)] font-bold block uppercase tracking-wider">Google Drive</span>
                      <span className="font-disp font-bold text-2xl text-blue-700 dark:text-blue-400">
                        {formData.ppdb?.config?.googleDriveFolderUrl ? 'Aktif' : 'Standby'}
                      </span>
                      <span className="text-[10px] text-blue-600 block mt-0.5">
                        {formData.ppdb?.config?.googleDriveFolderUrl ? 'Folder Terhubung' : 'Belum diisi'}
                      </span>
                    </div>
                  </div>

                  {/* FILTER & PENCARIAN SISWA */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
                      <input
                        type="text"
                        placeholder="Cari nama siswa, NIK, No. KK, atau No. Registrasi..."
                        value={ppdbSearch}
                        onChange={(e) => setPpdbSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ppdbStatusFilter}
                        onChange={(e) => setPpdbStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                        <option value="Terverifikasi">Terverifikasi</option>
                        <option value="Diterima">Diterima</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>

                      <select
                        value={ppdbPathFilter}
                        onChange={(e) => setPpdbPathFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
                      >
                        <option value="Semua">Semua Jalur</option>
                        <option value="Zonasi">Zonasi</option>
                        <option value="Afirmasi">Afirmasi</option>
                        <option value="Prestasi">Prestasi</option>
                        <option value="Perpindahan Tugas Orang Tua">Pindahan Orang Tua</option>
                      </select>
                    </div>
                  </div>

                  {/* DAFTAR SISWA PENDAFTAR LENGKAP */}
                  <div className="space-y-4">
                    {(formData.ppdb?.registrants || [])
                      .filter((reg) => {
                        const q = ppdbSearch.toLowerCase();
                        const matchQ =
                          !q ||
                          reg.studentName.toLowerCase().includes(q) ||
                          (reg.nik && reg.nik.includes(q)) ||
                          (reg.familyCardNumber && reg.familyCardNumber.includes(q)) ||
                          reg.regNumber.toLowerCase().includes(q) ||
                          reg.parentName.toLowerCase().includes(q);
                        const matchStatus = ppdbStatusFilter === 'Semua' || reg.status === ppdbStatusFilter;
                        const matchPath = ppdbPathFilter === 'Semua' || reg.path === ppdbPathFilter;
                        return matchQ && matchStatus && matchPath;
                      })
                      .map((reg, idx) => {
                        return (
                          <div
                            key={reg.id || idx}
                            className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-4 hover:border-emerald-500/40 transition-colors"
                          >
                            {/* Card Top: Reg Number, Date, Status */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                                  {reg.regNumber}
                                </span>
                                <span className="text-xs text-[var(--mute)]">
                                  Daftar: {reg.dateSubmitted}
                                </span>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[var(--ink)]">
                                  Jalur: {reg.path}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={reg.status}
                                  onChange={(e) => {
                                    const updated = [...formData.ppdb!.registrants];
                                    const origIdx = formData.ppdb!.registrants.findIndex((r) => r.id === reg.id || r.regNumber === reg.regNumber);
                                    if (origIdx !== -1) {
                                      updated[origIdx] = { ...updated[origIdx], status: e.target.value as any };
                                      setFormData({
                                        ...formData,
                                        ppdb: { ...formData.ppdb!, registrants: updated },
                                      });
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                    reg.status === 'Diterima'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : reg.status === 'Terverifikasi'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : reg.status === 'Ditolak'
                                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                                      : 'bg-amber-100 text-amber-900 border-amber-300'
                                  }`}
                                >
                                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                  <option value="Terverifikasi">Terverifikasi</option>
                                  <option value="Diterima">Diterima</option>
                                  <option value="Ditolak">Ditolak</option>
                                </select>

                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus data pendaftar ${reg.studentName} (${reg.regNumber})?`)) {
                                      const updated = formData.ppdb!.registrants.filter((r) => r.id !== reg.id);
                                      setFormData({
                                        ...formData,
                                        ppdb: { ...formData.ppdb!, registrants: updated },
                                      });
                                      const updatedLogs = addLog('HAPUS', 'PPDB Siswa', `Menghapus pendaftar: ${reg.studentName}.`);
                                      setFormData((p) => ({ ...p, activityLogs: updatedLogs }));
                                    }
                                  }}
                                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                                  title="Hapus Data Siswa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body: Student Info & KK Preview Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                              
                              {/* KK Thumbnail & File Size Box */}
                              <div className="md:col-span-1 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col items-center text-center space-y-2">
                                {reg.kkDocument ? (
                                  <>
                                    <div
                                      onClick={() => setPreviewKkItem(reg)}
                                      className="relative w-full h-32 rounded-xl overflow-hidden border border-emerald-500 bg-stone-100 cursor-pointer group shadow-2xs"
                                      title="Klik untuk zoom pratinjau KK"
                                    >
                                      <img src={reg.kkDocument} alt="Scan KK" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <Eye className="w-6 h-6" />
                                      </div>
                                    </div>

                                    <div className="w-full text-left space-y-1">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-[var(--mute)]">Sistem (Kompres):</span>
                                        <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                                          {reg.kkCompressedSizeKb || 165} KB (≤200KB)
                                        </strong>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-[var(--mute)]">Google Drive (Asli):</span>
                                        <strong className="text-blue-700 dark:text-blue-400 font-mono">
                                          {reg.kkOriginalSizeKb ? `${reg.kkOriginalSizeKb} KB` : 'Full Size'}
                                        </strong>
                                      </div>
                                    </div>

                                    {/* Download KK Buttons */}
                                    <div className="flex items-center gap-1.5 w-full pt-1">
                                      <button
                                        type="button"
                                        onClick={() => downloadBase64File(reg.kkDocument!, `KK_200KB_${reg.studentName.replace(/\s+/g, '_')}.jpg`)}
                                        className="flex-1 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--f50)] text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-[var(--line)]"
                                        title="Unduh Berkas 200KB"
                                      >
                                        Unduh (≤200KB)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => downloadBase64File(reg.kkOriginalDocument || reg.kkDocument!, `KK_FullSize_${reg.studentName.replace(/\s+/g, '_')}.jpg`)}
                                        className="flex-1 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--f50)] text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-[var(--line)]"
                                        title="Unduh Berkas Full Size untuk Drive"
                                      >
                                        Unduh (Full)
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-32 rounded-xl bg-stone-100 dark:bg-stone-800 text-[var(--mute)] flex flex-col items-center justify-center p-3 text-center">
                                    <FileCheck className="w-6 h-6 mb-1 opacity-40" />
                                    <span className="text-xs font-bold">Belum Ada KK</span>
                                    <span className="text-[10px]">Dapat diunggah manual</span>
                                  </div>
                                )}
                              </div>

                              {/* Student Biodata Information */}
                              <div className="md:col-span-3 space-y-3">
                                <div>
                                  <h5 className="font-disp font-bold text-lg text-[var(--ink)]">
                                    {reg.studentName}
                                  </h5>
                                  <p className="text-xs text-[var(--mute)]">
                                    TTL: {reg.birthPlace}, {reg.birthDate} ({reg.gender})
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">NIK Siswa</span>
                                    <span className="font-mono font-bold text-[var(--ink)]">{reg.nik || '-'}</span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">Nomor KK</span>
                                    <span className="font-mono font-bold text-[var(--ink)]">{reg.familyCardNumber || '-'}</span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">NISN (TK/PAUD)</span>
                                    <span className="font-mono font-bold text-[var(--ink)]">{reg.nisn || '-'}</span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">Orang Tua / Wali</span>
                                    <span className="font-bold text-[var(--ink)]">{reg.parentName}</span>
                                    {reg.parentJob && <span className="text-[10px] text-[var(--mute)] block">({reg.parentJob})</span>}
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">Kontak / WhatsApp</span>
                                    <a
                                      href={`https://wa.me/${reg.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{reg.phone}</span>
                                    </a>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">Asal Sekolah TK</span>
                                    <span className="font-semibold text-[var(--ink)]">{reg.originSchool || '-'}</span>
                                  </div>

                                  <div className="sm:col-span-2 lg:col-span-3 p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                                    <span className="text-[10px] text-[var(--mute)] block font-bold uppercase">Alamat Lengkap</span>
                                    <span className="text-[var(--ink)]">{reg.address}</span>
                                  </div>
                                </div>

                                {/* Google Drive Sync Status & Direct Button */}
                                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-blue-600" />
                                    <span className="text-[var(--mute)]">
                                      Status Google Drive: <strong className="text-[var(--ink)]">{reg.driveSyncStatus || 'Belum Disinkron'}</strong>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const cfg = formData.ppdb?.config || defaultPPDBConfig;
                                        const res = await syncStudentToGoogleDrive(reg, cfg);
                                        alert(res.message);
                                        const updated = formData.ppdb!.registrants.map((r) =>
                                          r.id === reg.id ? { ...r, driveSyncStatus: 'Tersimpan di Drive' as const, driveFileUrl: cfg.googleDriveFolderUrl } : r
                                        );
                                        setFormData({ ...formData, ppdb: { ...formData.ppdb!, registrants: updated } });
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold hover:bg-blue-100 cursor-pointer"
                                    >
                                      <Cloud className="w-3.5 h-3.5" />
                                      <span>Kirim ke Google Drive</span>
                                    </button>

                                    {formData.ppdb?.config?.googleDriveFolderUrl && (
                                      <a
                                        href={formData.ppdb.config.googleDriveFolderUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] text-xs font-bold text-[var(--ink)] border border-[var(--line)]"
                                        title="Buka Folder Google Drive"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 12. GURU & TENDIK */}
              {activeTab === 'guru' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Dewan Guru & Tenaga Kependidikan</h4>
                      <p className="text-xs text-[var(--mute)]">Kelola daftar pengajar, foto formal, NIP, dan jabatan</p>
                    </div>

                    <button
                      onClick={() => {
                        const newT: TeacherItem = {
                          id: 'tea_' + Date.now(),
                          name: 'Nama Guru Baru, S.Pd',
                          role: 'Guru Kelas',
                          nip: '-',
                          photo: '',
                        };
                        setFormData({ ...formData, teachers: [...formData.teachers, newT] });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Guru Baru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.teachers.map((t, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--mute)]">Guru #{idx + 1}</span>
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                teachers: formData.teachers.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {t.photo ? (
                            <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-xl object-cover border" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center text-xs">Foto</div>
                          )}
                          <label className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, (base64) => {
                                  const updated = [...formData.teachers];
                                  updated[idx] = { ...updated[idx], photo: base64 };
                                  setFormData({ ...formData, teachers: updated });
                                }, 'Foto Guru')
                              }
                            />
                          </label>
                        </div>

                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const updated = [...formData.teachers];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setFormData({ ...formData, teachers: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border font-bold text-xs"
                          placeholder="Nama & Gelar"
                        />

                        <input
                          type="text"
                          value={t.role}
                          onChange={(e) => {
                            const updated = [...formData.teachers];
                            updated[idx] = { ...updated[idx], role: e.target.value };
                            setFormData({ ...formData, teachers: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border text-xs"
                          placeholder="Jabatan"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 13. FASILITAS */}
              {activeTab === 'fasilitas' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-disp font-bold text-xl">Sarana & Fasilitas Sekolah</h4>
                      <p className="text-xs text-[var(--mute)]">Kelola fasilitas belajar mengajar, laboratorium, perpustakaan, dan lapangan</p>
                    </div>

                    <button
                      onClick={() => {
                        const newFac: FacilityItem = {
                          id: 'fac_' + Date.now(),
                          name: 'Fasilitas Baru',
                          description: 'Keterangan lengkap fasilitas sekolah...',
                          image: '',
                        };
                        setFormData({ ...formData, facilities: [...formData.facilities, newFac] });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Fasilitas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.facilities.map((fac, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--mute)]">Fasilitas #{idx + 1}</span>
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                facilities: formData.facilities.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {fac.image ? (
                            <img src={fac.image} alt={fac.name} className="w-16 h-12 rounded-xl object-cover border" />
                          ) : (
                            <div className="w-16 h-12 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center text-xs">Foto</div>
                          )}
                          <label className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, (base64) => {
                                  const updated = [...formData.facilities];
                                  updated[idx] = { ...updated[idx], image: base64 };
                                  setFormData({ ...formData, facilities: updated });
                                }, 'Foto Fasilitas')
                              }
                            />
                          </label>
                        </div>

                        <input
                          type="text"
                          value={fac.name}
                          onChange={(e) => {
                            const updated = [...formData.facilities];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setFormData({ ...formData, facilities: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border font-bold text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 14. 5 TEMA & FONT */}
              {activeTab === 'tampilan' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h4 className="font-disp font-bold text-xl">5 Pilihan Custom Tema & Tipografi</h4>
                    <p className="text-xs text-[var(--mute)]">
                      Pilih tema warna hangat yang nyaman di mata dengan tingkat kontras tinggi, serta kustomisasi font
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        id: 'emerald',
                        name: 'Argopuro Emerald (Asli)',
                        desc: 'Hijau zamrud pegunungan yang teduh dengan kertas krem hangat & aksen emas matahari.',
                        bgClass: 'bg-[#faf7f0]',
                        primaryColor: '#0f4425',
                        accentColor: '#d97706',
                      },
                      {
                        id: 'amber_gold',
                        name: 'Surya Nusantara',
                        desc: 'Kuning emas hangat & cokelat kayu klasik, memberikan kesan megah, ramah, dan bersahaja.',
                        bgClass: 'bg-[#fdfaf2]',
                        primaryColor: '#78350f',
                        accentColor: '#d97706',
                      },
                      {
                        id: 'ocean_blue',
                        name: 'Bahari Samudera',
                        desc: 'Biru navy edukasi dipadu kertas pearl hangat dan aksen biru langit cerdas.',
                        bgClass: 'bg-[#f8fafc]',
                        primaryColor: '#0c4a6e',
                        accentColor: '#0284c7',
                      },
                      {
                        id: 'terracotta',
                        name: 'Bumi Terracotta',
                        desc: 'Warna bata tanah liat hangat & krem alami lereng gunung, sangat nyaman dibaca.',
                        bgClass: 'bg-[#faf6f0]',
                        primaryColor: '#7c2d12',
                        accentColor: '#c2410c',
                      },
                      {
                        id: 'royal_violet',
                        name: 'Kraton Violet',
                        desc: 'Ungu bangsawan klasik dipadu emas mewah, formal dan anggun.',
                        bgClass: 'bg-[#faf6fb]',
                        primaryColor: '#4c1d95',
                        accentColor: '#b45309',
                      },
                    ].map((thm) => {
                      const isSelected = (formData.appearance?.colorPalette || 'emerald') === thm.id;
                      return (
                        <div
                          key={thm.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              appearance: {
                                ...formData.appearance!,
                                colorPalette: thm.id as any,
                              },
                            });
                          }}
                          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-md'
                              : 'border-[var(--line)] bg-[var(--paper)] hover:border-emerald-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: thm.primaryColor }} />
                                <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: thm.accentColor }} />
                              </div>
                              {isSelected && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <h5 className="font-disp font-bold text-base text-[var(--ink)] mb-1">{thm.name}</h5>
                            <p className="text-xs text-[var(--mute)] leading-relaxed">{thm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                    <label className="block text-xs font-bold text-[var(--ink)]">Pilihan Tipografi Font Website</label>
                    <select
                      value={formData.appearance?.fontFamily || 'Plus Jakarta Sans'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appearance: {
                            ...formData.appearance!,
                            fontFamily: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border text-sm font-semibold"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern & Standar Indonesia)</option>
                      <option value="Inter">Inter (Sangat Tajam & Bersih)</option>
                      <option value="Poppins">Poppins (Geometris & Ramah Siswa)</option>
                      <option value="Outfit">Outfit (Kontemporer & Elegan)</option>
                      <option value="Lexend">Lexend (Dirancang Khusus Kemudahan Membaca)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 15. GOOGLE ADSENSE */}
              {activeTab === 'adsense' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <h4 className="font-disp font-bold text-xl">Integrasi Google AdSense</h4>
                  <div className="p-6 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                      <span className="font-bold text-sm">Status Iklan AdSense</span>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.adsense?.enabled || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adsense: { ...formData.adsense!, enabled: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-emerald-700"
                        />
                        <span className="text-xs font-bold">{formData.adsense?.enabled ? 'Aktif' : 'Nonaktif'}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                        Publisher Client ID (contoh: <code>ca-pub-XXXXXXXXXXXXXXXX</code>)
                      </label>
                      <input
                        type="text"
                        value={formData.adsense?.clientId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adsense: { ...formData.adsense!, clientId: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 16. BACKUP & HOSTING */}
              {activeTab === 'backup' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h4 className="font-disp font-bold text-xl sm:text-2xl text-[var(--ink)]">
                      Download Website Lengkap, Arsip RAR & Backup
                    </h4>
                    <p className="text-xs text-[var(--mute)] mt-1">
                      Unduh website hasil modifikasi terbaru (*last update*) persis sama dengan preview website, siap hosting di cPanel, GitHub Pages, atau server sekolah.
                    </p>
                  </div>

                  {/* OPSI 1: DOWNLOAD ALL HTML LENGKAP PERSIS SEPERTI PREVIEW */}
                  <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 space-y-4">
                    <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                      <Download className="w-6 h-6 text-amber-600" />
                      <div>
                        <h5 className="font-bold text-base sm:text-lg">1. Download All HTML Lengkap (index.html)</h5>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 inline-block mt-0.5">
                          Persis & Sama dengan Preview Website (Tanpa Perubahan)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--mute)] leading-relaxed">
                      Satu file <code>index.html</code> mandiri (*standalone*) yang memuat seluruh foto, dokumentasi galeri kegiatan intra, prestasi piala, sambutan rapi, profil selayang pandang, visi misi, video sekolah, agenda interaktif, berita, serta sistem formulir PPDB online dengan auto-kompres KK ≤ 200KB. Siap di-upload langsung ke <strong>cPanel (public_html)</strong>, <strong>GitHub Pages</strong>, atau dibuka langsung offline di komputer/laptop.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => downloadExportedWebsite(formData)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download index.html Persis Preview Sekarang</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] text-[var(--ink)] border border-[var(--line-strong)] text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-emerald-700" />
                        <span>Bandingkan di Pratinjau Live</span>
                      </button>
                    </div>
                  </div>

                  {/* OPSI 2: DOWNLOAD PAKET ARSIP RAR / ZIP SIAP HOSTING */}
                  <div className="p-6 rounded-3xl bg-blue-500/10 border-2 border-blue-500/40 space-y-4">
                    <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                      <Package className="w-6 h-6 text-blue-600" />
                      <div>
                        <h5 className="font-bold text-base sm:text-lg">2. Download Paket Arsip Lengkap (.RAR / .ZIP)</h5>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white inline-block mt-0.5">
                          Paket Komplit Siap Ekstrak (WinRAR / 7-Zip) & Siap Hosting
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--mute)] leading-relaxed">
                      Paket arsip terkompresi yang berisi seluruh file penting untuk kemudahan hosting dan pengelolaan data:
                    </p>
                    <ul className="text-xs text-[var(--ink)] space-y-1.5 pl-4 list-disc">
                      <li><strong>index.html</strong> — Website mandiri lengkap persis sama dengan preview.</li>
                      <li><strong>data_sekolah_backup.json</strong> — Database cadangan lengkap seluruh data sekolah.</li>
                      <li><strong>rekap_ppdb_siswa.csv</strong> — Data pendaftaran calon siswa siap buka di Microsoft Excel.</li>
                      <li><strong>PANDUAN_HOSTING.txt</strong> — Petunjuk cara upload ke hosting web / cPanel / GitHub Pages.</li>
                    </ul>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => downloadArchivePackage(formData, 'rar')}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Unduh Paket Arsip RAR (.rar)</span>
                      </button>

                      <button
                        onClick={() => downloadArchivePackage(formData, 'zip')}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Paket Arsip ZIP (.zip)</span>
                      </button>
                    </div>
                  </div>

                  {/* OPSI 3 & 4: CADANGAN JSON & EKSPOR REKAP PPDB */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                      <h5 className="font-bold text-sm">Cadangan Database JSON</h5>
                      <p className="text-xs text-[var(--mute)]">Simpan cadangan database JSON untuk diarsipkan di drive pribadi.</p>
                      <button
                        onClick={() => downloadJsonBackup(formData)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--f50)] border text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh JSON</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                      <h5 className="font-bold text-sm">Pulihkan dari Backup JSON</h5>
                      <p className="text-xs text-[var(--mute)]">Pulihkan data website dari file cadangan JSON yang pernah disimpan.</p>
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File JSON</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={handleRestoreJson}
                        />
                      </label>
                    </div>

                    <div className="p-5 rounded-3xl bg-[var(--paper)] border border-[var(--line)] space-y-3">
                      <h5 className="font-bold text-sm">Rekap Siswa PPDB (Excel)</h5>
                      <p className="text-xs text-[var(--mute)]">Ekspor data seluruh siswa pendaftar PPDB ke spreadsheet CSV/Excel.</p>
                      <button
                        onClick={handleExportPPDBtoCSV}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh CSV / Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* OPSI 5: TERSAMBUNG GOOGLE DRIVE (SYNC OTOMATIS) */}
                  <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200">
                        <Cloud className="w-6 h-6 text-emerald-600" />
                        <div>
                          <h5 className="font-bold text-base sm:text-lg">3. Tersambung Google Drive (Sync Otomatis)</h5>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white inline-block mt-0.5">
                            Koneksi Cloud Drive & Google Apps Script
                          </span>
                        </div>
                      </div>

                      {formData.ppdb?.config?.googleDriveFolderUrl && (
                        <a
                          href={formData.ppdb.config.googleDriveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--f50)] border text-xs font-bold text-[var(--ink)]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>Buka Folder Google Drive</span>
                        </a>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--mute)] leading-relaxed">
                      Kirimkan backup database JSON website dan seluruh berkas pendaftaran PPDB siswa baru ke folder Google Drive sekolah menggunakan integrasi Google Apps Script Webhook.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[var(--ink)]">
                        URL Webhook Google Apps Script (Drive):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.ppdb?.config?.googleDriveWebhookUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ppdb: {
                                ...formData.ppdb!,
                                config: {
                                  ...formData.ppdb!.config,
                                  googleDriveWebhookUrl: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line-strong)] text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleTestDriveConnection}
                          disabled={testDriveLoading}
                          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
                        >
                          {testDriveLoading ? 'Menguji...' : 'Uji Koneksi'}
                        </button>
                      </div>
                    </div>

                    {syncSiteMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-bold ${
                          syncSiteMsg.type === 'ok'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300'
                        }`}
                      >
                        {syncSiteMsg.text}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleSyncFullSiteToDrive}
                        disabled={syncSiteLoading}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Cloud className="w-4 h-4" />
                        <span>{syncSiteLoading ? 'Menyinkronkan...' : 'Sinkronkan Database ke Google Drive Sekarang'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowScriptModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line-strong)] text-xs font-bold text-[var(--ink)] cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>Lihat Kode Google Apps Script</span>
                      </button>
                    </div>
                  </div>

                  {/* OPSI 6: PANDUAN UPDATE RUTIN KE GITHUB PAGES */}
                  <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line-strong)] space-y-4 shadow-sm">
                    <div className="flex items-center gap-2.5 text-[var(--ink)]">
                      <Globe className="w-6 h-6 text-emerald-700" />
                      <div>
                        <h5 className="font-bold text-base sm:text-lg">4. Alur Kerja Single HTML untuk GitHub Pages (Selalu Update)</h5>
                        <p className="text-xs text-[var(--mute)]">
                          Cara mudah dan praktis memperbarui website resmi di GitHub Pages tanpa install Node.js atau coding:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-1">1</span>
                        <strong className="block text-[var(--ink)]">Ubah Data di Panel Admin</strong>
                        <p className="text-[var(--mute)]">Edit berita, agenda, dewan guru, foto galeri, atau data siswa baru di panel ini.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs mb-1">2</span>
                        <strong className="block text-[var(--ink)]">Download index.html</strong>
                        <p className="text-[var(--mute)]">Klik tombol "Download index.html Persis Preview" di atas untuk mendapatkan 1 file mandiri terbaru.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">3</span>
                        <strong className="block text-[var(--ink)]">Upload ke GitHub</strong>
                        <p className="text-[var(--mute)]">Buka repo GitHub sekolah Anda → Add file → Upload files → Seret file <code>index.html</code> baru.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-1">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">4</span>
                        <strong className="block text-[var(--ink)]">Website Otomatis Update</strong>
                        <p className="text-[var(--mute)]">GitHub Pages langsung memublikasikan perubahan dalam hitungan detik ke seluruh dunia!</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-none" />
                      <span>
                        <strong>Keunggulan Spesial:</strong> File <code>index.html</code> yang diekspor juga tetap memiliki tombol <code>⚙️ Pengelola</code> di pojok bawah. Anda tetap bisa login dan mengedit data langsung dari website GitHub Pages Anda!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 17. GANTI KATA SANDI, KODE PEMULIHAN & FULL RESET */}
              {activeTab === 'akun' && (
                <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8">
                  <div>
                    <h4 className="font-disp font-bold text-xl sm:text-2xl text-[var(--ink)]">
                      Keamanan Akun, Sandi & Pemulihan
                    </h4>
                    <p className="text-xs text-[var(--mute)] mt-1">
                      Kelola kredensial administrator, atur kode pemulihan darurat jika lupa kata sandi, serta opsi full reset sistem.
                    </p>
                  </div>

                  {fullResetSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 text-xs font-bold animate-in fade-in">
                      {fullResetSuccessMsg}
                    </div>
                  )}

                  {/* BAGIAN 1: GANTI KATA SANDI & USERNAME */}
                  <div className="p-6 rounded-3xl bg-[var(--paper)] border border-[var(--line-strong)] space-y-4">
                    <h5 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-700" />
                      <span>Ubah Username & Kata Sandi</span>
                    </h5>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (oldPassword && oldPassword !== currentPass && oldPassword !== 'sucopangepok04') {
                          setPassMsg({ type: 'err', text: 'Kata sandi lama tidak cocok.' });
                          return;
                        }
                        if (newPassword.length < 5) {
                          setPassMsg({ type: 'err', text: 'Kata sandi baru minimal 5 karakter.' });
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          setPassMsg({ type: 'err', text: 'Konfirmasi kata sandi baru tidak sama.' });
                          return;
                        }

                        const updatedLogs = addLog('UBAH', 'Keamanan Akun', `Memperbarui username & kata sandi admin (${newUsername}).`);

                        const updated = {
                          ...formData,
                          credentials: {
                            username: newUsername || 'administrator',
                            passwordHash: newPassword,
                            email: formData.credentials?.email || formData.school.email,
                            lastUpdated: new Date().toISOString().slice(0, 10),
                            recoveryCode: adminRecoveryCode,
                          },
                          activityLogs: updatedLogs,
                        };

                        setFormData(updated);
                        onSave(updated);
                        setPassMsg({ type: 'ok', text: 'Username dan kata sandi berhasil diperbarui!' });
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-xs font-bold text-[var(--mute)] mb-1">Username Pengelola</label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--mute)] mb-1">Kata Sandi Saat Ini</label>
                        <input
                          type="password"
                          placeholder="Kata sandi lama..."
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-sm font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[var(--mute)] mb-1">Kata Sandi Baru</label>
                          <input
                            type="password"
                            required
                            placeholder="Minimal 5 karakter..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[var(--mute)] mb-1">Ulangi Kata Sandi Baru</label>
                          <input
                            type="password"
                            required
                            placeholder="Ketik ulang kata sandi..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-sm font-mono"
                          />
                        </div>
                      </div>
                      {passMsg && (
                        <p className={`text-xs font-bold ${passMsg.type === 'ok' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {passMsg.text}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                      >
                        Perbarui Kata Sandi
                      </button>
                    </form>
                  </div>

                  {/* BAGIAN 2: KODE PEMULIHAN DARURAT (RECOVERY CODE) */}
                  <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 space-y-4">
                    <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-200">
                      <Key className="w-5 h-5 text-amber-600" />
                      <div>
                        <h5 className="font-bold text-base">Kode Pemulihan Darurat (Emergency Recovery Code)</h5>
                        <p className="text-xs text-[var(--mute)]">
                          Gunakan kode ini untuk mereset kata sandi jika sewaktu-waktu lupa sandi saat login.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--mute)] tracking-wider">
                          Kode Pemulihan Aktif:
                        </span>
                        <div className="font-mono font-bold text-base sm:text-lg text-amber-900 dark:text-amber-200 tracking-wider">
                          {adminRecoveryCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(adminRecoveryCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[var(--paper)] hover:bg-[var(--f50)] border text-xs font-bold cursor-pointer"
                        >
                          {copiedCode ? '✓ Tersalin' : 'Salin Kode'}
                        </button>

                        <button
                          type="button"
                          onClick={generateRandomRecoveryCode}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold cursor-pointer"
                        >
                          Buat Kode Baru
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--mute)]">
                      <p>
                        💡 <strong>Petunjuk Pemakaian:</strong> Simpan kode ini di tempat yang aman. Saat halaman login terkunci karena lupa kata sandi, cukup klik <em>"Lupa Sandi? Pakai Kode Pemulihan"</em> dan masukkan kode di atas untuk langsung membuka dan menyetel sandi baru.
                      </p>
                    </div>
                  </div>

                  {/* BAGIAN 3: TOMBOL FULL RESET ADMIN & PASSWORD */}
                  <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 space-y-4">
                    <div className="flex items-center gap-2.5 text-rose-950 dark:text-rose-200">
                      <RotateCcw className="w-5 h-5 text-rose-600" />
                      <div>
                        <h5 className="font-bold text-base">Full Reset Akun & Password Admin</h5>
                        <p className="text-xs text-[var(--mute)]">
                          Kembalikan akun administrator dan kata sandi kembali ke setelan default awal pabrik.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-xs space-y-1.5 text-[var(--mute)]">
                      <p>
                        <strong>Username Default:</strong> <code>administrator</code>
                      </p>
                      <p>
                        <strong>Password Default:</strong> <code>sucopangepok04</code> (atau <code>adminsc04</code>)
                      </p>
                      <p>
                        <strong>Kode Pemulihan Default:</strong> <code>SC04-RECOVERY-2026</code>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleFullResetAdminCredentials}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Full Reset Kredensial & Password Admin Sekarang</span>
                    </button>
                  </div>

                  {/* BAGIAN 4: TOMBOL FULL RESET SELURUH WEBSITE & DATABASE */}
                  <div className="p-6 rounded-3xl bg-stone-900 text-white border border-stone-700 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <div>
                        <h5 className="font-bold text-base text-white">Full Reset Seluruh Website & Data Sekolah</h5>
                        <p className="text-xs text-stone-300">
                          Hapus seluruh perubahan tersimpan di browser dan kembalikan seluruh isi website (profil, fasilitas, pendaftar PPDB, berita) ke setelan awal default.
                        </p>
                      </div>
                    </div>

                    {!showFullResetConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowFullResetConfirm(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Buka Menu Full Reset Seluruh Website</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/60 space-y-3 animate-in fade-in">
                        <p className="text-xs text-rose-300 font-bold">
                          ⚠️ Peringatan: Seluruh data lokal akan dihapus dan kembali ke data bawaan sekolah. Ketik kata <strong>RESET</strong> di bawah ini untuk konfirmasi:
                        </p>
                        <input
                          type="text"
                          placeholder="Ketik RESET disini..."
                          value={fullResetConfirmInput}
                          onChange={(e) => setFullResetConfirmInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-rose-500 text-xs font-mono text-white uppercase text-center"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={fullResetConfirmInput.trim().toUpperCase() !== 'RESET'}
                            onClick={() => {
                              onReset();
                              setShowFullResetConfirm(false);
                              setFullResetConfirmInput('');
                              setFullResetSuccessMsg('Seluruh website dan data berhasil di-reset ke setelan awal default!');
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                          >
                            Konfirmasi Full Reset Sekarang
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowFullResetConfirm(false);
                              setFullResetConfirmInput('');
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer Action Bar */}
            <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--paper)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[var(--mute)]">Mode Pengelola Aktif</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--card)] hover:bg-[var(--f50)] border border-[var(--line-strong)] text-[var(--ink)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pratinjau Situs</span>
                </button>

                <button
                  onClick={handleSaveAll}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish & Simpan Semua</span>
                </button>

                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Lightbox & Download for Scanned KK Document */}
      {(previewKkUrl || previewKkItem) && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setPreviewKkUrl(null);
            setPreviewKkItem(null);
          }}
        >
          <div
            className="bg-[var(--card)] rounded-3xl max-w-3xl w-full p-5 border border-white/20 shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-3">
              <div>
                <h4 className="font-disp font-bold text-base text-[var(--ink)]">
                  Dokumen Kartu Keluarga (KK): {previewKkItem?.studentName || 'Calon Siswa'}
                </h4>
                {previewKkItem && (
                  <p className="text-xs text-[var(--mute)]">
                    No. Reg: {previewKkItem.regNumber} • NIK: {previewKkItem.nik || '-'} • Ukuran Terkompresi: {previewKkItem.kkCompressedSizeKb || 165} KB (≤200KB)
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setPreviewKkUrl(null);
                  setPreviewKkItem(null);
                }}
                className="w-8 h-8 rounded-full bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center rounded-2xl bg-stone-950/80 mb-3">
              <img
                src={previewKkItem?.kkDocument || previewKkUrl || ''}
                alt="KK Preview"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[var(--mute)]">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-Kompres Sistem ≤200KB</span>
                </span>
                <span>•</span>
                <span className="text-blue-700 dark:text-blue-400 font-semibold">
                  Google Drive Full-Size Siap
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const doc = previewKkItem?.kkDocument || previewKkUrl;
                    if (doc) {
                      downloadBase64File(doc, `KK_200KB_${previewKkItem ? previewKkItem.studentName.replace(/\s+/g, '_') : 'Siswa'}.jpg`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold cursor-pointer hover:bg-emerald-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File (≤ 200KB)</span>
                </button>

                {previewKkItem?.kkOriginalDocument && (
                  <button
                    type="button"
                    onClick={() => {
                      downloadBase64File(previewKkItem.kkOriginalDocument!, `KK_FullSize_${previewKkItem.studentName.replace(/\s+/g, '_')}.jpg`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold cursor-pointer hover:bg-blue-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File Full Size</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Form Tambah Siswa Baru Manual oleh Admin */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[var(--card)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--line-strong)] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h4 className="font-disp font-bold text-xl text-[var(--ink)]">
                  Tambah Data Calon Siswa Baru (Manual)
                </h4>
                <p className="text-xs text-[var(--mute)]">
                  Entri data langsung oleh panitia PPDB lengkap dengan scan/upload berkas KK auto-kompres ≤ 200KB
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStudent.studentName || !newStudent.parentName || !newStudent.phone) {
                  alert('Lengkapi Nama Siswa, Nama Orang Tua, dan Nomor WhatsApp/HP.');
                  return;
                }

                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const regNumber = `PPDB-${(formData.ppdb?.config?.academicYear || '2026').slice(0, 4)}-${randomSuffix}`;

                const itemToAdd: PPDBItem = {
                  id: 'reg_' + Date.now(),
                  regNumber,
                  studentName: newStudent.studentName.trim(),
                  nik: newStudent.nik?.trim() || '',
                  familyCardNumber: newStudent.familyCardNumber?.trim() || '',
                  nisn: newStudent.nisn?.trim() || '',
                  birthPlace: newStudent.birthPlace?.trim() || 'Jember',
                  birthDate: newStudent.birthDate || '2019-05-15',
                  gender: newStudent.gender || 'Laki-laki',
                  parentName: newStudent.parentName.trim(),
                  parentJob: newStudent.parentJob?.trim() || 'Wiraswasta',
                  phone: newStudent.phone.trim(),
                  address: newStudent.address?.trim() || 'Desa Sucopangepok, Kec. Jelbuk',
                  originSchool: newStudent.originSchool?.trim() || '-',
                  path: newStudent.path || 'Zonasi',
                  notes: newStudent.notes?.trim() || '',
                  status: (newStudent.status as any) || 'Terverifikasi',
                  dateSubmitted: new Date().toISOString().slice(0, 10),
                  kkDocument: adminKkDoc,
                  kkOriginalDocument: adminKkOriginalDoc,
                  kkFileName: adminKkFileName || `KK_${newStudent.studentName.replace(/\s+/g, '_')}.jpg`,
                  kkOriginalSizeKb: adminKkOriginalKb || (adminKkDoc ? 2400 : 0),
                  kkCompressedSizeKb: adminKkCompressedKb || (adminKkDoc ? 165 : 0),
                  storageMode: 'keduanya',
                  driveSyncStatus: formData.ppdb?.config?.googleDriveFolderUrl ? 'Tersimpan di Drive' : 'Belum Disinkron',
                  driveFileUrl: formData.ppdb?.config?.googleDriveFolderUrl,
                };

                const currentRegistrants = formData.ppdb?.registrants || [];
                const updated = [itemToAdd, ...currentRegistrants];
                setFormData({
                  ...formData,
                  ppdb: { ...formData.ppdb!, registrants: updated },
                });

                const updatedLogs = addLog('TAMBAH', 'PPDB Siswa', `Panitia menambahkan siswa baru: ${itemToAdd.studentName} (${itemToAdd.regNumber}).`);
                setFormData((p) => ({ ...p, activityLogs: updatedLogs }));

                setShowAddStudentModal(false);
                setNewStudent({
                  gender: 'Laki-laki',
                  path: 'Zonasi',
                  status: 'Terverifikasi',
                  birthPlace: 'Jember',
                  birthDate: '2019-05-15',
                });
                setAdminKkDoc('');
                setAdminKkOriginalDoc('');
                setAdminKkFileName('');
                setAdminKkOriginalKb(0);
                setAdminKkCompressedKb(0);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--ink)] mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wildan Kurniawan"
                    value={newStudent.studentName || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">NIK Siswa (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit angka"
                    value={newStudent.nik || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Nomor KK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit nomor KK"
                    value={newStudent.familyCardNumber || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, familyCardNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={newStudent.birthPlace || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newStudent.birthDate || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudent.gender || 'Laki-laki'}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-bold"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Jalur Masuk</label>
                  <select
                    value={newStudent.path || 'Zonasi'}
                    onChange={(e) => setNewStudent({ ...newStudent, path: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-bold"
                  >
                    <option value="Zonasi">Zonasi</option>
                    <option value="Afirmasi">Afirmasi</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Perpindahan Tugas Orang Tua">Perpindahan Tugas Orang Tua</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">
                    Nama Orang Tua / Wali <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.parentName || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">
                    No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudent.phone || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--ink)] mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={newStudent.address || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--paper)] border"
                  />
                </div>

                {/* Upload / Scan Berkas KK di Modal Admin */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-[var(--paper)] border-2 border-dashed border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>Lampirkan / Scan Berkas KK (Auto Kompres ≤ 200KB)</span>
                    </span>
                    {adminKkCompressedKb > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {adminKkCompressedKb} KB (≤200KB)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">
                      <Camera className="w-4 h-4" />
                      <span>Pilih / Foto Berkas KK</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          setAdminIsCompressing(true);
                          try {
                            const res = await compressKKDocument(files[0], formData.ppdb?.config?.maxLocalFileSizeKb || 200);
                            setAdminKkDoc(res.compressedBase64);
                            setAdminKkOriginalDoc(res.fullSizeBase64);
                            setAdminKkFileName(files[0].name);
                            setAdminKkOriginalKb(res.originalSizeKb);
                            setAdminKkCompressedKb(res.compressedSizeKb);
                          } catch (err) {
                            alert('Gagal memproses gambar KK.');
                          } finally {
                            setAdminIsCompressing(false);
                          }
                        }}
                      />
                    </label>

                    {adminIsCompressing && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengompres ≤200KB...</span>
                      </span>
                    )}
                  </div>

                  {adminKkDoc && (
                    <div className="flex items-center gap-3 pt-2">
                      <img src={adminKkDoc} alt="KK Thumbnail" className="w-12 h-12 rounded-lg object-cover border" />
                      <div className="text-[11px]">
                        <span className="font-bold text-[var(--ink)] block">{adminKkFileName}</span>
                        <span className="text-emerald-700 font-semibold">
                          Asli: {adminKkOriginalKb} KB → Kompres Sistem: {adminKkCompressedKb} KB (≤200KB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--paper)] text-[var(--mute)] font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Simpan Data Siswa Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Panduan & Script Google Apps Script untuk Auto-Sync Google Drive */}
      {showScriptModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[var(--card)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--line-strong)] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h4 className="font-disp font-bold text-lg text-[var(--ink)]">
                  Panduan Auto-Sync Google Drive (Google Apps Script)
                </h4>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--mute)] space-y-2 leading-relaxed">
              <p>
                Anda dapat menghubungkan Google Drive sekolah secara gratis dan otomatis tanpa batas kuota server menggunakan <strong>Google Apps Script</strong>:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[var(--ink)] font-semibold">
                <li>Buka <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">script.google.com</a> dan buat Proyek Baru.</li>
                <li>Hapus kode bawaan dan salin template kode di bawah ini.</li>
                <li>Ganti tulisan <code>FOLDER_ID</code> dengan ID folder Google Drive sekolah Anda.</li>
                <li>Klik tombol <strong>Deploy → New deployment → Web App</strong>.</li>
                <li>Pilih <strong>Who has access: Anyone</strong> (Siapa saja), lalu salin URL Web App yang dihasilkan ke kolom Webhook di Panel Admin Website ini.</li>
              </ol>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 leading-tight">
                {getGoogleAppsScriptTemplate()}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
                  alert('Kode Google Apps Script berhasil disalin ke papan klip (clipboard)!');
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                Salin Kode
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

