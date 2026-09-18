import { ref, uploadBytes, getDownloadURL, updateMetadata, listAll } from 'firebase/storage';
import { getStorageRef } from '../config/firebase';
import { File, Directory, Paths } from 'expo-file-system';

/**
 * Upload a base64-encoded image to Firebase Storage.
 *
 * React Native's Blob polyfill cannot create Blobs from ArrayBuffer /
 * Uint8Array, so both `uploadBytes(ref, uint8array)` and
 * `uploadString(ref, base64, 'base64')` crash with:
 *   "Creating blobs from ArrayBuffer and ArrayBufferView are not supported"
 *
 * Workaround:
 *  1. Write the base64 to a temp file via expo-file-system (decodes natively).
 *  2. `fetch()` that local `file://` URI → RN returns a real native Blob.
 *  3. Pass the Blob to `uploadBytes` — Firebase sees a native Blob and
 *     uploads without ever touching ArrayBuffer.
 *  4. Clean up the temp file.
 */
export async function uploadImage(base64Data: string, path: string, contentType = 'image/jpeg'): Promise<string> {
  if (!base64Data || base64Data.length === 0) {
    throw new Error('Image data is empty — please try a different photo');
  }

  // Strip data-URI prefix if accidentally included
  const raw = base64Data.replace(/^data:[^;]+;base64,/, '');
  const approxBytes = Math.round((raw.length * 3) / 4);
  console.log(`Uploading image: ${path} (~${approxBytes} bytes, ${contentType})`);

  // 1. Write base64 → binary temp file
  const ext = contentType === 'image/png' ? 'png' : 'jpg';
  const tmpName = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const tmpDir = new Directory(Paths.cache, 'uploads');
  if (!tmpDir.exists) {
    tmpDir.create();
  }
  const tmpFile = new File(tmpDir, tmpName);
  tmpFile.create();
  tmpFile.write(raw, { encoding: 'base64' });
  console.log(`Temp file written: ${tmpFile.uri} (exists: ${tmpFile.exists})`);

  try {
    // 2. fetch() the local file → native Blob (no ArrayBuffer involved)
    const blobResponse = await fetch(tmpFile.uri);
    const blob = await blobResponse.blob();
    console.log(`Blob created: ${blob.size} bytes, type: ${blob.type}`);

    // 3. Upload to Firebase Storage
    const storageRef = ref(getStorageRef(), path);
    await uploadBytes(storageRef, blob, { contentType });

    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Upload complete, URL: ${downloadURL.substring(0, 80)}...`);
    return downloadURL;
  } finally {
    // 4. Clean up temp file
    try { tmpFile.delete(); } catch { /* ignore cleanup errors */ }
  }
}

/**
 * Upload multiple base64 images for a business.
 * @param businessId Firestore document ID
 * @param base64Images Array of raw base64 strings
 */
export async function uploadBusinessPhotos(
  businessId: string,
  base64Images: string[]
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < base64Images.length; i++) {
    const path = `businesses/${businessId}/photo_${i}_${Date.now()}`;
    const url = await uploadImage(base64Images[i], path);
    urls.push(url);
  }
  return urls;
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
          console.warn('Failed to update metadata for', itemRef.fullPath, e);
        }
      }
    }

    for (const itemRef of result.items) {
      try {
        await updateMetadata(itemRef, { contentType: 'image/jpeg' });
        fixed++;
      } catch (e) {
        console.warn('Failed to update metadata for', itemRef.fullPath, e);
      }
    }

    if (fixed > 0) console.log(`Fixed content type for ${fixed} storage files`);
    return fixed;
  } catch (e) {
    console.warn('fixStorageContentTypes: could not list storage:', e);
    return 0;
  }
}
