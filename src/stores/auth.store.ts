import { create } from "zustand";
import { api } from "../services/api";
import { storage } from "../lib/storage";

interface User {
  id: string;
  email: string;
  nickname: string;
  name: string;
  plan: "free" | "premium";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => Promise<void>;
  loadUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  nickname: string;
  password: string;
  name: string;
  birthDate: string;
  sex: "male" | "female";
  height: number;
  termsAccepted: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (login, password) => {
    const { data } = await api.post("/auth/login", { login, password });

    await storage.setItem("accessToken", data.accessToken);
    await storage.setItem("refreshToken", data.refreshToken);

    set({ user: data.user, isAuthenticated: true });
  },

  register: async (registerData) => {
    const { data } = await api.post("/auth/register", registerData);

    await storage.setItem("accessToken", data.accessToken);
    await storage.setItem("refreshToken", data.refreshToken);

    set({ user: data.user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await storage.deleteItem("accessToken");
    await storage.deleteItem("refreshToken");
    set({ user: null, isAuthenticated: false });
  },

  logout: async () => {
    try {
      const refreshToken = await storage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Ignora erro no logout
    }

    await storage.deleteItem("accessToken");
    await storage.deleteItem("refreshToken");

    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await storage.getItem("accessToken");

      if (!token) {
        set({ isLoading: false });
        return;
      }

      const { data } = await api.get("/users/me");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      await storage.deleteItem("accessToken");
      await storage.deleteItem("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
