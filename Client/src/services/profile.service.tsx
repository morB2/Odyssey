import api from "./httpService";
import { useUserStore } from "../store/userStore";

const BASE = "/profile";
const FOLLOW_BASE = "/follow";

const getAuthHeader = (token?: string) => {
  const t = token ?? useUserStore.getState().token;
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const createHeaders = (token?: string, extra: Record<string, string> = {}) => {
  return {
    ...getAuthHeader(token),
    ...extra,
  };
};

export const getProfile = async (userId: string, token?: string) => {
  try {
    const res = await api.get(`${BASE}/${userId}`, {
      headers: createHeaders(token),
    });
    return res.data;
  } catch (error) {
    console.error("getProfile error:", error);
    throw error;
  }
};

export const getTrips = async (userId: string, token?: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/trips`, {
      headers: createHeaders(token),
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getTrips error:", error);
    throw error;
  }
};

export const updateTrip = async (
  userId: string,
  tripId: string,
  payload: any,
  token?: string
) => {
  try {
    // If payload is FormData (files + fields), use fetch so browser sets multipart boundary
    if (payload instanceof FormData) {
      const fullUrl =
        (api.defaults.baseURL || "") + `${BASE}/${userId}/trips/${tripId}`;
      const headers = createHeaders(token) as Record<string, string>;
      const res = await fetch(fullUrl, {
        method: "PUT",
        headers,
        body: payload,
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || json?.message || "Update failed");
      return json;
    }

    const res = await api.put(`${BASE}/${userId}/trips/${tripId}`, payload, {
      headers: createHeaders(token),
    });
    return res.data;
  } catch (error) {
    console.error("updateTrip error:", error);
    throw error;
  }
};

export const deleteTrip = async (
  userId: string,
  tripId: string,
  token?: string
) => {
  try {
    const res = await api.delete(`${BASE}/${userId}/trips/${tripId}`, {
      headers: createHeaders(token),
    });
    return res.data;
  } catch (error) {
    console.error("deleteTrip error:", error);
    throw error;
  }
};

export const uploadAvatar = async (
  userId: string,
  file?: File,
  avatarUrl?: string,
  token?: string
) => {
  const url = `${BASE}/${userId}/avatar`;

  // Upload a real file
  if (file) {
    const fd = new FormData();
    fd.append("avatar", file);

    const res = await fetch(`${api.defaults.baseURL}${url}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json;
  }

  // Upload cloudinary URL
  if (avatarUrl?.trim()) {
    const res = await api.put(
      url,
      { avatarUrl: avatarUrl.trim() },
      {
        headers: createHeaders(token, { "Content-Type": "application/json" }),
      }
    );
    return res.data;
  }

  throw new Error("Either file or avatarUrl must be provided");
};

export const changePassword = async (
  userId: string,
  currentPassword: string | undefined,
  newPassword: string,
  token?: string
) => {
  try {
    const res = await api.post(
      `${BASE}/${userId}/changePassword`,
      { currentPassword, newPassword },
      { headers: createHeaders(token) }
    );
    return res.data;
  } catch (error) {
    console.error("changePassword error:", error);
    throw error;
  }
};

export const getFollowers = async (userId: string) => {
  try {
    const res = await api.get(`${FOLLOW_BASE}/${userId}/followers`);
    return res.data;
  } catch (error) {
    console.error("getFollowers error:", error);
    throw error;
  }
};

export const getFollowing = async (userId: string) => {
  try {
    const res = await api.get(`${FOLLOW_BASE}/${userId}/following`);
    return res.data;
  } catch (error) {
    console.error("getFollowing error:", error);
    throw error;
  }
};

export const getLikedTrips = async (userId: string, token?: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/liked-trips`, {
      headers: createHeaders(token),
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getLikedTrips error:", error);
    throw error;
  }
};

export const getSavedTrips = async (userId: string, token?: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/saved-trips`, {
      headers: createHeaders(token),
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getSavedTrips error:", error);
    throw error;
  }
};
