import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardPage } from "../features/wallet/pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />, // Redirect root to dashboard
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />, // Protects all routes nested inside it
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      // Future protected routes (e.g., /transfer, /settings) will go here
    ],
  },
]);