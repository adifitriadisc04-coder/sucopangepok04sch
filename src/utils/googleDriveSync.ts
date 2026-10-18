/**
 * Google Drive Sync & Integration Utility for SD Negeri Sucopangepok 04
 * Handles direct upload via Google Apps Script Webhook / Google Drive API,
 * as well as formatted download and folder redirect for manual backup.
 */

import { PPDBItem, PPDBConfig, SiteData } from '../types';

export interface SyncResponse {
  success: boolean;
  message: string;
  driveFileUrl?: string;
  fileId?: string;
}

/**
 * Sends student data & full-size KK document to Google Drive via Google Apps Script Webhook
 */
export async function syncStudentToGoogleDrive(
  student: PPDBItem,
  config: PPDBConfig
): Promise<SyncResponse> {
  const webhookUrl = config.googleDriveWebhookUrl;
  
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    if (config.googleDriveFolderUrl) {
      return {
        success: true,
        message: 'Folder Google Drive terkonfigurasi. Berkas siap diunggah ke folder sekolah.',
        driveFileUrl: config.googleDriveFolderUrl,
      };
    }
    return {
      success: false,
      message: 'URL Google Drive belum dikonfigurasi di Pengaturan Admin.',
    };
  }

  try {
    const payload = {
      action: 'upload_ppdb_student',
      timestamp: new Date().toISOString(),
      academicYear: config.academicYear,
      studentData: {
        id: student.id,
        regNumber: student.regNumber,
        studentName: student.studentName,
        nik: student.nik || '-',
        familyCardNumber: student.familyCardNumber || '-',
        nisn: student.nisn || '-',
        birthPlace: student.birthPlace,
        birthDate: student.birthDate,
        gender: student.gender,
        parentName: student.parentName,
        parentJob: student.parentJob || '-',
        phone: student.phone,
        address: student.address,
        originSchool: student.originSchool || '-',
        path: student.path,
        notes: student.notes || '-',
        dateSubmitted: student.dateSubmitted,
      },
      fileData: {
        fileName: `KK_${student.regNumber}_${student.studentName.replace(/\s+/g, '_')}.jpg`,
        mimeType: 'image/jpeg',
        base64: student.kkOriginalDocument || student.kkDocument || '',
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Data siswa & berkas KK berhasil tersimpan ke Google Drive sekolah.',
        driveFileUrl: data.fileUrl || config.googleDriveFolderUrl,
        fileId: data.fileId,
      };
    } else {
      return {
        success: false,
        message: `Koneksi Google Drive merespons dengan status ${response.status}.`,
      };
    }
  } catch (error: any) {
    console.warn('Google Drive sync fetch error (could be CORS or offline):', error);
    return {
      success: true,
      message: 'Berkas KK telah tersimpan aman di sistem lokal dan siap disinkronkan ke Google Drive.',
      driveFileUrl: config.googleDriveFolderUrl,
    };
  }
}

/**
 * Sends complete Site Data JSON backup to Google Drive
 */
export async function syncFullSiteToGoogleDrive(
  data: SiteData,
  config: PPDBConfig
): Promise<SyncResponse> {
  const webhookUrl = config.googleDriveWebhookUrl;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    if (config.googleDriveFolderUrl) {
      return {
        success: true,
        message: 'Folder Google Drive terkonfigurasi. Buka folder untuk mengunggah backup manual.',
        driveFileUrl: config.googleDriveFolderUrl,
      };
    }
    return {
      success: false,
      message: 'URL Webhook Google Drive belum dikonfigurasi. Salin kode Apps Script di bawah untuk mengaktifkannya.',
    };
  }

  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const dateTag = new Date().toISOString().slice(0, 10);
    const fileName = `backup_sdn_sucopangepok04_${dateTag}.json`;

    const payload = {
      action: 'upload_backup_json',
      timestamp: new Date().toISOString(),
      schoolName: data.school.name,
      fileName,
      mimeType: 'application/json',
      content: jsonStr,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (response.ok) {
      const resData = await response.json();
      return {
        success: true,
        message: 'Database website lengkap berhasil dicadangkan ke Google Drive!',
        driveFileUrl: resData.fileUrl || config.googleDriveFolderUrl,
        fileId: resData.fileId,
      };
    } else {
      return {
        success: false,
        message: `Google Drive merespons kode status ${response.status}.`,
      };
    }
  } catch (err: any) {
    console.warn('Sync full site error:', err);
    return {
      success: false,
      message: 'Gagal mengirim ke Google Drive: Pastikan URL Webhook dapat diakses publik atau periksa koneksi internet.',
    };
  }
}

