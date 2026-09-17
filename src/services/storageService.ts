import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytesResumable(storageRef, blob);
  return getDownloadURL(snapshot.ref);
}

export async function uploadBusinessPhotos(
  businessId: string,
  imageUris: string[]
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < imageUris.length; i++) {
    const path = `businesses/${businessId}/photo_${i}_${Date.now()}`;
    const url = await uploadImage(imageUris[i], path);
    urls.push(url);
  }
  return urls;
}
