import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const AdminProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. Check if the user is logged in at all
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  let isAdmin = false;

  try {
    // 2. Safely decode the JWT Payload
    // JWTs are base64 encoded. The payload is always the second segment (index 1).
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // 3. Verify the role matches exactly what Spring Boot generates
    const userRole = String(payload.role || '').toUpperCase();
    isAdmin = userRole.includes('ADMIN');
  } catch (error) {
    console.error("Failed to decode token for admin verification", error);
    // If the token is mangled, default to false for security
    isAdmin = false;
  }

  // 4. Route securely based on the parsed role
  if (!isAdmin) {
    // Logged in, but NOT an admin? Bounce them back to the retail dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in AND an admin? Let them through to the AdminLayout.
  return <Outlet />;
};