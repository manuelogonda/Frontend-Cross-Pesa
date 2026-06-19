import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./core/store/authStore";
import LoginView from "./features/auth/views/LoginView";
import RegisterView from "./features/auth/views/RegisterView";
import DashboardView from "./features/dashboard/views/DashboardView";


/**
 * 🔒 Protected Route Wrapper
 * Intercepts routing and redirects unauthenticated users to the login screen.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * 🛡️ Public Route Wrapper (Guest Route)
 * If a user is already authenticated, it blocks them from viewing login/register pages 
 * and automatically forwards them straight to the active dashboard session.
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚪 Public / Guest Gateway Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginView />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterView />
            </PublicRoute>
          }
        />

        {/* 🏰 Protected Business Core Features */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardView/>
            </ProtectedRoute>
          }
        />

        {/* 🔄 Global Fallback Redirect Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
