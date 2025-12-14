import api from "./httpService";

const BASE_URL = "/users";

export const getAllUsers = async (params?: any) => {
  try {
    const res = await api.get(`${BASE_URL}`, { params });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const res = await api.post(`${BASE_URL}`, userData);
    return res.data;
  } catch (error) {
    console.error("Failed to create user", error);
    throw error;
  }
};

export const updateUser = async (id: any, updateData: any) => {
  try {
    const res = await api.patch(`${BASE_URL}/${id}`, updateData);
    return res.data;
  } catch (error) {
    console.error("Failed to update user", error);
    throw error;
  }
};

export default {
  getAllUsers,
  createUser,
  updateUser
};