import { AlertCircle, CheckCircle, Loader2, PlusCircle } from "lucide-react";
import { useWallets } from "../hooks/useWallets";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { currencies,topUpSchema, type TopUpFormData } from "../validation/topupSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export const TopUpPage: React.FC = () => {
  // 1. Destructure the custom hook elements we built for Flutterwave redirection
  const { 
    wallets, 
    isLoading: walletLoading, 
    error: walletError,
    initiateTopUp,
    isTopUpLoading,
    topUpError
  } = useWallets();

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema)
  });

  const onSubmit = async (data: TopUpFormData) => {
    // 2. Simply hand off the form payload to the hook. 
    // It calls Spring Boot and handles the window.location.href redirect out-of-the-box!
    await initiateTopUp(data);
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

  // 3. Combine hook level errors and component state level errors dynamically
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
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Wallet</label>
          <select 
            {...register("currency")} 
            disabled={isProcessing}
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
            {...register("amount", { valueAsNumber: true })} // Ensures value is cast to a primitive number for Zod matching
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