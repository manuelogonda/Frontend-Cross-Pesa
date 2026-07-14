import React, { useEffect } from "react";
import { useWallets } from "../../wallet/hooks/useWallets";
import { getBeneficiaries } from "../../beneficiaries/services/beneficiaryService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, type TransferFormData } from "../validation/transferSchema";
import { useTransfer } from "../hooks/useTransfer";
import { RateDisplayCard } from "../../rates/components/RateDisplayCard";

export const TransferForm: React.FC = () => {
  // 1. Fetch auxiliary data (Wallets & Beneficiaries)
  const { wallets } = useWallets();
  const [beneficiaries, setBeneficiaries] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    getBeneficiaries().then(setBeneficiaries).catch(console.error);
  }, []);

  // 2. Setup React Hook Form with Zod
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    control,
    formState: { errors } 
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceCurrency: '',
      destinationCurrency: '',
    }
  });

  // 3. Setup our Submission Hook
  const { execute, isSubmitting, error, successData, reset: resetTransferState } = useTransfer();

  // 4. Watch fields to drive the UI dynamically
  const watchAmount = watch("amount");
  const watchSourceWalletId = watch("sourceWalletId");
  const watchBeneficiaryId = watch("beneficiaryId");

  // Automatically update the hidden currency fields when selections change
  useEffect(() => {
    const selectedWallet = wallets.find(w => w.id === watchSourceWalletId);
    if (selectedWallet) {
      setValue("sourceCurrency", selectedWallet.currency, { shouldValidate: true });
    }
  }, [watchSourceWalletId, wallets, setValue]);

  useEffect(() => {
    const selectedBen = (beneficiaries.content || beneficiaries || []).find(b => b.id === watchBeneficiaryId);
    if (selectedBen) {
      setValue("destinationCurrency", selectedBen.accountCurrency || 'KES', { shouldValidate: true });
    }
  }, [watchBeneficiaryId, beneficiaries, setValue]);

  // Derived values for the Rate Card
  const activeSourceCurrency = watch("sourceCurrency");
  const activeDestinationCurrency = watch("destinationCurrency");

  // 5. Submit Handler
  const onSubmit = async (data: TransferFormData) => {
    try {
      await execute(data);
      reset(); // Clears the react-hook-form inputs on success
    } catch (e) {
      // Error is handled by the hook and displayed below
    }
  };

  // --- Render Success State ---
  if (successData) {
    return (
      <div className="p-8 bg-green-50 rounded-2xl border border-green-200 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-2xl font-bold text-green-800">Transfer Initiated</h3>
        <p className="text-green-700">Reference: <span className="font-mono">{successData.gatewayReference}</span></p>
        <button 
          onClick={resetTransferState}
          className="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          Send Another Transfer
        </button>
      </div>
    );
  }

  // --- Render Form ---
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Send Money</h2>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

      {/* Source Wallet */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Pay From</label>
        <select 
          {...register("sourceWalletId")}
          className={`w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.sourceWalletId ? 'border-red-500' : 'border-slate-200'}`}
        >
          <option value="">Select a Wallet</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.currency} Wallet (Bal: {w.availableBalance.toLocaleString()})
            </option>
          ))}
        </select>
        {errors.sourceWalletId && <p className="text-red-500 text-xs mt-1">{errors.sourceWalletId.message}</p>}
      </div>

      {/* Beneficiary */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Send To</label>
        <select 
          {...register("beneficiaryId")}
          className={`w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.beneficiaryId ? 'border-red-500' : 'border-slate-200'}`}
        >
          <option value="">Select Beneficiary</option>
          {(beneficiaries.content || beneficiaries || []).map(b => (
            <option key={b.id} value={b.id}>
              {b.firstName} {b.lastName} • {b.payoutProvider}
            </option>
          ))}
        </select>
        {errors.beneficiaryId && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryId.message}</p>}
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Amount to Send</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400">
            {activeSourceCurrency || '$'}
          </span>
          <input 
            type="number"
            step="0.01"
            {...register("amount")}
            className={`w-full p-3 pl-14 text-lg border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${errors.amount ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="0.00"
          />
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Live FX Rate Integration */}
      {activeSourceCurrency && activeDestinationCurrency && watchAmount > 0 && (
        <RateDisplayCard 
          sourceCurrency={activeSourceCurrency} 
          destinationCurrency={activeDestinationCurrency} 
          amountToConvert={watchAmount}
        />
      )}

      {/* Hidden fields tracked by RHF */}
      <input type="hidden" {...register("sourceCurrency")} />
      <input type="hidden" {...register("destinationCurrency")} />

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md"
      >
        {isSubmitting ? 'Processing securely...' : 'Initiate Transfer'}
      </button>
    </form>
  );
};