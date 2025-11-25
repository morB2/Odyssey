import api from "./httpService";

export const submitReport = async (tripId: string, reason: string, userId: string) => {
    const response = await api.post(
        `/reports`,
        { tripId, reason, userId }
    );

    return response.data;
};

export const getReports = async () => {
    const response = await api.get(`/reports`);
    return response.data;
};

export const updateReportStatus = async (reportId: string, status: string) => {
    const response = await api.patch(`/reports/${reportId}/status`, { status });
    return response.data;
};

export const deleteReportedPost = async (tripId: string) => {
    const response = await api.delete(`/reports/post/${tripId}`);
    return response.data;
};
