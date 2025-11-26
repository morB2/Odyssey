import api from "./httpService";

const BASE_URL = "/sendEmail";

export const forgotPassword = async (email: string, language: string) => {
    console.log("forgotPassword הגעת לפונקציה עם האימייל:", email, language);
  try {
    const res = await api.post(`${BASE_URL}/forgotPassword`, { email, language });
    return res.data;
  } catch (error) {
    console.error("Error during forgot password:", error);
    throw error;
  }
};