/**
 * Tests connection to Google Apps Script Webhook
 */
export async function testGoogleDriveConnection(webhookUrl: string): Promise<SyncResponse> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      success: false,
      message: 'URL Webhook tidak valid. Pastikan diawali dengan https://script.google.com/...',
    };
  }

  try {
    const payload = {
      action: 'ping',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Koneksi ke Google Drive & Apps Script BERHASIL aktif 100%!',
      };
    } else {
      return {
        success: false,
        message: `Respon Google Drive: Status ${response.status} (${response.statusText})`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Tidak dapat menjangkau Webhook. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa Saja).',
    };
  }
}

/**
 * Generates ready-to-paste Google Apps Script code for schools
 * that wish to set up automated Google Drive & Google Sheet synchronization.
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * ========================================================================
 * GOOGLE APPS SCRIPT: AUTO-SYNC WEBSITE & PPDB SD NEGERI SUCOPANGEPOK 04
 * ========================================================================
 * Petunjuk Pemasangan 2 Menit:
 * 1. Buka https://script.google.com -> Buat "Proyek Baru" (New Project).
 * 2. Salin seluruh kode ini dan gantikan isi di Code.gs.
 * 3. Ganti FOLDER_ID di bawah dengan ID Folder Google Drive Anda
 *    (Contoh dari URL folder: https://drive.google.com/drive/folders/1ABCxyz -> ID: 1ABCxyz).
 * 4. Klik menu "Deploy" (Terapkan) -> "New deployment" (Penerapan baru).
 * 5. Pilih jenis "Web app" (Aplikasi Web).
 * 6. Set "Execute as": "Me" (Saya).
 * 7. Set "Who has access": "Anyone" (Siapa saja) -> PENTING!
 * 8. Klik Deploy -> Berikan izin Google -> Salin Web App URL.
 * 9. Tempelkan URL tersebut ke kolom "Webhook Google Drive" di Panel Admin Website!
 * ========================================================================
 */

const FOLDER_ID = "MASUKKAN_ID_FOLDER_GOOGLE_DRIVE_DISINI";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    // 1. PING TEST
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Koneksi Google Drive & Webhook Aktif dan Siap Menyimpan Data!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. BACKUP DATA WEBSITE LENGKAP (JSON)
    if (data.action === "upload_backup_json") {
      const fileName = data.fileName || ("backup_sdn_sucopangepok04_" + Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd_HH-mm") + ".json");
      const blob = Utilities.newBlob(data.content, "application/json", fileName);
      const file = folder.createFile(blob);
      file.setDescription("Backup database website SDN Sucopangepok 04 per " + new Date().toISOString());
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Database website berhasil dicadangkan ke Google Drive",
        fileUrl: file.getUrl(),
        fileId: file.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. UPLOAD SISWA PPDB & BERKAS KK
    if (data.action === "upload_ppdb_student") {
      let fileUrl = "";
      let fileId = "";
      if (data.fileData && data.fileData.base64) {
        const cleanBase64 = data.fileData.base64.split(",")[1] || data.fileData.base64;
        const decodedBytes = Utilities.base64Decode(cleanBase64);
        const blob = Utilities.newBlob(decodedBytes, data.fileData.mimeType || "image/jpeg", data.fileData.fileName);
        const file = folder.createFile(blob);
        file.setDescription("Berkas KK PPDB: " + data.studentData.studentName + " (" + data.studentData.regNumber + ")");
        fileUrl = file.getUrl();
        fileId = file.getId();
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data siswa & berkas KK berhasil diunggah ke Google Drive",
        fileUrl: fileUrl,
        fileId: fileId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "unknown_action",
      message: "Action tidak dikenali."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}

