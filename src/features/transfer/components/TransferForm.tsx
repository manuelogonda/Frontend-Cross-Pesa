import { useWallets, WALLET_QUERY_KEY } from "../../wallet/hooks/useWallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransfer, LEDGER_STATEMENT_QUERY_KEY, TRANSACTION_HISTORY_QUERY_KEY } from "../hooks/useTransfer";
import { RateDisplayCard } from "../../rates/components/RateDisplayCard";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck, TrendingUp, User, WalletIcon } from "lucide-react";
import { TransferSchema, type TransferFormInput } from "../validation/transferSchema";
import { Currencies } from "../../wallet/validation/walletSchema";
import { useBeneficiaries } from "../../beneficiaries/hooks/useBeneficiaries";
import { getTransactionStatusApi } from "../api/transactionApi";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY } from "../../notifications/hooks/useNotifications";
import type { TransferFormData } from "../validation/transferSchema";
import { StepUpCodeModal } from "../../../components/ui/StepUpCodeModal";
import { buildStepUpContext, requestStepUpChallengeApi, verifyStepUpChallengeApi } from "../../../lib/stepUp";
import type { StepUpAction, StepUpChallengeResponse } from "../../admin/validation/adminSchema";


export const TransferForm = () => {
  const { wallet, isLoading: walletLoading } = useWallets();
  // Single source of truth for saved beneficiaries (Zod-parsed via the API layer)
  const {
    beneficiaries,
    isLoading: isLoadingBeneficiaries,
    error: beneficiariesError,
  } = useBeneficiaries();

  // 2. Setup React Hook Form with strict Zod Validation
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm<TransferFormInput>({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      sourceCurrency: wallet?.currency || 'USD',
      destinationCurrency: 'KES',
      amount: 0,
    }
  });

  const { execute, isSubmitting, error, successData, setSuccessData, reset: resetTransferState, getIdempotencyKey } = useTransfer();
  const queryClient = useQueryClient();
  const [pendingTransfer, setPendingTransfer] = useState<TransferFormData | null>(null);
  const [stepUpModalOpen, setStepUpModalOpen] = useState(false);
  const [stepUpChallenge, setStepUpChallenge] = useState<StepUpChallengeResponse | null>(null);
  const [stepUpCode, setStepUpCode] = useState("");
  const [stepUpRequesting, setStepUpRequesting] = useState(false);
  const [stepUpVerifying, setStepUpVerifying] = useState(false);
  const [stepUpError, setStepUpError] = useState<string | null>(null);

  const TRANSFER_STEP_UP_ACTION: StepUpAction = "TRANSACTION_SEND";

  // Settlement just landed (payout sent or funds refunded) — balances moved and
  // the backend wrote the completion notification. Pull fresh server state now
  // instead of waiting for the next 30s notification poll.
  const invalidateSettledQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: LEDGER_STATEMENT_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: TRANSACTION_HISTORY_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  };

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

  const buildTransferContext = (payload: TransferFormData) =>
    buildStepUpContext([
      ["sourceWalletId", payload.sourceWalletId],
      ["beneficiaryId", payload.beneficiaryId],
      ["sourceCurrency", payload.sourceCurrency],
      ["destinationCurrency", payload.destinationCurrency],
      ["amount", payload.amount],
      ["idempotencyKey", getIdempotencyKey()],
    ]);

  const requestTransferChallenge = async (payload: TransferFormData) => {
    setStepUpRequesting(true);
    setStepUpError(null);
    setPendingTransfer(payload);
    try {
      const challenge = await requestStepUpChallengeApi({
        action: TRANSFER_STEP_UP_ACTION,
        context: buildTransferContext(payload),
      });
      setStepUpChallenge(challenge);
      setStepUpCode("");
      setStepUpModalOpen(true);
    } catch (err: any) {
      setStepUpChallenge(null);
      setStepUpModalOpen(true);
      setStepUpError(err.response?.data?.message || "Failed to request step-up challenge");
    } finally {
      setStepUpRequesting(false);
    }
  };

  const closeStepUpModal = () => {
    setStepUpModalOpen(false);
    setStepUpChallenge(null);
    setStepUpCode("");
    setStepUpRequesting(false);
    setStepUpVerifying(false);
    setStepUpError(null);
    setPendingTransfer(null);
  };

  const requestNewStepUpCode = async () => {
    if (!pendingTransfer) return;
    await requestTransferChallenge(pendingTransfer);
  };

  const submitStepUpCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stepUpChallenge || !pendingTransfer) return;

    setStepUpVerifying(true);
    setStepUpError(null);

    try {
      const verification = await verifyStepUpChallengeApi({
        challengeId: stepUpChallenge.challengeId,
        code: stepUpCode.trim(),
      });

      const transferPayload = pendingTransfer;
      closeStepUpModal();
      await execute(transferPayload, verification.stepUpToken);
    } catch (err: any) {
      setStepUpError(err.response?.data?.message || "Step-up verification failed");
    } finally {
      setStepUpVerifying(false);
    }
  };

  // Update target currency when a beneficiary is chosen
  useEffect(() => {
    const selectedBen = beneficiaries.find(b => b.id === watchBeneficiaryId);
    if (selectedBen && selectedBen.accountCurrency) {
      setValue("destinationCurrency", selectedBen.accountCurrency, { shouldValidate: true });
    }
  }, [watchBeneficiaryId, beneficiaries, setValue]);

  // Settlement worker advances PROCESSING -> COMPLETED/FAILED asynchronously
  // via payout webhooks; poll until terminal state and update the receipt.
  useEffect(() => {
    if (!successData) return;
    const wasTerminal = ['COMPLETED', 'FAILED', 'FLAGGED'].includes(successData.status);
    if (wasTerminal) return;

    const intervalId = setInterval(async () => {
      try {
        const next = await getTransactionStatusApi(successData.id);
        setSuccessData(next);

        // First observation of a terminal state: the settlement worker has
        // finished (payout sent, or funds refunded on FAILED) and the backend
        // has written the completion notification — so sync everything now.
        if (['COMPLETED', 'FAILED', 'FLAGGED'].includes(next.status)) {
          await invalidateSettledQueries();
        }
      } catch {
        // Transient poll failure — non-fatal, next tick retries
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [successData?.id, successData?.status, setSuccessData]);

  const activeSourceCurrency = watch("sourceCurrency") || wallet?.currency || 'USD';

  // 3. Submit Handler
  const onSubmit = async (data: TransferFormInput) => {
    try {
      await requestTransferChallenge(data as TransferFormData);
    } catch {
      // Error handled by hook and exposed via `error` state
    }
  };

  return (
    <div className="relative">
      {/* --- Main Transfer Form --- */}
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 items-center gap-1.5">
            <User size={14} /> Send To Beneficiary
          </label>
          <select 
            {...register("beneficiaryId")}
            disabled={isLoadingBeneficiaries}
            className={`w-full p-4 border rounded-2xl bg-slate-50 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.beneficiaryId ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="">
              {isLoadingBeneficiaries ? "Loading saved beneficiaries..." : beneficiaries.length === 0 ? "No saved beneficiaries found" : "Select a saved beneficiary..."}
            </option>
            {beneficiaries.map(b => (
              <option key={b.id} value={b.id}>
                {b.firstName} {b.lastName} ({b.accountCurrency || 'KES'}) • {b.payoutProvider}
              </option>
            ))}
          </select>
          {beneficiariesError && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} /> {beneficiariesError}
            </p>
          )}
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
                {...register("amount",{ valueAsNumber: true })}
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

      {/* --- SUCCESS MODAL POPUP --- */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-green-100 text-center space-y-5 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {(() => {
              const s = successData.status;
              const cfg =
                s === 'COMPLETED'
                  ? { icon: CheckCircle2, ring: 'bg-green-100 text-green-600', title: 'Transfer Completed!', sub: 'Funds have arrived at the recipient.' }
                  : s === 'FAILED'
                    ? { icon: AlertCircle, ring: 'bg-red-100 text-red-600', title: 'Transfer Failed', sub: 'Funds refunded to your wallet.' }
                    : { icon: Loader2, ring: 'bg-blue-100 text-blue-600', title: 'Transfer Initiated!', sub: "Money is on its way — we'll update this automatically." };
              const Icon = cfg.icon;
              return (
                <>
                  <div className={`w-16 h-16 ${cfg.ring} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
                    <Icon size={36} className={s === 'PROCESSING' || s === 'PENDING' ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{cfg.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{cfg.sub}</p>
                  </div>
                </>
              );
            })()}

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
                <span className="font-bold text-slate-900 break-all text-xs">{successData.reference}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className={`font-bold uppercase ${
                  successData.status === 'COMPLETED' ? 'text-green-600'
                  : successData.status === 'FAILED' ? 'text-red-600'
                  : 'text-blue-600 animate-pulse'
                }`}>
                  {successData.status}
                </span>
              </div>
              {(successData.payoutGateway || successData.payoutReference) && (
                <div className="flex justify-between text-slate-600">
                  <span>Payout:</span>
                  <span className="font-bold text-slate-900 break-all text-xs">
                    {[successData.payoutGateway, successData.payoutReference].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                reset(); // Resets React Hook Form fields
                resetTransferState(); // Closes the success modal & clears data
              }}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md"
            >
              Done / Send Another
            </button>
          </div>
        </div>
      )}

      {/* --- ERROR MODAL POPUP --- */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-red-100 text-center space-y-5 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Transfer Failed</h3>
              <p className="text-sm text-slate-500 mt-1">We couldn't process your transaction request.</p>
            </div>

            <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-sm font-medium text-left">
              {error}
            </div>

            <button 
              onClick={resetTransferState}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <StepUpCodeModal
        open={stepUpModalOpen}
        title="Confirm transfer"
        description="Enter the verification code to authorize this transfer."
        challenge={stepUpChallenge}
        code={stepUpCode}
        error={stepUpError}
        isRequesting={stepUpRequesting}
        isVerifying={stepUpVerifying}
        submitLabel="Authorize Transfer"
        resendLabel="Resend Code"
        onCodeChange={setStepUpCode}
        onSubmit={submitStepUpCode}
        onCancel={closeStepUpModal}
        onRequestNewCode={requestNewStepUpCode}
      />
    </div>
  );
};
