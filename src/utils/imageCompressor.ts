/**
 * Image Compressor Utility for SD Negeri Sucopangepok 04
 * Auto-compresses uploaded documents (e.g., Kartu Keluarga / KK)
 * to strictly <= 200KB for system storage, while preserving full size for Google Drive.
 */

export interface CompressionResult {
  compressedBase64: string;
  fullSizeBase64: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  fileName: string;
  dimensions: {
    width: number;
    height: number;
  };
  compressionRatio: number; // percentage reduction e.g. 85%
  isUnderLimit: boolean;
}

const MAX_TARGET_BYTES = 200 * 1024; // 200 KB in bytes (204,800 bytes)

/**
 * Calculates approximate byte size of a base64 data URL
 */
export function getBase64ByteSize(base64String: string): number {
  if (!base64String) return 0;
  const head = base64String.indexOf(',');
  const cleanBase64 = head !== -1 ? base64String.slice(head + 1) : base64String;
  const padding = (cleanBase64.match(/=/g) || []).length;
  return Math.round((cleanBase64.length * 3) / 4) - padding;
}

/**
 * Compresses an image file or base64 to strictly under 200KB
 */
export async function compressKKDocument(
  file: File,
  maxKb: number = 200
): Promise<CompressionResult> {
  const targetBytes = maxKb * 1024;

  // 1. Read original file as Data URL
  const fullSizeBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const originalSizeBytes = file.size || getBase64ByteSize(fullSizeBase64);
  const originalSizeKb = Math.round(originalSizeBytes / 1024);

  // 2. Load into HTML Image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = fullSizeBase64;
  });

  let curWidth = img.naturalWidth || img.width;
  let curHeight = img.naturalHeight || img.height;

  // Initial bound check: Cap max dimension to 1400px to ensure crisp KK document text without wasted pixels
  const MAX_DIMENSION = 1400;
  if (curWidth > MAX_DIMENSION || curHeight > MAX_DIMENSION) {
    if (curWidth >= curHeight) {
      curHeight = Math.round((curHeight * MAX_DIMENSION) / curWidth);
      curWidth = MAX_DIMENSION;
    } else {
      curWidth = Math.round((curWidth * MAX_DIMENSION) / curHeight);
      curHeight = MAX_DIMENSION;
    }
  }

  // 3. Iterative canvas compression down to strictly <= 200KB
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  canvas.width = curWidth;
  canvas.height = curHeight;

  // Fill white background for transparent PNG/Scans to avoid black artifacts
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, curWidth, curHeight);
  ctx.drawImage(img, 0, 0, curWidth, curHeight);

  let quality = 0.85;
  let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
  let currentBytes = getBase64ByteSize(compressedBase64);

  // If already under target and original was within limit, we're golden
  let attempts = 0;
  while (currentBytes > targetBytes && attempts < 15) {
    attempts++;
    if (quality > 0.4) {
      // Step down quality first
      quality -= 0.12;
    } else {
      // Reduce dimensions if quality is already low
      curWidth = Math.round(curWidth * 0.82);
      curHeight = Math.round(curHeight * 0.82);
      canvas.width = curWidth;
      canvas.height = curHeight;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, curWidth, curHeight);
      ctx.drawImage(img, 0, 0, curWidth, curHeight);
      quality = 0.65;
    }

    compressedBase64 = canvas.toDataURL('image/jpeg', Math.max(quality, 0.1));
    currentBytes = getBase64ByteSize(compressedBase64);
  }

  const compressedSizeKb = Math.round(currentBytes / 1024);
  const reduction = originalSizeKb > 0 
    ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
    : 0;

  return {
    compressedBase64,
    fullSizeBase64,
    originalSizeKb,
    compressedSizeKb,
    fileName: file.name,
    dimensions: {
      width: curWidth,
      height: curHeight,
    },
    compressionRatio: reduction,
    isUnderLimit: currentBytes <= targetBytes,
  };
}

/**
 * Downloads a base64 string as a file
 */
export function downloadBase64File(base64Data: string, fileName: string) {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
