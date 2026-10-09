import { ref, getDownloadURL, updateMetadata, listAll } from 'firebase/storage';
import { getStorageRef } from '../config/firebase';
import { auth } from '../config/firebase';
import { File, Directory, Paths } from 'expo-file-system';
import { logger } from '../utils/logger';
import { compressImage } from '../utils/imageCompression';

/**
 * Upload a base64-encoded image to Firebase Storage.
 *
 * React Native's Blob polyfill in Expo Go is broken — `fetch(file://).blob()`
 * returns truncated data (e.g. 14 bytes from a 33 KB file). To avoid all JS
 * Blob issues we use expo-file-system's native `File.upload()` which sends the
 * file via the platform's native HTTP stack, completely bypassing RN's JS
 * networking and Blob layers.
 */
export async function uploadImage(base64Data: string, path: string, contentType = 'image/jpeg'): Promise<string> {
  if (!base64Data || base64Data.length === 0) {
    throw new Error('Image data is empty — please try a different photo');
  }

  // Strip data-URI prefix if accidentally included
  const raw = base64Data.replace(/^data:[^;]+;base64,/, '');
  const approxBytes = Math.round((raw.length * 3) / 4);
  logger.log(`[upload] path=${path}, ~${approxBytes} bytes, type=${contentType}`);

  // Compress & resize before uploading (saves bandwidth + storage quota).
  // Timeout ensures a stuck ImageManipulator can't block the upload forever.
  let optimised: string;
  try {
    optimised = await Promise.race([
      compressImage(raw),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Image compression timed out')), 15_000),
      ),
    ]);
  } catch (e) {
    logger.warn('[upload] Image compression failed, uploading original', e);
    optimised = raw;
  }

  // 1. Write compressed base64 → binary temp file
  const ext = contentType === 'image/png' ? 'png' : 'jpg';
  const tmpName = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const tmpDir = new Directory(Paths.cache, 'uploads');
  if (!tmpDir.exists) {
    tmpDir.create();
  }
  const tmpFile = new File(tmpDir, tmpName);
  tmpFile.create();
  tmpFile.write(optimised, { encoding: 'base64' });

  const fileSize = tmpFile.size;
  logger.log(`[upload] Temp file: ${tmpFile.uri}, size=${fileSize}`);

  if (fileSize < 100) {
    tmpFile.delete();
    throw new Error(`Temp file too small (${fileSize} bytes) — image data may be corrupt`);
  }

  try {
    // 2. Get Firebase auth token
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Not authenticated — cannot upload');
    }

    // 3. Build the Firebase Storage REST upload URL
    //    https://firebase.google.com/docs/reference/rest/storage/rest/v0/b/o/insert
    const storage = getStorageRef();
    const bucket = storage.app.options.storageBucket;
    const encodedPath = encodeURIComponent(path);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodedPath}`;

    logger.log(`[upload] Native upload to ${bucket}/${path}`);

    // 4. Upload via expo-file-system native HTTP (bypasses JS Blob entirely)
    const result = await tmpFile.upload(uploadUrl, {
      httpMethod: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType,
      },
      sessionType: 'foreground',
    });

    logger.log(`[upload] Response: status=${result.status}`);

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload failed (${result.status}): ${result.body}`);
    }

    // 5. Get the download URL via Firebase SDK
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    logger.log(`[upload] Done: ${downloadURL.substring(0, 80)}...`);
    return downloadURL;
  } finally {
    try { tmpFile.delete(); } catch { /* ignore */ }
  }
}

/**
 * Upload multiple base64 images for a business.
 *
 * Storage path: businesses/{uid}/{businessId}/photo_...
 * Storage rules enforce that {uid} == request.auth.uid, so only the
 * business owner can write photos into their folder.
 *
 * @param businessId Firestore document ID
 * @param base64Images Array of raw base64 strings
 */
export async function uploadBusinessPhotos(
  businessId: string,
  base64Images: string[]
): Promise<string[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated — cannot upload photos');

  const urls: string[] = [];
  for (let i = 0; i < base64Images.length; i++) {
    const path = `businesses/${uid}/${businessId}/photo_${i}_${Date.now()}.jpg`;
    const url = await uploadImage(base64Images[i], path);
    urls.push(url);
  }
  return urls;
}

/**
 * Upload a single profile photo for a lawyer/attorney.
 *
 * Storage path: lawyers/{uid}/{lawyerId}/photo_{timestamp}.jpg
 * Storage rules enforce that {uid} == request.auth.uid.
 *
 * @param lawyerId Firestore document ID
 * @param base64Data Raw base64 string
 */
export async function uploadLawyerPhoto(
  lawyerId: string,
  base64Data: string
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated — cannot upload photo');

  const path = `lawyers/${uid}/${lawyerId}/photo_${Date.now()}.jpg`;
  return uploadImage(base64Data, path);
}

/**
 * Fix existing files in Storage that have application/octet-stream content type.
 * Changes them to image/jpeg so they render correctly in <Image>.
 */
export async function fixStorageContentTypes(): Promise<number> {
  try {
    const storage = getStorageRef();
    const businessesRef = ref(storage, 'businesses');
    const result = await listAll(businessesRef);

    let fixed = 0;
    for (const folderRef of result.prefixes) {
      const files = await listAll(folderRef);
      for (const itemRef of files.items) {
        try {
          await updateMetadata(itemRef, { contentType: 'image/jpeg' });
          fixed++;
        } catch (e) {
          logger.warn('Failed to update metadata for', itemRef.fullPath, e);
        }
      }
    }

    for (const itemRef of result.items) {
      try {
        await updateMetadata(itemRef, { contentType: 'image/jpeg' });
        fixed++;
      } catch (e) {
        logger.warn('Failed to update metadata for', itemRef.fullPath, e);
      }
    }

    if (fixed > 0) logger.log(`Fixed content type for ${fixed} storage files`);
    return fixed;
  } catch (e) {
    logger.warn('fixStorageContentTypes: could not list storage:', e);
    return 0;
  }
}
