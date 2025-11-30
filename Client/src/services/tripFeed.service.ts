import api from "./httpService";

const BASE_URL = "/trips";

export const fetchTrips = async (userId: string, page: number = 1, limit: number = 5) => {
    try {
        const url = userId ? `${BASE_URL}/${userId}` : BASE_URL;
        const res = await api.get(url, {
            params: { page, limit }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
};

export default {
    fetchTrips
};
