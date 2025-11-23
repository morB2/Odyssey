import api from "./httpService";

export const submitReport = async (tripId: string, reason: string, userId: string) => {
    const response = await api.post(
        `/reports`,
        { tripId, reason, userId }
    );

    return response.data;
};
