import { Activity, ArrowDownLeft, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Clock, DollarSign, RefreshCw, ShieldAlert } from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { TransactionStatus } from "../validation/adminSchema";

export const AdminDashboardPage = () => {
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

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'FLAGGED': return 'bg-red-100 text-red-700 animate-pulse';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'FAILED': return 'bg-slate-100 text-slate-700';
      case 'CANCELLED': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 max-w-xl mx-auto mt-8">
        <p className="text-red-600 font-medium">System Error: {error}</p>
        <button 
          onClick={refresh} 
          className="mt-4 px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Double-Entry Admin Control Center</h1>
          <p className="text-xs text-slate-500">Live balanced ledger telemetry, debits, and credits</p>
        </div>
        <button 
          onClick={refresh} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} /> Refresh
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Transactions Today</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics?.totalTransactionsToday || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Settlement</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics?.pendingTransactions || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-red-500 font-medium">Flagged Risk</p>
            <h3 className="text-2xl font-bold text-red-700">{metrics?.flaggedTransactions || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Platform Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">
              ${metrics?.totalRevenueToday?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </h3>
          </div>
        </div>
      </div>

      {/* GLOBAL LEDGER DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-semibold text-slate-800">Global Ledger Stream</h2>
            <p className="text-xs text-slate-500">Real-time debit/credit balancing across user and system wallets</p>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="FLAGGED">Flagged</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-medium">Ref / Timestamp</th>
                <th className="p-4 font-medium">Sender ID</th>
                <th className="p-4 font-medium">Debit Amount (-)</th>
                <th className="p-4 font-medium">Target Credit (+)</th>
                <th className="p-4 font-medium">System Revenue Ledger</th>
                <th className="p-4 font-medium">Applied Rates</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && transactions.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading ledger data...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions recorded.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    {/* Ref & Time */}
                    <td className="p-4">
                      <p className="font-mono text-xs text-slate-700 font-bold truncate max-w-[130px]" title={tx.reference}>
                        {tx.reference || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    {/* Sender */}
                    <td className="p-4">
                      <p className="font-mono text-slate-600 text-xs truncate max-w-[100px]">{tx.senderId.split('-')[0]}...</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold border rounded-md bg-blue-50 text-blue-700 border-blue-200">
                        USER_RETAIL
                      </span>
                    </td>

                    {/* DEBIT (-) COLUMN */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold">
                        <ArrowUpRight size={16} />
                        <span>-{tx.grossAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.sourceCurrency}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pl-5">Gross Amount Debited</p>
                    </td>

                    {/* CREDIT (+) COLUMN */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <ArrowDownLeft size={16} />
                        <span>+{tx.amountReceived?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.destinationCurrency}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        To: {tx.beneficiaryId ? 'External Beneficiary' : 'Internal Wallet'}
                      </p>
                    </td>

                    {/* SYSTEM LEDGER REVENUE CREDIT */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
                        <Building2 size={14} />
                        <span>+{(tx.markupFee || 0).toFixed(2)} (Markup)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pl-5">
                        Route Fee: +{(tx.routingFee || 0).toFixed(2)}
                      </p>
                    </td>

                    {/* FX Rates */}
                    <td className="p-4 text-xs font-mono text-slate-600">
                      <p>FX: {tx.fxRateApplied?.toFixed(4)}</p>
                      <p className="text-slate-400">USD Norm: {tx.usdNormalizationRate?.toFixed(4)}</p>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
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
            Page <span className="font-medium text-slate-800">{pagination.currentPage + 1}</span> of <span className="font-medium text-slate-800">{pagination.totalPages || 1}</span> 
            {" "}({pagination.totalElements} entries)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={pagination.currentPage === 0 || loading}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 text-xs font-medium transition-colors shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              onClick={nextPage} 
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 text-xs font-medium transition-colors shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};