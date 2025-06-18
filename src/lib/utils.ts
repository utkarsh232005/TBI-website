import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a Google Drive sharing URL to a direct image URL
 * @param url - The Google Drive sharing URL
 * @returns The direct image URL or the original URL if not a Google Drive URL
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;

  // Check if it's a Google Drive sharing URL
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Check if it's already a direct Google Drive URL
  if (url.includes("drive.google.com/uc?")) {
    return url;
  }

  return url;
}

/**
 * Processes an image URL to ensure it's compatible with Next.js Image component
 * Now handles both Base64 images and regular URLs
 * @param url - The image URL to process
 * @param fallbackText - Text to use in fallback placeholder
 * @returns A processed image URL
 */
export function processImageUrl(
  url: string,
  fallbackText: string = "IMG"
): string {
  if (!url || url.trim() === "") {
    return `https://placehold.co/500x500/121212/FFFFFF.png?text=${encodeURIComponent(
      fallbackText
    )}`;
  }

  const trimmedUrl = url.trim();
  
  // If it's a Base64 image, return as-is
  if (trimmedUrl.startsWith('data:image/')) {
    return trimmedUrl;
  }

  // Convert Google Drive URLs
  const processedUrl = convertGoogleDriveUrl(trimmedUrl);

  return processedUrl;
}

/**
 * Validates if a URL is likely to be a valid image URL
 * @param url - The URL to validate
 * @returns Boolean indicating if the URL might be a valid image
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;

  try {
    const urlObj = new URL(url);

    // Check for common image extensions
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const hasImageExtension = imageExtensions.some((ext) =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    // Check for known image hosting services
    const imageHosts = [
      "drive.google.com",
      "imgur.com",
      "i.imgur.com",
      "images.unsplash.com",
      "picsum.photos",
      "placehold.co",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
    ];

    const isKnownHost = imageHosts.some((host) =>
      urlObj.hostname.includes(host)
    );

    return (
      hasImageExtension || isKnownHost || urlObj.searchParams.has("export")
    );
  } catch {
    return false;
  }
}
