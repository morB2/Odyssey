import api from "./httpService";
import { useUserStore } from "../store/userStore";

const BASE = "/profile";
const FOLLOW_BASE = "/follow";

const getAuthHeader = (token?: string) => {
  const t = token ?? useUserStore.getState().token;
  return t ? { Authorization: `Bearer ${t}` } : undefined;
};

export const getProfile = async (userId: string, token?: string) => {
  try {
    const res = await api.get(`${BASE}/${userId}`, {
      headers: getAuthHeader(token),
    });
    return res.data;
  } catch (error) {
    console.error("getProfile error:", error);
    throw error;
  }
};

export const getTrips = async (userId: string, token?: string) => {
  try {
    const res = await api.get(`${BASE}/${userId}/trips`, {
      headers: getAuthHeader(token),
    });
    return res.data;
  } catch (error) {
    console.error("getTrips error:", error);
    throw error;
  }
};

// export const getUserTrip = async (
//   userId: string,
//   tripId: string,
//   token?: string
// ) => {
//   try {
//     const res = await api.get(`${BASE}/${userId}/trips/${tripId}`, {
//       headers: getAuthHeader(token),
//     });
//     return res.data;
//   } catch (error) {
//     console.error("getUserTrip error:", error);
//     throw error;
//   }
// };

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
      const headers = (getAuthHeader(token) || {}) as Record<string, string>;
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
      headers: getAuthHeader(token),
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
      headers: getAuthHeader(token),
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
  try {
    const url = `${BASE}/${userId}/avatar`;

    if (file) {
      const fd = new FormData();
      console.log("avatar\n", file);

      // Use fetch for multipart upload so the browser sets the Content-Type boundary correctly
      fd.append("avatar", file);
      const fullUrl = (api.defaults.baseURL || "") + url;
      const headers = getAuthHeader(token) || {};
      const res = await fetch(fullUrl, {
        method: "PUT",
        headers: headers as Record<string, string>,
        body: fd,
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || json?.message || "Upload failed");
      return json;
    }

    if (avatarUrl && avatarUrl.trim()) {
      const res = await api.put(
        url,
        { avatarUrl: avatarUrl.trim() },
        {
          headers: {
            ...(getAuthHeader(token) || {}),
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    }

    throw new Error("Either file or avatarUrl must be provided");
  } catch (error) {
    console.error("uploadAvatar error:", error);
    throw error;
  }
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
      { headers: getAuthHeader(token) }
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

export const getLikedTrips = async (userId: string, token?: string) => {
  try {
    const res = await api.get(`/likes/${userId}`, {
      headers: getAuthHeader(token),
    });
    return res.data;
  } catch (error) {
    console.error("getLikedTrips error:", error);
    throw error;
  }
};

export const getSavedTrips = async (userId: string, token?: string) => {
  try {
    const res = await api.get(`/saves/${userId}`, {
      headers: getAuthHeader(token),
    });
    return res.data;
  } catch (error) {
    console.error("getSavedTrips error:", error);
    throw error;
  }
};

export default {
  getProfile,
  getTrips,
  // getUserTrip,
  updateTrip,
  deleteTrip,
  uploadAvatar,
  changePassword,
  getFollowers,
  getFollowing,
};
