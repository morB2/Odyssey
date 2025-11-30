/**
 * Utility functions for media handling
 */

/**
 * Utility functions for media handling
 */

export type MediaType = 'image' | 'video' | 'unknown';

/**
 * Determines if a URL is a video based on file extension or Cloudinary URL patterns
 */
export function getMediaType(url: string): MediaType {
    if (!url) return 'unknown';

    // Check for common video extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
    const lowerUrl = url.toLowerCase();

    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
        return 'video';
    }

    // Check for Cloudinary video URL patterns
    if (lowerUrl.includes('/video/upload/')) {
        return 'video';
    }

    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
        return 'image';
    }

    // Check for Cloudinary image URL patterns
    if (lowerUrl.includes('/image/upload/')) {
        return 'image';
    }

    // Default to image for backward compatibility
    return 'image';
}

/**
 * Checks if a URL is a video
 */
export function isVideo(url: string): boolean {
    return getMediaType(url) === 'video';
}

/**
 * Checks if a URL is an image
 */
export function isImage(url: string): boolean {
    return getMediaType(url) === 'image';
}

/**
 * Optimizes a Cloudinary URL by adding compression transformations
 * This reduces file size and bandwidth without uploading new files
 * 
 * @param url - Original Cloudinary URL
 * @param options - Optimization options
 * @returns Optimized URL with transformations
 */
export function optimizeCloudinaryUrl(
    url: string,
    options: {
        quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number;
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
        format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
): string {
    // Return original URL if not a Cloudinary URL
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    // Default options
    const {
        quality = 'auto:good',
        width,
        height,
        crop = 'fill',
        format = 'auto',
    } = options;

    // Build transformation string
    const transformations: string[] = [];

    if (quality) {
        transformations.push(`q_${quality}`);
    }

    if (format) {
        transformations.push(`f_${format}`);
    }

    if (width) {
        transformations.push(`w_${width}`);
    }

    if (height) {
        transformations.push(`h_${height}`);
    }

    if ((width || height) && crop) {
        transformations.push(`c_${crop}`);
    }

    // Check if URL already has transformations
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url; // Not a valid Cloudinary upload URL
    }

    // Insert transformations after /upload/
    const transformationString = transformations.join(',');
    const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);

    // Check if there are already transformations
    if (afterUpload.match(/^[a-z]_/)) {
        // Already has transformations, add ours
        return `${beforeUpload}${transformationString},${afterUpload}`;
    } else {
        // No transformations yet
        return `${beforeUpload}${transformationString}/${afterUpload}`;
    }
}

/**
 * Optimizes a Cloudinary URL for thumbnail display
 */
export function getOptimizedThumbnail(url: string, size: number = 400): string {
    return optimizeCloudinaryUrl(url, {
        width: size,
        height: size,
        crop: 'fill',
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Optimizes a Cloudinary URL for full-size display
 */
export function getOptimizedFullSize(url: string, maxWidth: number = 1920): string {
    return optimizeCloudinaryUrl(url, {
        width: maxWidth,
        quality: 'auto:good',
        format: 'auto',
    });
}
