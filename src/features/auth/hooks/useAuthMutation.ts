import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../services/authService';

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data: any) => {
      // Map response fields to match Zustand store expectations
      loginToStore({
        user: data.user,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      });
      navigate('/dashboard');
    },
  });
};

export const useRegister = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data: any) => {
      loginToStore({
        user: data.user,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      });
      navigate('/dashboard');
    },
  });
};