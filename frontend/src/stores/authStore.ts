import { create } from 'zustand';
import { authAPI, setToken, removeToken, getToken } from '../services/api';

interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  is_verified: boolean;
  is_admin: boolean;
  identity_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  verifyIdentity: (idPhoto: string, selfiePhoto: string) => Promise<boolean>;
  initAdmin: (data: any) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.login({ email, password });
      await setToken(response.data.access_token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erreur de connexion',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.register(data);
      await setToken(response.data.access_token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Erreur d'inscription",
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    await removeToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const response = await authAPI.getMe();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      await removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  verifyIdentity: async (idPhoto, selfiePhoto) => {
    try {
      set({ isLoading: true, error: null });
      await authAPI.verifyIdentity({ id_photo: idPhoto, selfie_photo: selfiePhoto });
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erreur lors de la vérification',
        isLoading: false,
      });
      return false;
    }
  },

  initAdmin: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.initAdmin(data);
      await setToken(response.data.access_token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erreur',
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
