import { AlertCircle, Loader2, PlusCircle, Wallet } from "lucide-react";
import { useWallets } from "../hooks/useWallets";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { TopUpSchema, type TopUpFormData, type TopUpFormValues } from "../validation/walletSchema";

export const TopUpPage = () => {
  const navigate = useNavigate();
  
  const { 
    wallet, 
    isLoading: walletLoading, 
    error: walletError,
    initiateTopUp,
    isTopUpLoading,
    topUpError
  } = useWallets();

  const {
    register,
    handleSubmit,
    setValue, 
    formState: { errors }
  } = useForm<TopUpFormValues, any, TopUpFormData>({
    resolver: zodResolver(TopUpSchema)
  });

  // Automatically lock the form's currency to the user's actual wallet currency
  useEffect(() => {
    if (wallet?.currency) {
      setValue("currency", wallet.currency);
    }
  }, [wallet, setValue]);

  const onSubmit = async (data: TopUpFormData) => {
    await initiateTopUp(data);
    // Note: The success state is handled by the Flutterwave redirect callback.
    // The user will physically leave this page to enter their card details.
  };

  // GUARD: Prevent top-up if they haven't created a wallet yet
  if (!walletLoading && !wallet) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-amber-200 text-center">
        <AlertCircle size={32} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">No Wallet Found</h2>
        <p className="text-slate-500 mt-2 mb-6">
          New users should already have a wallet after registration. Refresh first, then contact support if it still does not appear.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const displayError = topUpError || walletError;
  const isProcessing = isTopUpLoading || walletLoading;

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-500" size={24}/> Add Funds
        </h2>

        {displayError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{displayError}</p>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Deposit Currency</label>
          {/* Read-only UI representation of the user's currency */}
          <div className="w-full p-3 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 font-semibold flex items-center gap-2">
            <Wallet size={18} className="text-slate-400" />
            {walletLoading ? "Loading..." : wallet?.currency}
          </div>
          {/* Hidden input to satisfy react-hook-form/Zod requirements securely */}
          <input type="hidden" {...register("currency")} />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amount to Add</label>
          <input 
            type="number" 
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            disabled={isProcessing}
            className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isProcessing}
          className="w-full bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-md flex items-center justify-center gap-2"
        >
          {isTopUpLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Redirecting to Secure Checkout...
            </>
          ) : (
            "Fund Wallet"
          )}
        </button>
      </form>
    </div>
  );
};
