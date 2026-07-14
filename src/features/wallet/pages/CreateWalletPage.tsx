import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createWalletSchema, type CreateWalletFormData } from "../validation/createWalletShema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWallet } from "../services/walletService";
import { CheckCircle, Loader2, PlusCircle, Wallet } from "lucide-react";
import { currencies } from "../validation/transferSchema";
import { useState } from "react";

export const CreateWalletPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: CreateWalletFormData) => createWallet(data.currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setIsSuccess(true);
    }
  });

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-green-200 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Wallet Created!</h2>
        <p className="text-slate-500 mt-2">Your new currency wallet is ready to use.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Create another wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Wallet className="text-indigo-500" /> Create New Wallet
        </h2>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Choose Currency</label>
          <select 
            {...register("currency")} 
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
          </select>
          {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
        </div>

        <button 
          disabled={mutation.isPending}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          Create Wallet
        </button>
      </form>
    </div>
  );
};