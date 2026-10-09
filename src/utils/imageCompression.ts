import { File, Directory, Paths } from 'expo-file-system';
import { logger } from './logger';

/** Maximum width/height for uploaded images (preserves aspect ratio). */
const MAX_DIMENSION = 1200;
/** JPEG quality 0–1 (0.7 ≈ good quality at ~30 % of original size). */
const COMPRESS_QUALITY = 0.7;

/**
 * Compress and resize a base64-encoded image before upload.
 *
 * Flow:
 *   1. Write raw base64 → temp file (ImageManipulator needs a URI).
 *   2. Resize so the longest side ≤ MAX_DIMENSION.
 *   3. Re-encode as JPEG at COMPRESS_QUALITY.
 *   4. Return the optimised base64 string (no data-URI prefix).
 */
export async function compressImage(
  base64Data: string,
  maxDimension = MAX_DIMENSION,
): Promise<string> {
  // Lazy-import to avoid breaking the upload pipeline if the native module
  // fails to load for any reason (the caller falls back to the original).
  const ImageManipulator = require('expo-image-manipulator') as typeof import('expo-image-manipulator');
  const { SaveFormat } = ImageManipulator;

  // --- 1. write base64 to a temp file so we have a file:// URI ---------
  const tmpDir = new Directory(Paths.cache, 'img_compress');
  if (!tmpDir.exists) tmpDir.create();

  const tmpName = `src_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const tmpFile = new File(tmpDir, tmpName);
  tmpFile.create();
  tmpFile.write(base64Data, { encoding: 'base64' });

  const originalSize = tmpFile.size ?? 0;
  logger.log(`[compress] Original ≈${(originalSize / 1024).toFixed(0)} KB`);

  try {
    // --- 2 + 3. resize → compress → save --------------------------------
    const context = ImageManipulator.manipulate(tmpFile.uri);
    const rendered = await context
      .resize({ width: maxDimension, height: null })
      .renderAsync();

    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: COMPRESS_QUALITY,
      base64: true,
    });

    if (!result.base64) {
      throw new Error('ImageManipulator returned no base64 data');
    }

    const compressedApprox = Math.round((result.base64.length * 3) / 4);
    const ratio = originalSize > 0
      ? ((1 - compressedApprox / originalSize) * 100).toFixed(0)
      : '?';
    logger.log(
      `[compress] Compressed ≈${(compressedApprox / 1024).toFixed(0)} KB (−${ratio} %), ` +
      `${result.width}×${result.height}`,
    );

    return result.base64;
  } finally {
    try { tmpFile.delete(); } catch { /* ignore */ }
  }
}
