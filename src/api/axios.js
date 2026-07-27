import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
});

// Không gửi Authorization khi verify email
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
