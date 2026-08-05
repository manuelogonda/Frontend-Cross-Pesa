import { AlertOctagon, ShieldCheck, Snowflake } from "lucide-react";
import type { Wallet } from "../validation/walletShema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WalletCardProps {
  wallet: Wallet;
}


export const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  
  // Dynamic styling based on the strict PostgreSQL WalletStatus enum
  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30',
          icon: <ShieldCheck size={14} className="mr-1" />
        };
      case 'FROZEN':
        return {
          bg: 'bg-blue-400/20 text-blue-100 border-blue-400/30',
          icon: <Snowflake size={14} className="mr-1" />
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-red-400/20 text-red-100 border-red-400/30',
          icon: <AlertOctagon size={14} className="mr-1" />
        };
      default:
        return {
          bg: 'bg-slate-400/20 text-slate-100 border-slate-400/30',
          icon: null
        };
    }
  };

  const theme = getStatusTheme(wallet.status);

  return (
    <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background element for a modern banking app feel */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <span className="font-semibold text-sm text-indigo-200 uppercase tracking-wider">
            Primary Balance
          </span>
        </div>
        
        {/* Dynamic status badge supporting all three PostgreSQL states */}
        <span className={`flex items-center text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold border ${theme.bg}`}>
          {theme.icon}
          {wallet.status}
        </span>
      </div>
      
      <div className="text-4xl font-extrabold tracking-tight relative z-10 mb-2">
        {wallet.currency} {wallet.availableBalance.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>
      
      {/* Double-Entry Ledger Transparency: Showing Locked Funds */}
      {wallet.lockedBalance > 0 && (
        <div className="text-sm font-medium text-indigo-200 mt-4 relative z-10 pt-4 border-t border-indigo-500/50 flex justify-between items-center">
          <span>Locked / Processing Funds</span>
          <span>{wallet.currency} {wallet.lockedBalance.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}</span>
        </div>
      )}
    </div>
  );
};