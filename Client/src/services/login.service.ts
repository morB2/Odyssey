import api from "./httpService";

const BASE_URL = "/login";

export const loginUser = async (data: any) => {
  try {
    const res = await api.post(`${BASE_URL}/login`, data);
    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const registerUser = async (data: any) => {
    console.log("Registering user with data:", data);
    console.log("API Base URL:", `${BASE_URL}/register`);
  try {
    const res = await api.post(`${BASE_URL}/register`, data);
    return res.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const googleLogin = async (token: string) => {
  try {
    const res = await api.post(`${BASE_URL}/google`, { token });
    return res.data;
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error;
  }
};

export default {
  loginUser,
  registerUser,
  googleLogin,
};
