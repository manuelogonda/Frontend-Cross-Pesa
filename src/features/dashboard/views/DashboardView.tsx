import { LogOut, Wallet } from "lucide-react";
import { useAuthStore } from "../../../core/store/authStore";

export default function DashboardView() {
  const { email, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">CrossPesa Ledger</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">{email}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        
        <p className="text-gray-600">
          Welcome back! Your multi-currency wallets, transactional channels, and security intercepts are active.
        </p>
      </div>
    </div>
  );
}