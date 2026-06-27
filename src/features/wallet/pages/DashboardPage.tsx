import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

export const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName}! 
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg">
          <p>Your authentication token is active and securely stored.</p>
          <p className="mt-2 text-sm font-medium">Logged in as: {user?.email} ({user?.role})</p>
        </div>
      </div>
    </div>
  );
};