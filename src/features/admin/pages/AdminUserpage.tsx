import { useEffect, useState } from "react";
import { fetchAdminUsersApi, updateUserKycApi, updateUserStatusApi } from "../api/adminApi";
import { Ban, FileSignature, Search, Shield, X } from "lucide-react";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [kycModalUser, setKycModalUser] = useState<any | null>(null);
  const [kycForm, setKycForm] = useState({
    kycStatus: 'PENDING',
    kycLevel: 1,
    adminNotes: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsersApi(page, 15);
      setUsers(data.content);
      setTotalPages(data.page.totalPages);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
    try {
      await updateUserStatusApi(userId, newStatus, `Manual review by admin`);
      loadUsers();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const openKycModal = (user: any) => {
    setKycModalUser(user);
    setKycForm({
      kycStatus: user.kycStatus || 'PENDING',
      kycLevel: user.kycLevel || 1,
      adminNotes: ''
    });
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycModalUser) return;

    try {
      await updateUserKycApi(
        kycModalUser.id, 
        kycForm.kycStatus, 
        kycForm.kycLevel, 
        kycForm.adminNotes
      );
      setKycModalUser(null);
      loadUsers();
    } catch (err) {
      console.error("Failed to update KYC", err);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by email..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">ID Info</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">KYC Level</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    {user.idType}: <span className="font-mono">{user.idNumber || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold ${user.kycStatus === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.kycStatus}
                    </span>
                    <p className="text-xs text-slate-500">Tier {user.kycLevel}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openKycModal(user)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" 
                        title="Manage KYC"
                      >
                        <FileSignature size={16} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className={`p-1.5 rounded ${user.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} 
                        title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'ACTIVE' ? <Ban size={16} /> : <Shield size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* KYC Modal */}
      {kycModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Review KYC Profile</h3>
              <button 
              onClick={() => setKycModalUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleKycSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">KYC Status</label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-lg" 
                value={kycForm.kycStatus} 
                onChange={(e) => setKycForm({...kycForm, kycStatus: e.target.value})}>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">KYC Level</label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-lg" 
                value={kycForm.kycLevel} onChange={(e) =>
                 setKycForm({...kycForm, kycLevel: Number(e.target.value)})}>
                  <option value={1}>Tier 1 - Basic</option>
                  <option value={2}>Tier 2 - Verified</option>
                  <option value={3}>Tier 3 - Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Audit Notes</label>
                <textarea required className="w-full mt-1 p-2 border border-slate-300 rounded-lg h-24" placeholder="Reason for status change..." 
                value={kycForm.adminNotes} onChange={(e) => setKycForm({...kycForm, adminNotes: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Update Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};