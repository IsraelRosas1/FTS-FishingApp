// Firebase Storage utilities
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/src/firebaseConfig';

export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload blob
    const snapshot = await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const generateImagePath = (userId: string, type: 'catch' | 'post' | 'profile', fileName: string): string => {
  const timestamp = Date.now();
  return `users/${userId}/${type === 'profile' ? 'profile' : `${type}s`}/${timestamp}_${fileName}`;
};