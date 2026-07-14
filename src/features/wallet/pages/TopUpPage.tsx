import { useState } from "react";
import { useWallets } from "../hooks/useWallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "../../../lib/axios";
import { AlertCircle, CheckCircle, Loader2, PlusCircle } from "lucide-react";
import { currencies, topUpSchema, type TopUpFormData } from "../validation/topupSchema";

export const TopUpPage: React.FC = () => {
  const { wallets, isLoading: walletLoading, error: walletError } = useWallets();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema)
  });

  const onSubmit = async (data: TopUpFormData) => {
    setError(null);
    try {
      // API call to the actual backend endpoint
      await apiClient.post('/wallets/top-up', { 
        currency: data.currency, 
        amount: data.amount 
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Top-up failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-green-200 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Top-up Successful!</h2>
        <p className="text-slate-500 mt-2">The funds have been successfully added to your wallet.</p>
        <button 
          onClick={() => { setSuccess(false); reset(); }}
          className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Top up another wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-500" size={24}/> Add Funds
        </h2>

        {(error || walletError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error || walletError}</p>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Wallet</label>
          <select 
            {...register("currency")} 
            disabled={walletLoading}
            className={`w-full p-3 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.currency ? 'border-red-500' : 'border-slate-200'}`}
          >
           {currencies.map((curr) => (
           <option key={curr} value={curr}>
           {curr}
          </option>
        ))}
          </select>
          {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amount to Add</label>
          <input 
            type="number" 
            step="0.01"
            {...register("amount")}
            className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || walletLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            "Fund Wallet"
          )}
        </button>
      </form>
    </div>
  );
};