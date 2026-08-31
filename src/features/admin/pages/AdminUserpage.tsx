import { useState } from "react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import type { AdminUser, KycStatus, WalletResponse, WalletStatus } from "../validation/adminSchema";
import { fetchUserRetailWalletApi, updateUserKycApi } from "../api/adminApi";
import { AlertCircle, ChevronLeft, ChevronRight, FileSignature, Search, Wallet, X } from "lucide-react";

export const AdminUsersPage = () => {
  // 1. Delegate complex state and fetching to the custom hook
  const { 
    users, 
    pagination, 
    nextPage, 
    prevPage, 
    changeWalletStatus, 
    loading, 
    error, 
    refresh 
  } = useAdminUsers();

  // 2. UI-only state remains in the component
  const [kycModalUser, setKycModalUser] = useState<AdminUser | null>(null);
  const [kycForm, setKycForm] = useState({
    kycStatus: 'PENDING' as KycStatus,
    kycLevel: 1,
    adminNotes: ''
  });
  const [walletModalUser, setWalletModalUser] = useState<AdminUser | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [walletForm, setWalletForm] = useState({
    status: 'ACTIVE' as WalletStatus,
    reason: 'Manual review by admin'
  });
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const openWalletModal = async (user: AdminUser) => {
    setWalletModalUser(user);
    setWalletLoading(true);
    setWalletError(null);
    setWalletData(null);
    setWalletForm({
      status: 'ACTIVE',
      reason: 'Manual review by admin'
    });

    try {
      const wallet = await fetchUserRetailWalletApi(user.id);
      setWalletData(wallet);
      setWalletForm({
        status: wallet.status,
        reason: 'Manual review by admin'
      });
    } catch (err: any) {
      setWalletError(err.response?.data?.message || "Failed to load wallet details");
    } finally {
      setWalletLoading(false);
    }
  };

  const closeWalletModal = () => {
    setWalletModalUser(null);
    setWalletData(null);
    setWalletError(null);
    setWalletLoading(false);
    setWalletSaving(false);
  };

  const submitWalletStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser || !walletData) return;

    if (!window.confirm(`Are you sure you want to change this wallet to ${walletForm.status}?`)) return;

    setWalletSaving(true);
    try {
      const result = await changeWalletStatus(walletModalUser.id, walletForm.status, walletForm.reason);
      if (!result.success) {
        alert(`Failed to update wallet status: ${result.error}`);
        return;
      }

      const updatedWallet = await fetchUserRetailWalletApi(walletModalUser.id);
      setWalletData(updatedWallet);
      setWalletForm((current) => ({ ...current, status: updatedWallet.status }));
      await refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update wallet status");
    } finally {
      setWalletSaving(false);
    }
  };

  const getUserStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'SUSPENDED':
        return 'bg-amber-100 text-amber-700';
      case 'LOCKED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getWalletStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'FROZEN':
        return 'bg-slate-100 text-slate-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const openKycModal = (user: AdminUser) => {
    setKycModalUser(user);
    setKycForm({
      kycStatus: user.kycStatus ?? 'PENDING',
      kycLevel: user.kycLevel ?? 1,
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
        kycForm.adminNotes.trim()
      );
      setKycModalUser(null);
      refresh(); // Refresh the list from the hook to get updated data
  } catch (err) {
      alert("An error occurred while updating KYC.");
    }
  };

  // NOTE: idNumberMasked arrives pre-masked from the backend (e.g. "*****789").
  // No client-side PII masking — the raw ID number never reaches this app.

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">User Risk Operations</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by email..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">ID Info</th>
                <th className="p-4 font-medium">Account Status</th>
                <th className="p-4 font-medium">KYC Level</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading user data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {user.idType || 'ID'}: <span className="font-mono">{user.idNumberMasked || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getUserStatusClass(user.status)}`}>
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
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors" 
                          title="Manage KYC"
                        >
                          <FileSignature size={16} />
                        </button>
                        <button 
                          onClick={() => openWalletModal(user)}
                          className="p-1.5 rounded transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100" 
                          title="Manage Wallet"
                        >
                          <Wallet size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination dynamically driven by the hook */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-800">{pagination.currentPage + 1}</span> of <span className="font-medium text-slate-800">{Math.max(1, pagination.totalPages)}</span>
          </p>
          <div className="flex gap-2">
            <button 
              disabled={pagination.currentPage === 0 || loading}
              onClick={prevPage}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
              onClick={nextPage}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      {kycModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Review KYC Profile</h3>
              <button onClick={() => setKycModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleKycSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">KYC Status</label>
                <select 
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={kycForm.kycStatus} 
                  onChange={(e) => setKycForm({...kycForm, kycStatus: e.target.value as KycStatus})}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">KYC Level</label>
                <select 
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={kycForm.kycLevel} 
                  onChange={(e) => setKycForm({...kycForm, kycLevel: Number(e.target.value)})}
                >
                  <option value={1}>Tier 1 - Basic</option>
                  <option value={2}>Tier 2 - Verified</option>
                  <option value={3}>Tier 3 - Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Audit Notes (Required)</label>
                <textarea 
                  required 
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg h-24 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Reason for status change..." 
                  value={kycForm.adminNotes} 
                  onChange={(e) => setKycForm({...kycForm, adminNotes: e.target.value})} 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Manage Wallet</h3>
                <p className="text-xs text-slate-500">
                  {walletModalUser.firstName} {walletModalUser.lastName} · Account status {walletModalUser.status}
                </p>
              </div>
              <button onClick={closeWalletModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitWalletStatus} className="p-6 space-y-4">
              {walletLoading ? (
                <div className="py-8 text-center text-slate-500">Loading wallet details...</div>
              ) : walletError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {walletError}
                </div>
              ) : walletData ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Wallet Status</p>
                      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getWalletStatusClass(walletData.status)}`}>
                        {walletData.status}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Currency</p>
                      <p className="mt-2 text-lg font-semibold text-slate-800">{walletData.currency}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
                      <p className="mt-2 text-lg font-semibold text-slate-800">
                        {walletData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Available</p>
                      <p className="mt-2 text-lg font-semibold text-slate-800">
                        {walletData.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Wallet Type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{walletData.walletType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">New Wallet Status</label>
                    <select
                        className="w-full mt-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        value={walletForm.status}
                        onChange={(e) => setWalletForm({ ...walletForm, status: e.target.value as WalletStatus })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="FROZEN">FROZEN</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Audit Reason</label>
                      <textarea
                        required
                        className="w-full mt-1 p-2 border border-slate-300 rounded-lg h-24 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Reason for the wallet status change..."
                        value={walletForm.reason}
                        onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              <button
                type="submit"
                disabled={walletLoading || walletSaving || !walletData || walletForm.status === walletData.status}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletSaving ? "Updating..." : "Update Wallet Status"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
