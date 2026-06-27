import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Replace prevents the user from using the back button to return to the protected route
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};