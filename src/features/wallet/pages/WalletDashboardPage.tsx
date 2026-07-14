import { useEffect, useState } from "react";
import { useWallets } from "../hooks/useWallets";
import { useLedger } from "../../../shared/ledger/hooks/useLedger";
import { AlertCircle } from "lucide-react";
import { WalletCard } from "../components/WalletCard";
import { LedgerTable } from "../../../shared/ledger/components/LedgerTable";

export const WalletDashboardPage: React.FC = () => {
  const { wallets, isLoading: isLoadingWallets, error: walletsError } = useWallets();
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  
  // Now using the shared Ledger hook
  const { entries, isLoading: isLoadingLedger, error: ledgerError } = useLedger(activeWalletId);

  useEffect(() => {
    if (wallets.length > 0 && !activeWalletId) {
      setActiveWalletId(wallets[0].id);
    }
  }, [wallets, activeWalletId]);

  if (isLoadingWallets) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  if (walletsError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
        <AlertCircle size={20} />
        {walletsError}
      </div>
    );
  }

  const activeWallet = wallets.find(w => w.id === activeWalletId);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900"> Wallet Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <WalletCard 
            key={wallet.id}
            wallet={wallet}
            isActive={activeWalletId === wallet.id}
            onClick={setActiveWalletId}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            Recent Activity {activeWallet && <span className="text-indigo-600">({activeWallet.currency})</span>}
          </h2>
        </div>
        
        {ledgerError ? (
          <div className="p-6 text-center text-red-500">{ledgerError}</div>
        ) : (
          <LedgerTable entries={entries} isLoading={isLoadingLedger} />
        )}
      </div>
    </div>
  );
};