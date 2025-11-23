import api from "./httpService";

export const submitReport = async (tripId: string, reason: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await api.post(
        `/reports`,
        { tripId, reason },
        {
            headers: {
                'x-api-key': token,
            },
        }
    );

    return response.data;
};
