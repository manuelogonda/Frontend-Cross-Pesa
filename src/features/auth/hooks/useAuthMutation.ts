import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../services/authService';
import { normalizeAuthUser, type AuthUserLike } from '../../../lib/userProfile';
import { decodeJwtPayload } from '../../../lib/jwt';

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data: any, variables) => {
      const token = data.accessToken || data.token;
      const user = normalizeAuthUser({
        response: data,
        submitted: variables,
        tokenPayload: (token ? decodeJwtPayload(token) : null) as AuthUserLike | null,
      });

      loginToStore({
        user,
        accessToken: token,
        refreshToken: data.refreshToken ?? '',
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
    onSuccess: (data: any, variables) => {
      const token = data.accessToken || data.token;
      const user = normalizeAuthUser({
        response: data,
        submitted: variables,
        tokenPayload: (token ? decodeJwtPayload(token) : null) as AuthUserLike | null,
      });

      loginToStore({
        user,
        accessToken: token,
        refreshToken: data.refreshToken ?? '',
      });
      navigate('/dashboard');
    },
  });
};
