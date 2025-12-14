import api from "./httpService";

export const fetchAdminTrips = async (page: number = 1, limit: number = 10, search: string = "") => {
    try {
        const params: any = { page, limit };
        if (search && search.trim()) {
            params.search = search.trim();
        }

        const res = await api.get(`/admin/all`, { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching admin trips:", error);
        throw error;
    }
};

export const deleteAdminTrip = async (tripId: String) => {
    try {
        const res = await api.delete(`/profile/trips/${tripId}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting admin trip:", error);
        throw error;
    }
};

// Contact messages
export const fetchContactMessages = async (page: number = 1, limit: number = 10) => {
    try {
        const res = await api.get(`/contact`, { params: { page, limit } });
        return res.data;
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        throw error;
    }
};

export const markMessageAsRead = async (id: string) => {
    try {
        const res = await api.patch(`/contact/${id}/read`);
        return res.data;
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
    }
};

export const deleteContactMessage = async (id: string) => {
    try {
        const res = await api.delete(`/contact/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting contact message:", error);
        throw error;
    }
};

export default fetchAdminTrips;