import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { OAuth2RedirectHandler } from "../components/ui/OAuth2RedirectHandler";
import { BeneficiaryPage } from "../features/beneficiaries/components/BeneficiaryPage";
import { TransferForm } from "../features/transfer/components/TransferForm";
import { WalletDashboardPage } from "../features/wallet/pages/WalletDashboardPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { TopUpPage } from "../features/wallet/pages/TopUpPage";
import { HomePage } from "../pages/HomePage";
import { ExchangeForm } from "../features/transfer/components/ExchngeFrom";
import { CreateWalletPage } from "../features/wallet/pages/CreateWalletPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { AdminUsersPage } from "../features/admin/pages/AdminUserpage";
import { VerifyTopUpPage } from "../features/wallet/pages/VerifyTopUpPage";
import { KycSubmissionPage } from "../features/kyc/pages/KycSubmissionPage";
import { KycAdminDashboard } from "../features/kyc/pages/KycAdminDashboard";

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
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/oauth2/redirect',
    element: <OAuth2RedirectHandler />, // Catches the Google login redirect
  },
  { path: '/admin-dashboard', 
    element: <AdminDashboardPage /> 
  },
  { path: '/admin-users', 
    element: <AdminUsersPage /> 
  },
  {
    path: '/admin-kyc',
    element: <KycAdminDashboard />
  },
  {
    path: "/wallet/verify-topup",
    element: <VerifyTopUpPage />
  },
  {
    element: <ProtectedRoute />, 
    children: [
      {
        element: <DashboardLayout />, // Wrap protected routes in the layout
        children: [
          { path: '/dashboard', element: <WalletDashboardPage /> },
          { path: '/transfer', element: <TransferForm /> },
          { path: '/topup', element: <TopUpPage /> },
          { path: '/wallets', element: <CreateWalletPage /> },
          { path: '/exchange', element: <ExchangeForm />},
          { path: '/beneficiaries', element: <BeneficiaryPage /> },
          { path: '/kyc-submission', element: <KycSubmissionPage /> }
        ],
      },
    ],
  },

  // Global 404 Catch-all
  {
    path: '*',
    element: (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="text-red-500 mt-2">Page not found.</p>
      </div>
    )
  }
 
]);