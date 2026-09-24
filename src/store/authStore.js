import { create } from 'zustand';

// بررسی اولیه لوکال استورج
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  login: (userData) => {
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ user: null });
  }
}));