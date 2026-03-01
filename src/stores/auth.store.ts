import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "../services/api";

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

    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);

    set({ user: data.user, isAuthenticated: true });
  },

  register: async (registerData) => {
    const { data } = await api.post("/auth/register", registerData);

    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);

    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Ignora erro no logout
    }

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        set({ isLoading: false });
        return;
      }

      const { data } = await api.get("/users/me");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
