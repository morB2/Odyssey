import api from "./httpService";

const BASE_URL = "/users";

export const getAllUsers = async (params?: any) => {
  const res = await api.get(`${BASE_URL}`, { params });
  return res.data;
};

export const createUser = async (userData: any) => {
  const res = await api.post(`${BASE_URL}`, userData);
  return res.data;
};

export const updateUser = async (id: any, updateData: any) => {
  const res = await api.patch(`${BASE_URL}/${id}`, updateData);
  return res.data;
};

export default {
  getAllUsers,
  createUser,
  updateUser
};