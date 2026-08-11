import { useWallets } from "../hooks/useWallets";
import { AlertCircle, ArrowUpRight, ChevronLeft, ChevronRight, PlusCircle, Wallet } from "lucide-react";
import { WalletCard } from "../components/WalletCard";
import { useNavigate } from "react-router-dom";
import { useWalletStatement } from "../hooks/useWalletStatement";
import { LedgerTable } from "../../ledger/components/LedgerTable";
import { useEffect } from "react";

export const WalletDashboardPage = () => {
  const navigate = useNavigate();
  
  // 1. Destructure wallet data and refetch handler
  const { wallet, isLoading: isLoadingWallet, error: walletError, refetch: refetchWallet } = useWallets();
  
  // 2. Destructure ledger statement data, pagination handlers, and refetch handler
  const { 
    entries, 
    pagination, 
    isLoading: isLoadingLedger, 
    error: ledgerError,
    nextPage,
    prevPage,
    refetch: refetchLedger
  } = useWalletStatement(5); // Show 5 entries per page for a cleaner dashboard view

  // 3. Force fresh data synchronization whenever the dashboard mounts
  useEffect(() => {
    refetchWallet();
    refetchLedger();
  }, [refetchWallet, refetchLedger]);

  if (isLoadingWallet) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
         <div className="animate-pulse text-lg font-medium flex items-center gap-2">
           <Wallet className="text-slate-400" /> Loading dashboard...
         </div>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} className="shrink-0" />
          <p className="font-medium">{walletError}</p>
        </div>
      </div>
    );
  }


const formattedEntries = entries.map((entry) => ({
  ...entry,
  direction: (entry.debit > 0 ? 'DEBIT' : 'CREDIT') as 'DEBIT' | 'CREDIT',
  formattedAmount: `${entry.amount}`,
  formattedBalance: `${entry.balanceAfter}`,
  badgeColor: entry.debit > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700',
}));

  // 4. EMPTY STATE: If the user hasn't created a wallet, prompt them to do so
  if (!wallet) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-12 text-center bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-300">
         <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <PlusCircle size={40} />
         </div>
         <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to AfriPay</h2>
         <p className="text-slate-500 mb-8 text-lg">You need to configure your primary currency wallet before you can manage funds.</p>
         <button 
           onClick={() => navigate('/create-wallet')}
           className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
         >
           Create Your Wallet
         </button>
      </div>
    );
  }

  // 5. MAIN DASHBOARD
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Wallet Overview</h1>
        <button 
           onClick={() => navigate('/topup')}
           className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow hover:shadow-lg flex items-center gap-2"
        >
          Add Funds
          <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Wallet Card Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WalletCard wallet={wallet} />
      </div>

      {/* Ledger Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Ledger Statement</h2>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full">
              {wallet.currency}
            </span>
          </div>
        </div>
        
        {ledgerError ? (
          <div className="p-8 text-center text-red-500 font-medium">
            Failed to load transaction history: {ledgerError}
          </div>
        ) : (
          <>
            <LedgerTable entries={formattedEntries} isLoading={isLoadingLedger} />
            
            {/* Pagination Controls Hooked up to useWalletStatement */}
            {entries.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-sm text-slate-500">
                  Page <span className="font-medium text-slate-800">{pagination.currentPage + 1}</span> of <span className="font-medium text-slate-800">{Math.max(1, pagination.totalPages)}</span>
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={prevPage} 
                    disabled={pagination.currentPage === 0 || isLoadingLedger}
                    className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={nextPage} 
                    disabled={pagination.currentPage >= pagination.totalPages - 1 || isLoadingLedger}
                    className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
    </div>
  );
};