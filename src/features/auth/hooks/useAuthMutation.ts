import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../core/store/authStore";
import type { RegisterInput } from "../validation/authSchema";
import { authApi } from "../services/authApi";

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      // Pipeline success data straight to Zustand client memory
      setAuth(data.token, data.userId, data.email);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // Log errors cleanly or hook into a toast notification utility
      console.error('Registration operation failed:', error);
    }
  });
};