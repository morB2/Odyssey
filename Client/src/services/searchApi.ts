import api from './httpService'; // import your Axios instance

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
 * Search for users and trips using Axios instance
 * @param query - Search query string
 * @param userId - Optional user ID for personalized results
 * @returns Search results with users and trips
 */
export async function searchAll(query: string, userId?: string): Promise<SearchResults> {
    try {
        const params: Record<string, string> = { q: query };
        if (userId) params.userId = userId;

        const { data } = await api.get<SearchResponse>('/api/search', { params });

        return data.results;
    } catch (error) {
        console.error('Search API error:', error);
        throw error;
    }
}
