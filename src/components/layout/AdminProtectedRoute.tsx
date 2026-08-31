import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { isAdminToken } from "../../lib/jwt";

export const AdminProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. Check if the user is logged in at all
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verify the role parsed from the JWT payload (fail closed on decode errors)
  if (!isAdminToken(accessToken)) {
    // Logged in, but NOT an admin? Bounce them back to the retail dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in AND an admin? Let them through to the AdminLayout.
  return <Outlet />;
};
