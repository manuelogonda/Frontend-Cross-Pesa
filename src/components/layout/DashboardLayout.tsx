import { LayoutDashboard, LogOut, PlusCircle, Send, User, Users, Wallet } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import { useAuthStore } from '../../store/authStore';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar - Retail */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 font-bold text-xl text-indigo-600 flex items-center gap-2">
            <Wallet /> CrossPesa
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}>
                <LayoutDashboard size={20}/> Dashboard
            </NavLink>
            <NavLink to="/topup" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}>
                <PlusCircle size={20}/> Top-up Wallet
            </NavLink>
            <NavLink to="/transfer" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}>
                <Send size={20}/> Send Money
            </NavLink>
            <NavLink to="/beneficiaries" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}>
                <Users size={20}/> Beneficiaries
            </NavLink>
            <NavLink to="/kyc-submission" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-700'}`}>
              <User size={20} /> KYC Profile
            </NavLink>
        </nav>
      </aside>

      {/* Right Side Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm cursor-pointer">
              <span>JP</span>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};
