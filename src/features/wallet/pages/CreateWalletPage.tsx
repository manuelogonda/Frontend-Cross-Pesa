import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWallet } from "../services/walletService";
import { AlertCircle, ArrowRight, CheckCircle, Loader2, PlusCircle, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallets } from "../hooks/useWallets";
import { CreateWalletSchema, Currencies, type CreateWalletFormData } from "../validation/walletSchema";


export const CreateWalletPage = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Fetch current wallet state and the refetch function
  const { wallet, isLoading: isWalletLoading, refetch } = useWallets();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(CreateWalletSchema)
  });

  // 2. Standardized async submission
  const onSubmit = async (data: CreateWalletFormData) => {
    setServerError(null);
    try {
      await createWallet(data.currency);
      await refetch(); // Update the global wallet state immediately
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to create wallet. Please try again.');
    }
  };

  // 3. Loading state while checking if a wallet exists
  if (isWalletLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
        <Loader2 size={32} className="animate-spin mb-2 text-indigo-600" />
        <p className="text-sm font-medium">Checking wallet status...</p>
      </div>
    );
  }

  // 4. GUARD: If user already has a wallet, block creation form
  if (wallet) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Wallet Already Exists</h2>
        <p className="text-slate-500 mt-2">
          You already have an active <span className="font-semibold text-slate-700">{wallet.currency}</span> wallet. Each account is limited to one primary wallet on this platform.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // 5. SUCCESS SCREEN
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-green-200 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Wallet Created!</h2>
        <p className="text-slate-500 mt-2">Your wallet is configured and ready to receive deposits.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          View Wallet Dashboard
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // 6. INITIAL CREATION FORM
  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Wallet className="text-indigo-500" /> Create Your Wallet
        </h2>
        <p className="text-slate-500 text-sm mb-6">Select your primary operating currency.</p>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Choose Currency</label>
          <select 
            {...register("currency")} 
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 font-medium bg-white"
          >
            {Currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
          </select>
          {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          Create Wallet
        </button>
      </form>
    </div>
  );
};