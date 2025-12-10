import api from "./httpService";

export interface TopPost {
    _id: string;
    title: string;
    views: number;
    likes: number;
    userName: string;
}

export interface ViewsTrendData {
    date: string;
    views: number;
    posts: number;
}

export interface CategoryData {
    category: string;
    count: number;
}

export interface TopActiveUser {
    _id: string;
    firstName: string;
    lastName: string;
    postsCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalReplies: number;
    activityScore: number;
}

/*******************************
 *     Report Interfaces       *
 *******************************/

export interface TopReportedUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    reportCount: number;
}

export interface TopReporter {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    reportCount: number;
}

export interface ReportReasonData {
    reason: string;
    count: number;
}

export interface ReportsTrendData {
    date: string;
    count: number;
}

export interface TopReportedPost {
    _id: string;
    title: string;
    author: string;
    views: number;
    likes: number;
    reportCount: number;
    createdAt: string;
}

/**
 * Get top 5 most viewed posts
 */
export const getTopViewedPosts = async (): Promise<TopPost[]> => {
    try {
        const response = await api.get("/admin/stats/top-viewed-posts");
        return response.data;
    } catch (error) {
        console.error("Error fetching top viewed posts:", error);
        throw error;
    }
};

/**
 * Get top 5 most liked posts
 */
export const getTopLikedPosts = async (): Promise<TopPost[]> => {
    try {
        const response = await api.get("/admin/stats/top-liked-posts");
        return response.data;
    } catch (error) {
        console.error("Error fetching top liked posts:", error);
        throw error;
    }
};

/**
 * Get views trend for the last N days
 */
// export const getViewsTrend = async (days: number = 30): Promise<ViewsTrendData[]> => {
//     try {
//         const response = await api.get(`/admin/stats/views-trend?days=${days}`);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching views trend:", error);
//         throw error;
//     }
// };

/**
 * Get category distribution
 */
export const getCategoryDistribution = async (): Promise<CategoryData[]> => {
    try {
        const response = await api.get("/admin/stats/category-distribution");
        return response.data;
    } catch (error) {
        console.error("Error fetching category distribution:", error);
        throw error;
    }
};

/**
 * Get top 3 active users from last month
 */
export const getTopActiveUsers = async (): Promise<TopActiveUser[]> => {
    try {
        const response = await api.get("/admin/stats/top-active-users");
        return response.data;
    } catch (error) {
        console.error("Error fetching top active users:", error);
        throw error;
    }
};

/*******************************
 *     Report Services         *
 *******************************/

/**
 * Get top 5 posts with the most reports
 */
export const getTopReportedPosts = async (): Promise<TopReportedPost[]> => {
    try {
        const response = await api.get("/admin/stats/top-reported-posts");
        return response.data;
    } catch (error) {
        console.error("Error fetching top reported posts:", error);
        throw error;
    }
};

/**
 * Get top 5 users who were reported the most
 */
export const getTopReportedUsers = async (): Promise<TopReportedUser[]> => {
    try {
        const response = await api.get("/admin/stats/top-reported-users");
        return response.data;
    } catch (error) {
        console.error("Error fetching top reported users:", error);
        throw error;
    }
};

/**
 * Get top 5 users who report the most
 */
export const getTopReporters = async (): Promise<TopReporter[]> => {
    try {
        const response = await api.get("/admin/stats/top-reporters");
        return response.data;
    } catch (error) {
        console.error("Error fetching top reporters:", error);
        throw error;
    }
};

/**
 * Get report reason distribution
 */
export const getReportReasonDistribution = async (): Promise<ReportReasonData[]> => {
    try {
        const response = await api.get("/admin/stats/report-reason-distribution");
        return response.data;
    } catch (error) {
        console.error("Error fetching report reason distribution:", error);
        throw error;
    }
};

/**
 * Get reports trend for the last N days
 */
export const getReportsTrend = async (days: number = 30): Promise<ReportsTrendData[]> => {
    try {
        const response = await api.get(`/admin/stats/reports-trend?days=${days}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching reports trend:", error);
        throw error;
    }
};
