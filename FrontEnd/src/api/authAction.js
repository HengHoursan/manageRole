import axios from "axios";
const API_URL = import.meta.env.VITE_BASE_URL;
console.log("This server url:", API_URL);

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    const { data } = response;
    console.log("User registered successfully:", data);
    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    const { data } = response;
    console.log("User logged in successfully:", data);
    return data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};
