import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AuthResponse } from '../features/auth/validation/authSchema';

// We extract the user details from the AuthResponse by omitting the token
type User = Omit<AuthResponse, 'token'>;

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State
      token: null,
      user: null,
      isAuthenticated: false,

      // Actions
      login: (data) => 
        set({
          token: data.token,
          user: {
            email: data.email,
            firstName: data.firstName,
            role: data.role,
          },
          isAuthenticated: true,
        }),

      logout: () => 
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'crosspesa-auth-storage', // The key used in localStorage
    }
  )
);