import api from "./httpService";

const BASE_URL = "/createTrip";

export const createTrip = async (data: any) => {
    try {
        const res = await api.post(`${BASE_URL}/create`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        console.error("Error during trip creation:", error);
        throw error;
    }
};

export const getSuggestions = async (prompt: string) => {
    try {
        const res = await api.post(`${BASE_URL}/suggestions`, { prompt });
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        console.error("Error getting suggestions:", error);
        throw error;
    }
};

export const customizeTrip = async (data: any) => {
    try {
        const res = await api.post(`${BASE_URL}/customize`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        console.error("Error customizing trip:", error);
        throw error;
    }
};

export const findOptimalRoute = async (destinations: any[], mode: string) => {
    try {
        const res = await api.post(`${BASE_URL}/findOptimalRoute`, { destinations, mode });
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        console.error("Error finding optimal route:", error);
        throw error;
    }
};

export const saveTrip = async (payload: {
    userId: string;
    title: string;
    description?: string;
    optimizedRoute: any;
    activities?: string[];
    visabilityStatus: "private" | "public";
    image?: string;
}) => {
    try {
        const res = await api.post(`${BASE_URL}/save`, payload);
        return res.data;
    } catch (error: any) {
        console.error("Error saving trip:", error);
        throw error;
    }
};

export const parseTrip = async (text: string) => {
    try {
        const res = await api.post(`${BASE_URL}/parse`, { text });
        return res.data;
    } catch (error: any) {
        console.error("Error parsing trip:", error);
        throw error;
    }
};


export const calculateBudget = async (data: any) => {
    try {
        const res = await api.post(`${BASE_URL}/budget`, data);
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        console.error("Error calculating budget:", error);
        throw error;
    }
};

export default {
    createTrip,
    getSuggestions,
    customizeTrip,
    findOptimalRoute,
    saveTrip,
    parseTrip,
    calculateBudget,
};

