import { Activity, ArrowDownLeft, ArrowUpRight, BadgeCheck, Building2, ChevronLeft, ChevronRight, Clock, DollarSign, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";
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

  type MetricCard = {
    label: string;
    value: string | number;
    icon: ComponentType<{ size?: number }>;
    iconClassName: string;
    valueClassName: string;
    labelClassName?: string;
    cardClassName?: string;
  };

  const metricCards: MetricCard[] = [
    {
      label: "Transactions Today",
      value: metrics?.totalTransactionsToday || 0,
      icon: Activity,
      iconClassName: "bg-indigo-100 text-indigo-600",
      valueClassName: "text-slate-800",
    },
    {
      label: "Pending Settlement",
      value: metrics?.pendingTransactions || 0,
      icon: Clock,
      iconClassName: "bg-yellow-100 text-yellow-600",
      valueClassName: "text-slate-800",
    },
    {
      label: "Flagged Risk",
      value: metrics?.flaggedTransactions || 0,
      icon: ShieldAlert,
      iconClassName: "bg-red-100 text-red-600",
      valueClassName: "text-red-700",
      labelClassName: "text-red-500",
      cardClassName: "border-red-200",
    },
    {
      label: "Platform Revenue",
      value: `$${metrics?.totalRevenueToday?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      icon: DollarSign,
      iconClassName: "bg-green-100 text-green-600",
      valueClassName: "text-slate-800",
    },
    {
      label: "Net Markup Revenue",
      value: `$${metrics?.netMarkupRevenueToday?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      icon: TrendingUp,
      iconClassName: "bg-emerald-100 text-emerald-600",
      valueClassName: "text-slate-800",
    },
    {
      label: "Completed Today",
      value: metrics?.completedTransactionsToday || 0,
      icon: BadgeCheck,
      iconClassName: "bg-sky-100 text-sky-600",
      valueClassName: "text-slate-800",
    },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 xl:gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const cardClassName = card.cardClassName ?? "border-slate-200";
          const labelClassName = card.labelClassName ?? "text-slate-500";

          return (
            <div
              key={card.label}
              className={`bg-white p-5 xl:p-6 rounded-xl border shadow-sm flex items-center gap-4 min-h-[108px] ${cardClassName}`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${card.iconClassName}`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${labelClassName}`}>{card.label}</p>
                <h3 className={`text-2xl font-bold break-words ${card.valueClassName}`}>{card.value}</h3>
              </div>
            </div>
          );
        })}
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
            <tr key={tx.transactionId} className="hover:bg-slate-50 transition-colors">
              {/* Ref & Time */}
              <td className="p-4">
                <p className="font-mono text-xs text-slate-700 font-bold truncate max-w-32.5" title={tx.gatewayReference || undefined}>
                  {tx.gatewayReference || 'N/A'}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </td>

              {/* Sender */}
              <td className="p-4">
                <p className="font-medium text-slate-700 text-xs truncate max-w-30">{tx.senderName}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-30">{tx.senderEmail}</p>
              </td>

              {/* DEBIT (-) COLUMN */}
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-red-600 font-bold">
                  <ArrowUpRight size={16} />
                  <span>-{tx.grossAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.sourceCurrency}</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-5">Net: {tx.netAmount?.toFixed(2)}</p>
              </td>

              {/* CREDIT (+) COLUMN */}
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <ArrowDownLeft size={16} />
                  <span>+{tx.destinationAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.destinationCurrency}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-30" title={tx.beneficiaryName}>
                  To: {tx.beneficiaryName}
                </p>
              </td>

              {/* SYSTEM LEDGER REVENUE CREDIT */}
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
                  <Building2 size={14} />
                  <span>+{(tx.markupFee || 0).toFixed(2)} (Markup)</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-5">
                  Route Fee: +{(tx.routingFee || 0).toFixed(2)} | Total: +{(tx.totalFee || 0).toFixed(2)}
                </p>
              </td>

              {/* FX Rates */}
              <td className="p-4 text-xs font-mono text-slate-600">
                <p>FX: {tx.exchangeRate?.toFixed(4)}</p>
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
