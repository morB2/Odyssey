import api from "./httpService";

const BASE_URL = "/trips";

export const fetchTrips = async (userId: string) => {
    try {
        const res = await api.get(`${BASE_URL}/${userId}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
};

export default {
    fetchTrips
};
