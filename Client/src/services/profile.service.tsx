import api from "./httpService";

const BASE = "/profile";
const FOLLOW_BASE = "/follow";

export const getProfile = async (userId: string) => {
  try {
    const res = await api.get(`${BASE}/${userId}`);
    return res.data;
  } catch (error) {
    console.error("getProfile error:", error);
    throw error;
  }
};

export const getTrips = async (userId: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/trips`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getTrips error:", error);
    throw error;
  }
};

export const updateTrip = async (
  tripId: string,
  payload: any,
  token?: string
) => {
  try {
    // If payload is FormData (files + fields), use fetch so browser sets multipart boundary
    if (payload instanceof FormData) {
      const fullUrl =
        (api.defaults.baseURL || "") + `${BASE}/trips/${tripId}`;
      const res = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || json?.message || "Update failed");
      return json;
    }

    const res = await api.put(`${BASE}/trips/${tripId}`, payload);
    return res.data;
  } catch (error) {
    console.error("updateTrip error:", error);
    throw error;
  }
};

export const deleteTrip = async (
  tripId: string,
) => {
  try {
    const res = await api.delete(`${BASE}/trips/${tripId}`);
    return res.data;
  } catch (error) {
    console.error("deleteTrip error:", error);
    throw error;
  }
};

export const uploadAvatar = async (
  file?: File,
  avatarUrl?: string,
  token?: string
) => {
  const url = `${BASE}/avatar`;

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  }

  throw new Error("Either file or avatarUrl must be provided");
};

export const changePassword = async (
  currentPassword: string | undefined,
  newPassword: string,
) => {
  try {
    const res = await api.post(
      `${BASE}/changePassword`,
      { currentPassword, newPassword },
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

export const getLikedTrips = async (userId: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/liked-trips`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getLikedTrips error:", error);
    throw error;
  }
};

export const getSavedTrips = async (userId: string, page: number = 1, limit: number = 12) => {
  try {
    const res = await api.get(`${BASE}/${userId}/saved-trips`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("getSavedTrips error:", error);
    throw error;
  }
};
