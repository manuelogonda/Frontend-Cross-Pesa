import { Activity, ChevronLeft, ChevronRight, Clock, DollarSign, RefreshCw, ShieldAlert } from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

export const AdminDashboardPage: React.FC = () => {
  const {
    metrics,
    transactions,
    pagination,
    statusFilter,
    handleFilterChange,
    nextPage,
    prevPage,
    loading,
    error,
    refresh
  } = useAdminDashboard();

  // Helper for status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'FLAGGED': return 'bg-red-100 text-red-700 animate-pulse';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'FAILED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button onClick={refresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tx Today</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics?.totalTransactionsToday || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics?.pendingTransactions || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-red-500 font-medium">Flagged (Fraud)</p>
            <h3 className="text-2xl font-bold text-red-700">{metrics?.flaggedTransactions || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Revenue Today</p>
            <h3 className="text-2xl font-bold text-slate-800">${metrics?.totalRevenueToday?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">Global Ledger</h2>
          <select 
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="FLAGGED">Flagged</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-medium">Sender</th>
                <th className="p-4 font-medium">Beneficiary</th>
                <th className="p-4 font-medium">Amount Sent</th>
                <th className="p-4 font-medium">Platform Fee</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading ledger...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{tx.senderName}</p>
                      <p className="text-xs text-slate-500">{tx.senderEmail}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{tx.beneficiaryName}</p>
                      <p className="text-xs text-slate-500 font-mono">{tx.beneficiaryAccount}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {tx.sourceAmount.toLocaleString()} {tx.sourceCurrency}
                    </td>
                    <td className="p-4 text-slate-600">
                      {tx.platformFee > 0 ? `$${tx.platformFee.toFixed(2)}` : 'Free'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <span className="text-sm text-slate-500">
            Showing Page <span className="font-medium text-slate-800">{pagination.currentPage + 1}</span> of <span className="font-medium text-slate-800">{pagination.totalPages || 1}</span> 
            {" "}({pagination.totalElements} total entries)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={pagination.currentPage === 0}
              className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              onClick={nextPage} 
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};