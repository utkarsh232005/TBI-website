/**
 * Database Utilities for Base64 Image Storage
 * 
 * This module provides utilities for storing and retrieving Base64 images in Firestore.
 * It's designed to be easily replaceable when migrating to Firebase Storage.
 */

import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { isBase64Image, getBase64Size } from './image-upload';

// Types for Base64 image metadata
export interface ImageMetadata {
  id: string;
  originalName?: string;
  mimeType: string;
  size: number;
  uploadedAt: Timestamp;
  uploadedBy?: string;
  description?: string;
}

export interface StoredImage {
  data: string; // Base64 string
  metadata: ImageMetadata;
}

/**
 * Store a Base64 image in Firestore with metadata
 * This function will be replaced when migrating to Firebase Storage
 */
export async function storeBase64Image(
  imageData: string,
  collectionName: string,
  documentId: string,
  fieldName: string,
  metadata: Partial<ImageMetadata> = {}
): Promise<boolean> {
  try {
    if (!isBase64Image(imageData)) {
      console.warn('Provided data is not a Base64 image, storing as URL');
      // If it's not Base64, just store the URL directly
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        [fieldName]: imageData
      });
      return true;
    }

    // Extract MIME type from Base64 string
    const mimeMatch = imageData.match(/data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // Create image metadata
    const imageMetadata: ImageMetadata = {
      id: `${documentId}_${fieldName}_${Date.now()}`,
      mimeType,
      size: getBase64Size(imageData),
      uploadedAt: Timestamp.now(),
      ...metadata
    };

    // Store in document
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      [fieldName]: imageData,
      [`${fieldName}_metadata`]: imageMetadata
    });

    console.log(`Base64 image stored successfully: ${imageMetadata.id}`);
    return true;
  } catch (error) {
    console.error('Error storing Base64 image:', error);
    return false;
  }
}

/**
 * Retrieve a Base64 image from Firestore
 */
export async function retrieveBase64Image(
  collectionName: string,
  documentId: string,
  fieldName: string
): Promise<StoredImage | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const imageData = data[fieldName];
    const metadata = data[`${fieldName}_metadata`];

    if (!imageData) {
      return null;
    }

    return {
      data: imageData,
      metadata: metadata || {
        id: `${documentId}_${fieldName}`,
        mimeType: 'image/jpeg',
        size: isBase64Image(imageData) ? getBase64Size(imageData) : 0,
        uploadedAt: Timestamp.now()
      }
    };
  } catch (error) {
    console.error('Error retrieving Base64 image:', error);
    return null;
  }
}

/**
 * Delete a Base64 image from Firestore
 */
export async function deleteBase64Image(
  collectionName: string,
  documentId: string,
  fieldName: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      [fieldName]: null,
      [`${fieldName}_metadata`]: null
    });
    
    console.log(`Base64 image deleted successfully from ${collectionName}/${documentId}`);
    return true;
  } catch (error) {
    console.error('Error deleting Base64 image:', error);
    return false;
  }
}

/**
 * Get statistics about Base64 image storage usage
 * Useful for monitoring and cleanup
 */
export async function getImageStorageStats(
  collectionName: string,
  documentId: string
): Promise<{
  totalImages: number;
  totalSize: number;
  images: Array<{ field: string; size: number; metadata: ImageMetadata }>;
}> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { totalImages: 0, totalSize: 0, images: [] };
    }

    const data = docSnap.data();
    const images: Array<{ field: string; size: number; metadata: ImageMetadata }> = [];
    let totalSize = 0;

    // Find all Base64 images in the document
    Object.keys(data).forEach(key => {
      if (isBase64Image(data[key])) {
        const size = getBase64Size(data[key]);
        const metadataKey = `${key}_metadata`;
        const metadata = data[metadataKey] || {
          id: `${documentId}_${key}`,
          mimeType: 'image/jpeg',
          size,
          uploadedAt: Timestamp.now()
        };

        images.push({
          field: key,
          size,
          metadata
        });
        totalSize += size;
      }
    });

    return {
      totalImages: images.length,
      totalSize,
      images
    };
  } catch (error) {
    console.error('Error getting image storage stats:', error);
    return { totalImages: 0, totalSize: 0, images: [] };
  }
}

/**
 * Cleanup utility to convert Base64 images to Firebase Storage
 * This will be useful during migration
 */
export async function prepareForFirebaseStorageMigration(
  collectionName: string,
  documentId: string
): Promise<{
  success: boolean;
  imagesToMigrate: Array<{ field: string; data: string; metadata: ImageMetadata }>;
  error?: string;
}> {
  try {
    const stats = await getImageStorageStats(collectionName, documentId);
    
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, imagesToMigrate: [], error: 'Document not found' };
    }

    const data = docSnap.data();
    const imagesToMigrate = stats.images.map(img => ({
      field: img.field,
      data: data[img.field],
      metadata: img.metadata
    }));

    return {
      success: true,
      imagesToMigrate
    };
  } catch (error) {
    return {
      success: false,
      imagesToMigrate: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Utility to check if current storage method is Base64
 */
export function isUsingBase64Storage(): boolean {
  // This can be configured via environment variables later
  return true; // Currently always using Base64
}

/**
 * Get recommended migration strategy based on current usage
 */
export function getMigrationRecommendation(totalSize: number, totalImages: number): {
  shouldMigrate: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high';
} {
  const sizeInMB = totalSize / (1024 * 1024);
  
  if (sizeInMB > 50) {
    return {
      shouldMigrate: true,
      reason: `Large storage usage (${sizeInMB.toFixed(2)}MB) detected. Firebase Storage recommended.`,
      priority: 'high'
    };
  }
  
  if (totalImages > 100) {
    return {
      shouldMigrate: true,
      reason: `High image count (${totalImages}) detected. Firebase Storage recommended for better performance.`,
      priority: 'medium'
    };
  }
  
  if (sizeInMB > 10) {
    return {
      shouldMigrate: true,
      reason: `Moderate storage usage (${sizeInMB.toFixed(2)}MB). Consider Firebase Storage for better performance.`,
      priority: 'low'
    };
  }
  
  return {
    shouldMigrate: false,
    reason: `Current usage (${totalImages} images, ${sizeInMB.toFixed(2)}MB) is within acceptable limits for Base64 storage.`,
    priority: 'low'
  };
}
