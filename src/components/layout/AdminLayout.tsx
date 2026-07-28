import { LayoutDashboard, LogOut, ShieldAlert, UserCheck, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Admin Sidebar - Dark themed for clear separation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
        <div className="p-6 font-bold text-xl text-white flex items-center gap-2 border-b border-slate-800">
            <ShieldAlert className="text-red-500" /> Admin Console
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6">
            <NavLink to="/admin-dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-red-500/20 text-red-400 font-medium' : 'hover:bg-slate-800 text-slate-300'}`}>
              <LayoutDashboard size={20} /> Platform Ledger
            </NavLink>
            <NavLink to="/admin-users" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-red-500/20 text-red-400 font-medium' : 'hover:bg-slate-800 text-slate-300'}`}>
              <Users size={20} /> Manage Users
            </NavLink>
            <NavLink to="/admin-transactions" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-red-500/20 text-red-400 font-medium' : 'hover:bg-slate-800 text-slate-300'}`}>
              <UserCheck size={20} /> Treasury Management
            </NavLink>
            <NavLink to="/admin-kyc" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-red-500/20 text-red-400 font-medium' : 'hover:bg-slate-800 text-slate-300'}`}>
              <UserCheck size={20} /> KYC Approvals
            </NavLink>
        
        </nav>
           
      </aside>
      {/* Right Side Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <><header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-6">
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Admin Session
            </span>
            <div className="pl-4 border-l border-slate-200">
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header><main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main></>
      </div>
    </div>
  );
};