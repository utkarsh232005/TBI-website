/**
 * Image Upload Utility Module
 * 
 * This module provides an abstracted interface for image uploads.
 * Currently implements Base64 storage but can be easily replaced with Firebase Storage.
 * 
 * Architecture:
 * - ImageUploadProvider: Abstract interface for different storage backends
 * - Base64ImageProvider: Current implementation using Base64 encoding
 * - uploadImage: Main function that uses the configured provider
 */

// Types
export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    type: string;
    name: string;
  };
}

export interface ImageUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  quality?: number; // 0.1 to 1.0 for JPEG compression
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageUploadProvider {
  uploadImage(file: File, options?: ImageUploadOptions): Promise<ImageUploadResult>;
  deleteImage?(url: string): Promise<boolean>;
  getImageUrl?(identifier: string): string;
}

// Default options
const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
};

/**
 * Base64 Image Provider - Temporary implementation
 * 
 * This provider converts images to Base64 and stores them directly in the database.
 * It's designed to be easily replaceable with Firebase Storage later.
 */
class Base64ImageProvider implements ImageUploadProvider {
  async uploadImage(file: File, options: ImageUploadOptions = {}): Promise<ImageUploadResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      // Validate file type
      if (!opts.allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`,
        };
      }

      // Validate file size
      if (file.size > opts.maxSizeBytes) {
        return {
          success: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${(opts.maxSizeBytes / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Process and compress image if needed
      const processedDataUrl = await this.processImage(file, opts);
      
      return {
        success: true,
        url: processedDataUrl,
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
        },
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async processImage(file: File, options: Required<ImageUploadOptions>): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not create canvas context'));
              return;
            }

            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = this.calculateDimensions(
              img.width,
              img.height,
              options.maxWidth,
              options.maxHeight
            );

            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with quality compression
            const compressedDataUrl = canvas.toDataURL(
              file.type === 'image/png' ? 'image/png' : 'image/jpeg',
              options.quality
            );
            
            resolve(compressedDataUrl);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  async deleteImage(url: string): Promise<boolean> {
    // For Base64, we don't need to delete anything from storage
    // This is a no-op but maintains the interface
    return true;
  }

  getImageUrl(identifier: string): string {
    // For Base64, the identifier IS the URL
    return identifier;
  }
}

/**
 * Firebase Storage Provider - Future implementation placeholder
 * 
 * This class will be implemented when migrating to Firebase Storage.
 * The interface remains the same, making the migration seamless.
 */
class FirebaseImageProvider implements ImageUploadProvider {
  async uploadImage(file: File, options?: ImageUploadOptions): Promise<ImageUploadResult> {
    // TODO: Implement Firebase Storage upload
    throw new Error('Firebase Storage provider not implemented yet');
  }

  async deleteImage(url: string): Promise<boolean> {
    // TODO: Implement Firebase Storage deletion
    throw new Error('Firebase Storage provider not implemented yet');
  }

  getImageUrl(identifier: string): string {
    // TODO: Generate Firebase Storage URL
    throw new Error('Firebase Storage provider not implemented yet');
  }
}

// Provider configuration
const PROVIDERS = {
  base64: new Base64ImageProvider(),
  firebase: new FirebaseImageProvider(),
} as const;

// Current provider (can be changed via environment variable or config)
const CURRENT_PROVIDER: keyof typeof PROVIDERS = 'base64';

/**
 * Main upload function - uses the configured provider
 * 
 * This is the primary interface that components should use.
 * When migrating to Firebase Storage, only the CURRENT_PROVIDER needs to change.
 */
export async function uploadImage(
  file: File,
  options?: ImageUploadOptions
): Promise<ImageUploadResult> {
  const provider = PROVIDERS[CURRENT_PROVIDER];
  return provider.uploadImage(file, options);
}

/**
 * Delete an uploaded image
 */
export async function deleteImage(url: string): Promise<boolean> {
  const provider = PROVIDERS[CURRENT_PROVIDER];
  return provider.deleteImage ? provider.deleteImage(url) : true;
}

/**
 * Get the final URL for an image identifier
 */
export function getImageUrl(identifier: string): string {
  const provider = PROVIDERS[CURRENT_PROVIDER];
  return provider.getImageUrl ? provider.getImageUrl(identifier) : identifier;
}

/**
 * Utility function to validate if a string is a Base64 image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/');
}

/**
 * Utility function to get file size from Base64 string
 */
export function getBase64Size(base64String: string): number {
  if (!base64String.startsWith('data:')) return 0;
  
  const base64Data = base64String.split(',')[1];
  if (!base64Data) return 0;
  
  // Calculate size from Base64 string
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Configuration for easy provider switching
 */
export const ImageUploadConfig = {
  provider: CURRENT_PROVIDER,
  options: DEFAULT_OPTIONS,
  
  // Method to switch providers (for future use)
  setProvider(provider: keyof typeof PROVIDERS) {
    // This would require a more sophisticated implementation in a real app
    console.warn('Provider switching not implemented in this version');
  },
};
