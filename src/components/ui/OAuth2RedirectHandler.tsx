import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";
import { decodeJwtPayload } from "../../lib/jwt";
import { normalizeAuthUser, type AuthUserLike } from "../../lib/userProfile";

export const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    // The backend redirects with tokens in the URL FRAGMENT (not query params):
    //   /oauth2/redirect#token=<accessToken>&refresh_token=<refreshToken>
    // Fragments are never sent to the server, so they stay out of access logs.
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('token');
    const refreshToken = params.get('refresh_token');

    // Scrub the fragment from the address bar AND browser history.
    // replaceState swaps the current history entry (the one holding the tokens)
    // instead of pgit commit -m "fix(auth): read OAuth2 tokens from URL fragment and scrub hash from history"git commit -m "fix(auth): read OAuth2 tokens from URL fragment and scrub hash from history"ushing a new one, so the tokenized URL is unrecoverable
    // via the back button.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (accessToken && refreshToken) {
      const tokenPayload = decodeJwtPayload(accessToken);
      const user = normalizeAuthUser({
        tokenPayload: tokenPayload as AuthUserLike | null,
        response: {
          email: tokenPayload?.email as string | undefined,
          firstName: tokenPayload?.firstName as string | undefined,
          lastName: tokenPayload?.lastName as string | undefined,
          role: (tokenPayload?.role as string | undefined) ?? 'USER',
          id: tokenPayload?.sub as string | undefined,
        },
      });

      login({
        user,
        accessToken,
        refreshToken
      });
      // replace: true keeps the transient handler page out of history too
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [login, navigate]);

  return <div className="p-10 text-center">Processing login...</div>;
};
