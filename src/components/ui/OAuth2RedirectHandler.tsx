import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

export const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const accessToken = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Decode your token here if you have user info in it, 
      // or fetch the user profile from a /me endpoint
      login({
        user: { 
            id: 'google-user', 
            email: 'google-user@example.com', 
            firstName: 'Google', 
            lastName: 'User', 
            role: 'USER' 
        },
        accessToken,
        refreshToken
      });
      navigate('/dashboard');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, login, navigate]);

  return <div className="p-10 text-center">Processing login...</div>;
};