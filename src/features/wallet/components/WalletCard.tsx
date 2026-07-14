import type { Wallet } from "../validation/transferSchema";

interface WalletCardProps {
  wallet: Wallet;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, isActive, onClick }) => {
  return (
    <div 
      onClick={() => onClick(wallet.id)}
      className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
        isActive 
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
          : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-indigo-300'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-sm opacity-80">{wallet.currency} Wallet</span>
        {isActive && (
          <span className="text-xs bg-black/20 px-2 py-1 rounded-full uppercase tracking-wide">
            Active
          </span>
        )}
      </div>
      <div className="text-3xl font-bold">
        {wallet.currency} {wallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      {wallet.lockedBalance > 0 && (
        <div className="text-sm mt-2 opacity-75">
          Locked: {wallet.currency} {wallet.lockedBalance.toLocaleString()}
        </div>
      )}
    </div>
  );
};