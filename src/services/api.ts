import axios from "axios";
import { authEvents } from "../lib/authEvents";
import { storage } from "../lib/storage";

const API_URL = "http://192.168.1.144:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getItem("refreshToken");
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        await storage.setItem("accessToken", data.accessToken);
        await storage.setItem("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        if (refreshError?.response?.status === 401) {
          authEvents.emitSessionExpired();
        }
      }
    }

    return Promise.reject(error);
  },
);
