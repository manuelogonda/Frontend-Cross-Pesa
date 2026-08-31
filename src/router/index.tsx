import { createBrowserRouter } from "react-router-dom";
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
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { AdminUsersPage } from "../features/admin/pages/AdminUserpage";
import { VerifyTopUpPage } from "../features/wallet/pages/VerifyTopUpPage";
import { KycSubmissionPage } from "../features/kyc/pages/KycSubmissionPage";
import { KycAdminDashboard } from "../features/kyc/pages/KycAdminDashboard";
import { AdminProtectedRoute } from "../components/layout/AdminProtectedRoute";
import { AdminLayout } from "../components/layout/AdminLayout";
import { AdminTreasuryPage } from "../features/admin/pages/AdminTreasuryPage";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  // --- Public Routes ---
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/oauth2/redirect', element: <OAuth2RedirectHandler /> },
  { path: "/wallet/verify-topup", element: <VerifyTopUpPage /> },

  // --- RETAIL USER ROUTES ---
  {
    element: <ProtectedRoute />, // Validates standard JWT
    children: [
      {
        element: <DashboardLayout />, // Clean retail-only layout
        children: [
          { path: '/dashboard', element: <WalletDashboardPage /> },
          { path: '/transfer', element: <TransferForm /> },
          { path: '/topup', element: <TopUpPage /> },
          { path: '/create-wallet', element: <Navigate to="/dashboard" replace /> },
          { path: '/beneficiaries', element: <BeneficiaryPage /> },
          { path: '/kyc-submission', element: <KycSubmissionPage /> }
        ],
      },
    ],
  },

  // --- ADMIN ROUTES ---
  {
    element: <AdminProtectedRoute />, // Strictly validates ROLE_ADMIN
    children: [
      {
        element: <AdminLayout />, // Dedicated admin shell
        children: [
          { path: '/admin-dashboard', element: <AdminDashboardPage /> },
          { path: '/admin-users', element: <AdminUsersPage /> },
          { path: '/admin-kyc', element: <KycAdminDashboard /> },
          { path: '/admin-transactions', element: <AdminTreasuryPage /> }
        ]
      }
    ]
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
