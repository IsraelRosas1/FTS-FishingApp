// Firebase Storage utilities
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Skip if not a Firebase Storage URL
    if (!url.includes('firebasestorage.googleapis.com')) {
      console.log('Not a Firebase Storage URL, skipping deletion');
      return;
    }

    // Extract the path from the Firebase Storage URL
    const path = url.split('/o/')[1]?.split('?')[0];
    if (!path) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Decode the path
    const decodedPath = decodeURIComponent(path);

    // Create storage reference
    const storageRef = ref(storage, decodedPath);

    // Delete the file
    await deleteObject(storageRef);
    console.log('Successfully deleted image from Firebase Storage');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const deleteVideo = async (url: string): Promise<void> => {
  try {
    // Skip if not a Firebase Storage URL
    if (!url.includes('firebasestorage.googleapis.com')) {
      console.log('Not a Firebase Storage URL, skipping deletion');
      return;
    }

    // Extract the path from the Firebase Storage URL
    const path = url.split('/o/')[1]?.split('?')[0];
    if (!path) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Decode the path
    const decodedPath = decodeURIComponent(path);

    // Create storage reference
    const storageRef = ref(storage, decodedPath);

    // Delete the file
    await deleteObject(storageRef);
    console.log('Successfully deleted video from Firebase Storage');
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

export const uploadVideo = async (uri: string, path: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload blob with video content type
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'video/mp4'
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const generateVideoPath = (userId: string, type: 'post', fileName: string): string => {
  const timestamp = Date.now();
  return `users/${userId}/${type}/videos/${timestamp}_${fileName}`;
};

export const generateImagePath = (userId: string, type: 'catch' | 'post' | 'profile', fileName: string): string => {
  const timestamp = Date.now();
  return `users/${userId}/${type === 'profile' ? 'profile' : `${type}s`}/${timestamp}_${fileName}`;
};