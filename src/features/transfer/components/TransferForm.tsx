import React, { useEffect, useState } from "react";
import { useWallets } from "../../wallet/hooks/useWallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransfer } from "../hooks/useTransfer";
import { RateDisplayCard } from "../../rates/components/RateDisplayCard";
import { ArrowRight, CheckCircle2, ShieldCheck, TrendingUp, User, WalletIcon } from "lucide-react";
import { TransferSchema, type TransferFormData } from "../validation/transferSchema";
import { Currencies } from "../../wallet/validation/walletShema";

// Temporary mock function until we build the Beneficiary API in the next step
const getBeneficiaries = async () => ({ content: [] });

export const TransferForm = () => {
  const { wallet, isLoading: walletLoading } = useWallets();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);

  // 1. Fetch Beneficiaries (Will be replaced by useBeneficiaries hook soon)
  useEffect(() => {
    getBeneficiaries()
      .then((res: any) => {
        setBeneficiaries(res.content || res || []);
      })
      .catch(console.error);
  }, []);

  // 2. Setup React Hook Form with strict Zod Validation
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm<TransferFormData>({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      sourceCurrency: wallet?.currency || 'USD',
      destinationCurrency: 'KES',
      amount: undefined,
    }
  });

  const { execute, isSubmitting, error, successData, reset: resetTransferState } = useTransfer();

  // Watch form fields for live UI updates
  const watchAmount = watch("amount") || 0;
  const watchBeneficiaryId = watch("beneficiaryId");
  const watchDestCurrency = watch("destinationCurrency");

  // Auto-bind wallet ID and source currency when wallet loads
  useEffect(() => {
    if (wallet) {
      setValue("sourceWalletId", wallet.id, { shouldValidate: true });
      setValue("sourceCurrency", wallet.currency, { shouldValidate: true });
    }
  }, [wallet, setValue]);

  // Update target currency when a beneficiary is chosen
  useEffect(() => {
    const selectedBen = beneficiaries.find(b => b.id === watchBeneficiaryId);
    if (selectedBen && selectedBen.accountCurrency) {
      setValue("destinationCurrency", selectedBen.accountCurrency, { shouldValidate: true });
    }
  }, [watchBeneficiaryId, beneficiaries, setValue]);

  const activeSourceCurrency = watch("sourceCurrency") || wallet?.currency || 'USD';

  // 3. Submit Handler
  const onSubmit = async (data: TransferFormData) => {
    try {
      await execute(data);
      reset();
    } catch {
      // Error handled cleanly by the useTransfer hook and displayed below
    }
  };

  // --- Success View (Matched to TransactionResponse DTO) ---
  if (successData) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-green-200 text-center space-y-5 max-w-lg mx-auto shadow-xl animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={42} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Transfer Initiated!</h3>
          <p className="text-sm text-slate-500 mt-1">Funds are on their way to your recipient.</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-sm font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Amount Sent:</span>
            <span className="font-bold text-slate-900">{successData.grossAmount.toFixed(2)} {successData.sourceCurrency}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Recipient Gets:</span>
            <span className="font-bold text-emerald-600">{successData.amountReceived.toFixed(2)} {successData.destinationCurrency}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200 mt-2">
            <span>Reference:</span>
            <span className="font-bold text-slate-900 break-all">{successData.reference}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Status:</span>
            <span className={`font-bold uppercase ${successData.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>
              {successData.status}
            </span>
          </div>
        </div>

        <button 
          onClick={resetTransferState}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md"
        >
          Send Another Transfer
        </button>
      </div>
    );
  }

  // --- Main Transfer Form ---
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Send Money</h2>
          <p className="text-xs text-slate-500">Fast, transparent cross-border payouts</p>
        </div>
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <TrendingUp size={22} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Primary Wallet Indicator (Auto-selected & Secured) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm">
            <WalletIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paying From</p>
            <p className="text-sm font-bold text-slate-800">
              {wallet ? `${wallet.currency} Retail Wallet` : 'Loading Wallet...'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Available</p>
          <p className="text-sm font-extrabold text-slate-900">
            {wallet ? `${wallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${wallet.currency}` : '0.00'}
          </p>
        </div>
      </div>

      {/* Hidden Wallet Inputs for Form State */}
      <input type="hidden" {...register("sourceWalletId")} />
      <input type="hidden" {...register("sourceCurrency")} />

      {/* Beneficiary Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <User size={14} /> Send To Beneficiary
        </label>
        <select 
          {...register("beneficiaryId")}
          className={`w-full p-4 border rounded-2xl bg-slate-50 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.beneficiaryId ? 'border-red-500' : 'border-slate-200'}`}
        >
          <option value="">Select a saved beneficiary...</option>
          {beneficiaries.map(b => (
            <option key={b.id} value={b.id}>
              {b.firstName} {b.lastName} ({b.accountCurrency || 'KES'}) • {b.payoutProvider}
            </option>
          ))}
        </select>
        {errors.beneficiaryId && <p className="text-red-500 text-xs mt-1.5">{errors.beneficiaryId.message}</p>}
      </div>

      {/* Send Amount Block */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">You Send Exactly</label>
          <div className="relative flex items-center">
            <input 
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className={`w-full p-4 pr-24 text-xl font-extrabold border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="0.00"
            />
            <span className="absolute right-4 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl">
              {activeSourceCurrency}
            </span>
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount.message}</p>}
        </div>

        {/* Destination Currency Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payout Currency</label>
          <select 
            {...register("destinationCurrency")}
            className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Currencies.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Breakdown Card */}
      {activeSourceCurrency && watchDestCurrency && watchAmount > 0 && (
        <RateDisplayCard 
          sourceCurrency={activeSourceCurrency} 
          destinationCurrency={watchDestCurrency} 
          amountToConvert={watchAmount}
        />
      )}

      {/* Trust Badge */}
      <div className="flex items-center gap-2 justify-center text-xs text-slate-400 pt-2">
        <ShieldCheck size={16} className="text-emerald-500" />
        <span>Protected by Double-Entry Ledger and SSL Encryption</span>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting || walletLoading || !watchBeneficiaryId}
        className="w-full py-4 bg-indigo-600 text-white font-extrabold text-lg rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
      >
        <span>{isSubmitting ? 'Processing Securely...' : 'Confirm and Transfer'}</span>
        {!isSubmitting && <ArrowRight size={20} />}
      </button>
    </form>
  );
};