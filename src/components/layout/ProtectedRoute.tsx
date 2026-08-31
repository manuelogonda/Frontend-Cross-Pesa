import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { isAdminToken } from "../../lib/jwt";

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!isAuthenticated) {
    // Replace prevents the user from using the back button to return to the protected route
    return <Navigate to="/login" replace />;
  }

  // Admins are barred from the retail shell entirely — route them home.
  // A mangled token decodes as non-admin (fail-open here; the backend still
  // enforces authorization on every request).
  if (accessToken && isAdminToken(accessToken)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
