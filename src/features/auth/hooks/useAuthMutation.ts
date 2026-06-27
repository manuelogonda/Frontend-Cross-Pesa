import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../services/authService';

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // 1. Save token and user details to Zustand
      loginToStore(data);
      // 2. Send the user to the protected dashboard
      navigate('/dashboard');
    },
  });
};

export const useRegister = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Auto-login the user after successful registration
      loginToStore(data);
      navigate('/dashboard');
    },
  });
};