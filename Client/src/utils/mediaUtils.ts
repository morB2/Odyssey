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
// export function optimizeCloudinaryUrl(
//     url: string,
//     options: {
//         quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number;
//         width?: number;
//         height?: number;
//         crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
//         format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
//     } = {}
// ): string {
//     // Return original URL if not a Cloudinary URL
//     if (!url || !url.includes('cloudinary.com')) {
//         return url;
//     }

//     // Default options
//     const {
//         quality = 'auto:good',
//         width,
//         height,
//         crop = 'fill',
//         format = 'auto',
//     } = options;

//     // Build transformation string
//     const transformations: string[] = [];

//     if (quality) {
//         transformations.push(`q_${quality}`);
//     }

//     if (format) {
//         transformations.push(`f_${format}`);
//     }

//     if (width) {
//         transformations.push(`w_${width}`);
//     }

//     if (height) {
//         transformations.push(`h_${height}`);
//     }

//     if ((width || height) && crop) {
//         transformations.push(`c_${crop}`);
//     }

//     // Check if URL already has transformations
//     const uploadIndex = url.indexOf('/upload/');
//     if (uploadIndex === -1) {
//         return url; // Not a valid Cloudinary upload URL
//     }

//     // Insert transformations after /upload/
//     const transformationString = transformations.join(',');
//     const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
//     const afterUpload = url.substring(uploadIndex + 8);

//     // Check if there are already transformations
//     if (afterUpload.match(/^[a-z]_/)) {
//         // Already has transformations, add ours
//         return `${beforeUpload}${transformationString},${afterUpload}`;
//     } else {
//         // No transformations yet
//         return `${beforeUpload}${transformationString}/${afterUpload}`;
//     }
// }

// ============================================
// FILTERS & EFFECTS
// ============================================

export type ImageFilter = 'none' | 'vintage' | 'bw' | 'sepia' | 'sharpen' | 'blur' | 'vibrant' | 'artistic';

/**
 * Apply a preset filter to an image
 */
export function applyImageFilter(url: string, filter: ImageFilter): string {
    if (!url || !url.includes('cloudinary.com') || filter === 'none') {
        return url;
    }

    const filterTransformations: Record<ImageFilter, string> = {
        none: '',
        vintage: 'e_sepia:50,e_vignette:30,e_brightness:-10',
        bw: 'e_grayscale',
        sepia: 'e_sepia',
        sharpen: 'e_sharpen:100',
        blur: 'e_blur:300',
        vibrant: 'e_saturation:50,e_vibrance:30',
        artistic: 'e_art:athena',
    };

    const transformation = filterTransformations[filter];
    if (!transformation) return url;

    return addCloudinaryTransformation(url, transformation);
}

export interface ImageEffects {
    brightness?: number;    // -99 to 100
    contrast?: number;      // -100 to 100
    saturation?: number;    // -100 to 100
    hue?: number;          // -100 to 100
    blur?: number;         // 1 to 2000
    sharpen?: number;      // 1 to 2000
    pixelate?: number;     // 1 to 200
    vignette?: number;     // 0 to 100
    gamma?: number;        // -50 to 150
    improve?: boolean;     // Auto improve
    vibrance?: number;     // -100 to 100
}

/**
 * Apply advanced effects to an image
 */
export function applyImageEffects(url: string, effects: ImageEffects): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const transformations: string[] = [];

    if (effects.brightness !== undefined && effects.brightness !== 0) {
        transformations.push(`e_brightness:${effects.brightness}`);
    }

    if (effects.contrast !== undefined && effects.contrast !== 0) {
        transformations.push(`e_contrast:${effects.contrast}`);
    }

    if (effects.saturation !== undefined && effects.saturation !== 0) {
        transformations.push(`e_saturation:${effects.saturation}`);
    }

    if (effects.hue !== undefined && effects.hue !== 0) {
        transformations.push(`e_hue:${effects.hue}`);
    }

    if (effects.blur !== undefined && effects.blur > 0) {
        transformations.push(`e_blur:${effects.blur}`);
    }

    if (effects.sharpen !== undefined && effects.sharpen > 0) {
        transformations.push(`e_sharpen:${effects.sharpen}`);
    }

    if (effects.pixelate !== undefined && effects.pixelate > 0) {
        transformations.push(`e_pixelate:${effects.pixelate}`);
    }

    if (effects.vignette !== undefined && effects.vignette > 0) {
        transformations.push(`e_vignette:${effects.vignette}`);
    }

    if (effects.gamma !== undefined && effects.gamma !== 0) {
        transformations.push(`e_gamma:${effects.gamma}`);
    }

    if (effects.vibrance !== undefined && effects.vibrance !== 0) {
        transformations.push(`e_vibrance:${effects.vibrance}`);
    }

    if (effects.improve) {
        transformations.push('e_improve');
    }

    if (transformations.length === 0) {
        return url;
    }

    return addCloudinaryTransformation(url, transformations.join(','));
}

export interface VideoTransformations {
    duration?: number;      // Max duration in seconds
    startOffset?: number;   // Start from X seconds
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best';
    format?: 'mp4' | 'webm';
    watermark?: {
        text: string;
        position?: 'north_east' | 'north_west' | 'south_east' | 'south_west' | 'center';
        fontSize?: number;
        color?: string;
    };
}

/**
 * Apply transformations to a video
 */
export function applyVideoTransformations(url: string, options: VideoTransformations): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const transformations: string[] = [];

    if (options.duration !== undefined && options.duration > 0) {
        transformations.push(`du_${options.duration}`);
    }

    if (options.startOffset !== undefined && options.startOffset > 0) {
        transformations.push(`so_${options.startOffset}`);
    }

    if (options.quality) {
        transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
        transformations.push(`f_${options.format}`);
    }

    if (options.watermark) {
        const { text, position = 'south_east', fontSize = 40, color = 'white' } = options.watermark;
        const encodedText = encodeURIComponent(text);
        transformations.push(`l_text:Arial_${fontSize}:${encodedText},co_${color},g_${position}`);
    }

    if (transformations.length === 0) {
        return url;
    }

    return addCloudinaryTransformation(url, transformations.join(','));
}

/**
 * Helper function to add transformations to a Cloudinary URL
 */
function addCloudinaryTransformation(url: string, transformation: string): string {
    if (!transformation) return url;

    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url;
    }

    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);

    // Check if there are already transformations
    if (afterUpload.match(/^[a-z]_/)) {
        // Already has transformations, add ours
        return `${beforeUpload}${transformation},${afterUpload}`;
    } else {
        // No transformations yet
        return `${beforeUpload}${transformation}/${afterUpload}`;
    }
}

/**
 * Remove all transformations from a Cloudinary URL (get original)
 */
export function getOriginalCloudinaryUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url;
    }

    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);

    // Remove transformations (everything before the version or filename)
    const parts = afterUpload.split('/');

    // Find where the actual file path starts (after transformations and version)
    let filePathIndex = 0;
    for (let i = 0; i < parts.length; i++) {
        // Version starts with 'v' followed by numbers
        if (parts[i].match(/^v\d+$/)) {
            filePathIndex = i;
            break;
        }
        // Or if we hit a folder name (doesn't look like a transformation)
        if (!parts[i].match(/^[a-z]_/)) {
            filePathIndex = i;
            break;
        }
    }

    const filePath = parts.slice(filePathIndex).join('/');
    return `${beforeUpload}${filePath}`;
}
