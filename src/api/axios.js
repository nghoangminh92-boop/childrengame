import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://backend-childrengame.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("edugame_token");

  if (config.url.includes("/auth/verify-email")) {
    return config;
  }

  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;