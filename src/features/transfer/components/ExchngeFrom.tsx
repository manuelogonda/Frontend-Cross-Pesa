

import { zodResolver } from "@hookform/resolvers/zod";
import { exchangeSchema, type ExchangeFormData } from "../validation/transferSchema";
import { useWallets } from "../../wallet/hooks/useWallets";
import { useExchange } from "../hooks/useExchange";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { RateDisplayCard } from "../../rates/components/RateDisplayCard";

export const ExchangeForm: React.FC = () => {
  const { wallets } = useWallets();
  
  const { execute, isSubmitting, error, successData, reset: resetExchangeState } = useExchange();

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm<ExchangeFormData>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: { sourceCurrency: '', destinationCurrency: '' }
  });

  const watchAmount = watch("amount");
  const watchSourceId = watch("sourceWalletId");
  const watchDestId = watch("destinationWalletId");

  useEffect(() => {
    const sourceWallet = wallets.find(w => w.id === watchSourceId);
    if (sourceWallet) setValue("sourceCurrency", sourceWallet.currency, { shouldValidate: true });

    const destWallet = wallets.find(w => w.id === watchDestId);
    if (destWallet) setValue("destinationCurrency", destWallet.currency, { shouldValidate: true });
  }, [watchSourceId, watchDestId, wallets, setValue]);

  const activeSourceCurrency = watch("sourceCurrency");
  const activeDestinationCurrency = watch("destinationCurrency");

  const onSubmit = async (data: ExchangeFormData) => {
    try {
      await execute(data);
      reset(); // Clear form fields
    } catch (err: any) {
      // Error is caught by the hook
     
    }
  };

  if (successData) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-green-200 text-center space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ArrowRightLeft size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Exchange Complete!</h3>
        <p className="text-slate-500">Reference: <span className="font-mono font-bold text-slate-700">{successData.gatewayReference}</span></p>
        
        <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl shadow-sm flex flex-col gap-3 text-left w-full mt-6">
           <div className="flex justify-between items-center border-b border-slate-200 pb-3">
             <span className="text-slate-500 font-medium">Converted</span>
             <span className="font-bold text-slate-800 text-lg">{successData.sourceAmount} {successData.sourceCurrency}</span>
           </div>
           <div className="flex justify-between items-center pt-1">
             <span className="text-slate-500 font-medium">Received</span>
             <span className="font-bold text-green-600 text-lg">+{successData.destinationAmount} {successData.destinationCurrency}</span>
           </div>
        </div>

        <button 
          onClick={resetExchangeState}
          className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md"
        >
          Make Another Exchange
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <ArrowRightLeft size={20} />
        </div>
        Move Funds Within Your Wallets
      </h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Wallet</label>
          <select 
            {...register("sourceWalletId")}
            className={`w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none ${errors.sourceWalletId ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="">Select source wallet...</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.currency} (Available: {w.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </option>
            ))}
          </select>
          {errors.sourceWalletId && <p className="text-red-500 text-xs mt-1">{errors.sourceWalletId.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Wallet</label>
          <select 
            {...register("destinationWalletId")}
            className={`w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none ${errors.destinationWalletId ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="">Select destination wallet...</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.currency} (Available: {w.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </option>
            ))}
          </select>
          {errors.destinationWalletId && <p className="text-red-500 text-xs mt-1">{errors.destinationWalletId.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount to Exchange</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400">
              {activeSourceCurrency || '$'}
            </span>
            <input 
              type="number"
              step="0.01"
              {...register("amount")}
              className={`w-full p-4 pl-14 text-lg font-medium border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
      </div>

      {activeSourceCurrency && activeDestinationCurrency && watchAmount > 0 && activeSourceCurrency !== activeDestinationCurrency && (
        <RateDisplayCard 
          sourceCurrency={activeSourceCurrency} 
          destinationCurrency={activeDestinationCurrency} 
          amountToConvert={watchAmount}
        />
      )}

      <input type="hidden" {...register("sourceCurrency")} />
      <input type="hidden" {...register("destinationCurrency")} />

      <button 
        type="submit" 
        disabled={isSubmitting || !watchSourceId || !watchDestId}
        className="w-full py-4 mt-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
      >
        {isSubmitting ? 'Processing Exchange...' : 'Confirm Exchange'}
      </button>
    </form>
  );
};