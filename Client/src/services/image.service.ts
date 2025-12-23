/**
 * Image service for external image API calls (Pexels)
 */

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_KEY;
const PEXELS_BASE_URL = "https://api.pexels.com/v1";

export interface PexelsPhoto {
    id: number;
    src: {
        original: string;
        large: string;
        large2x: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    alt: string;
}

export interface PexelsSearchResponse {
    photos: PexelsPhoto[];
    total_results: number;
    next_page?: string;
}

/**
 * Search for travel-related images on Pexels
 * @param query - Search query (e.g., city name, destination)
 * @returns Image URL or empty string on failure
 */
export const searchTravelImage = async (query: string): Promise<string> => {
    try {
        const searchQuery = `${query} travel landscape`;
        const response = await fetch(
            `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
            }
        );

        if (!response.ok) {
            console.error("Pexels API request failed:", response.status);
            return "";
        }

        const data: PexelsSearchResponse = await response.json();

        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large;
        }

        return "";
    } catch (error) {
        console.error("Failed to fetch image from Pexels:", error);
        return "";
    }
};

export default {
    searchTravelImage,
};
