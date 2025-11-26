const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface SearchUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isFollowing?: boolean;
}

export interface SearchTrip {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        isFollowing?: boolean;
    };
    title?: string;
    description?: string;
    optimizedRoute?: any;
    activities?: string[];
    images?: string[];
    likes: number;
    isLiked: boolean;
    isSaved: boolean;
    comments?: any[];
    createdAt?: string;
}

export interface SearchResults {
    users: SearchUser[];
    trips: SearchTrip[];
}

export interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResults;
}

/**
 * Search for users and trips
 * @param query - Search query string
 * @param userId - Optional user ID for personalized results
 * @returns Search results with users and trips
 */
export async function searchAll(query: string, userId?: string): Promise<SearchResults> {
    try {
        const params = new URLSearchParams({ q: query });
        if (userId) {
            params.append('userId', userId);
        }

        const response = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error('Search API error:', error);
        throw error;
    }
}
