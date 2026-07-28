import { useState } from "react";
import { useAdminTreasury } from "../hooks/useAdminTreasury";
import type { Currency, WalletType } from "../validation/adminSchema";
import { ArrowLeftRight, Building, ChevronLeft, ChevronRight, Info, RefreshCw, Wallet } from "lucide-react";

export const AdminTreasuryPage = () => {
  const {
    wallets,
    pagination,
    walletTypeFilter,
    setWalletTypeFilter,
    nextPage,
    prevPage,
    handleRebalance,
    loading,
    error,
    refresh
  } = useAdminTreasury();

  // Rebalance Form State
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [rebalanceForm, setRebalanceForm] = useState({
    sourceCurrency: 'KES' as Currency,
    withdrawAmount: 0,
    targetCurrency: 'USD' as Currency,
    depositAmount: 0,
    notes: ''
  });

  const submitRebalance = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!window.confirm("WARNING: You are executing a manual treasury ledger movement. Proceed?")) return;
    
    const result = await handleRebalance(rebalanceForm);
    if (result.success) {
      alert("Treasury Rebalance Executed Successfully.");
      setShowRebalanceModal(false);
    } else {
      alert(`Rebalance Failed: ${result.error}`);
    }
  };

  const tabs: { label: string; value: WalletType; desc: string }[] = [
    { label: 'Liquidity Pools', value: 'SYSTEM_LIQUIDITY', desc: 'Active corridor clearing funds' },
    { label: 'Platform Revenue', value: 'SYSTEM_MARKUP', desc: 'Retained profit margins' },
    { label: 'Routing Liabilities', value: 'SYSTEM_ROUTING', desc: 'Owed to external gateways' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Treasury Management</h1>
          <p className="text-xs text-slate-500">Monitor system wallets and manage cross-border liquidity</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowRebalanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeftRight size={16} /> Execute Rebalance
          </button>
          <button 
            onClick={refresh} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200">
          <Info size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setWalletTypeFilter(tab.value)}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              walletTypeFilter === tab.value 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Building className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-blue-800 text-sm">
            {tabs.find(t => t.value === walletTypeFilter)?.label} Grid
          </h4>
          <p className="text-blue-600 text-xs mt-1">
            {tabs.find(t => t.value === walletTypeFilter)?.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-3">Loading pools...</p>
        ) : wallets.length === 0 ? (
          <p className="text-slate-500 col-span-3">No system wallets found for this category.</p>
        ) : (
          wallets.map(wallet => (
            <div key={wallet.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-slate-100">
                <Wallet size={64} className="opacity-20 translate-x-4 -translate-y-4" />
              </div>
              <p className="text-sm font-bold text-slate-400 mb-1">{wallet.currency} POOL</p>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">
                {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>Available: {wallet.availableBalance.toLocaleString()}</span>
                <span>Locked: {wallet.lockedBalance.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={prevPage} disabled={pagination.currentPage === 0 || loading}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={nextPage} disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Rebalance Modal */}
      {showRebalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight size={18} className="text-indigo-600"/> Treasury Rebalance
              </h3>
              <button onClick={() => setShowRebalanceModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={submitRebalance} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">WITHDRAW FROM (Liquidity)</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={rebalanceForm.sourceCurrency} onChange={e => setRebalanceForm({...rebalanceForm, sourceCurrency: e.target.value as Currency})}>
                    <option value="KES">KES</option><option value="USD">USD</option><option value="GBP">GBP</option>
                  </select>
                  <input type="number" step="0.01" required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount..." value={rebalanceForm.withdrawAmount || ''} onChange={e => setRebalanceForm({...rebalanceForm, withdrawAmount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DEPOSIT TO (Liquidity)</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={rebalanceForm.targetCurrency} onChange={e => setRebalanceForm({...rebalanceForm, targetCurrency: e.target.value as Currency})}>
                    <option value="USD">USD</option><option value="KES">KES</option><option value="GBP">GBP</option>
                  </select>
                  <input type="number" step="0.01" required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount..." value={rebalanceForm.depositAmount || ''} onChange={e => setRebalanceForm({...rebalanceForm, depositAmount: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">AUDIT REASON / BROKER NOTES</label>
                <textarea required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-20" placeholder="e.g. Bought USD via FX Broker Ref X772" value={rebalanceForm.notes} onChange={e => setRebalanceForm({...rebalanceForm, notes: e.target.value})}></textarea>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Commit Double-Entry Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};