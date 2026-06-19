import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize state directly from localStorage so page refreshes don't log the user out
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  email: localStorage.getItem('userEmail'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (token, userId, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', email);
    set({ token, userId, email, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    set({ token: null, userId: null, email: null, isAuthenticated: false });
  }
}));