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

export const telegramLoginUser = async (telegramData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/telegram-login`,
      telegramData,
    );
    const { data } = response;
    console.log("Telegram user logged in successfully:", data);
    return data;
  } catch (error) {
    console.error("Error logging in with Telegram:", error);
    throw error;
  }
};

// Deep link auth: initialize a session and get the bot deep link
export const initTelegramDeepLinkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/telegram-init`);
    return response.data;
  } catch (error) {
    console.error("Error initializing Telegram auth:", error);
    throw error;
  }
};

// Deep link auth: check if the user has completed auth in Telegram
export const checkTelegramDeepLinkStatus = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/auth/telegram-status/${token}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error checking Telegram auth status:", error);
    throw error;
  }
};

// Mini App: auto-login using Telegram WebApp initData
export const telegramWebAppLogin = async (initData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/telegram-webapp-login`,
      {
        initData,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error with Mini App login:", error);
    throw error;
  }
};
