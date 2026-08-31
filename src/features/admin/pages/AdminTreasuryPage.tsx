import { useState } from "react";
import { useAdminTreasury } from "../hooks/useAdminTreasury";
import type {
  Currency,
  StepUpAction,
  StepUpChallengeResponse,
  TreasuryRebalance,
  WalletType,
} from "../validation/adminSchema";
import {
  buildTreasuryRebalanceContext,
  requestTreasuryStepUpChallengeApi,
  verifyTreasuryStepUpChallengeApi,
} from "../api/adminApi";
import { ArrowLeftRight, Building, ChevronLeft, ChevronRight, Info, RefreshCw, Wallet, X } from "lucide-react";

const TREASURY_STEP_UP_ACTION: StepUpAction = "ADMIN_TREASURY_REBALANCE";

export const AdminTreasuryPage = () => {
  const {
    wallets,
    pagination,
    walletTypeFilter,
    setWalletTypeFilter,
    nextPage,
    prevPage,
    handleRebalance,
    loading,
    error,
    refresh
  } = useAdminTreasury();

  // Rebalance Form State
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [rebalanceForm, setRebalanceForm] = useState<TreasuryRebalance>({
    sourceCurrency: 'KES',
    withdrawAmount: 0,
    targetCurrency: 'USD',
    depositAmount: 0,
    notes: ''
  });
  const [rebalanceSubmitting, setRebalanceSubmitting] = useState(false);
  const [stepUpModalOpen, setStepUpModalOpen] = useState(false);
  const [stepUpChallenge, setStepUpChallenge] = useState<StepUpChallengeResponse | null>(null);
  const [stepUpCode, setStepUpCode] = useState("");
  const [stepUpRequesting, setStepUpRequesting] = useState(false);
  const [stepUpVerifying, setStepUpVerifying] = useState(false);
  const [stepUpError, setStepUpError] = useState<string | null>(null);

  const resetTreasuryFlow = () => {
    setShowRebalanceModal(false);
    setStepUpModalOpen(false);
    setStepUpChallenge(null);
    setStepUpCode("");
    setStepUpRequesting(false);
    setStepUpVerifying(false);
    setStepUpError(null);
    setRebalanceSubmitting(false);
  };

  const closeStepUpModal = () => {
    setStepUpModalOpen(false);
    setStepUpChallenge(null);
    setStepUpCode("");
    setStepUpRequesting(false);
    setStepUpVerifying(false);
    setStepUpError(null);
    setShowRebalanceModal(true);
  };

  const requestStepUpChallenge = async (payload: TreasuryRebalance) => {
    setStepUpRequesting(true);
    setStepUpError(null);
    try {
      const challenge = await requestTreasuryStepUpChallengeApi({
        action: TREASURY_STEP_UP_ACTION,
        context: buildTreasuryRebalanceContext(payload),
      });
      setStepUpChallenge(challenge);
      setStepUpCode("");
      setStepUpModalOpen(true);
      setShowRebalanceModal(false);
    } catch (err: any) {
      setStepUpError(err.response?.data?.message || "Failed to request step-up challenge");
    } finally {
      setStepUpRequesting(false);
      setRebalanceSubmitting(false);
    }
  };

  const submitRebalance = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!window.confirm("WARNING: You are executing a manual treasury ledger movement. Proceed?")) return;

    setRebalanceSubmitting(true);
    await requestStepUpChallenge(rebalanceForm);
  };

  const submitStepUpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepUpChallenge || !rebalanceForm) return;

    setStepUpVerifying(true);
    setStepUpError(null);

    try {
      const verification = await verifyTreasuryStepUpChallengeApi({
        challengeId: stepUpChallenge.challengeId,
        code: stepUpCode.trim(),
      });

      const result = await handleRebalance(rebalanceForm, verification.stepUpToken);
      if (!result.success) {
        setStepUpError(result.error);
        setStepUpChallenge(null);
        setStepUpCode("");
        return;
      }

      alert("Treasury Rebalance Executed Successfully.");
      resetTreasuryFlow();
    } catch (err: any) {
      setStepUpError(err.response?.data?.message || "Step-up verification failed");
    } finally {
      setStepUpVerifying(false);
    }
  };

  const requestNewCode = async () => {
    if (!rebalanceForm) return;
    await requestStepUpChallenge(rebalanceForm);
  };

  const tabs: { label: string; value: WalletType; desc: string }[] = [
    { label: 'Liquidity Pools', value: 'SYSTEM_LIQUIDITY', desc: 'Active corridor clearing funds' },
    { label: 'Platform Revenue', value: 'SYSTEM_MARKUP', desc: 'Retained profit margins' },
    { label: 'Routing Liabilities', value: 'SYSTEM_ROUTING', desc: 'Owed to external gateways' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Treasury Management</h1>
          <p className="text-xs text-slate-500">Monitor system wallets and manage cross-border liquidity</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setStepUpError(null);
              setShowRebalanceModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeftRight size={16} /> Execute Rebalance
          </button>
          <button 
            onClick={refresh} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200">
          <Info size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setWalletTypeFilter(tab.value)}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              walletTypeFilter === tab.value 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Building className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-blue-800 text-sm">
            {tabs.find(t => t.value === walletTypeFilter)?.label} Grid
          </h4>
          <p className="text-blue-600 text-xs mt-1">
            {tabs.find(t => t.value === walletTypeFilter)?.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-3">Loading pools...</p>
        ) : wallets.length === 0 ? (
          <p className="text-slate-500 col-span-3">No system wallets found for this category.</p>
        ) : (
          wallets.map(wallet => (
            <div key={wallet.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-slate-100">
                <Wallet size={64} className="opacity-20 translate-x-4 -translate-y-4" />
              </div>
              <p className="text-sm font-bold text-slate-400 mb-1">{wallet.walletType}</p>
              <p className="text-xs text-slate-500 mb-2">{wallet.currency} pool</p>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">
                {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>Available: {wallet.availableBalance.toLocaleString()}</span>
                <span>Locked: {wallet.lockedBalance.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={prevPage} disabled={pagination.currentPage === 0 || loading}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={nextPage} disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Rebalance Modal */}
      {showRebalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight size={18} className="text-indigo-600"/> Treasury Rebalance
              </h3>
              <button onClick={() => setShowRebalanceModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={submitRebalance} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">WITHDRAW FROM (Liquidity)</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={rebalanceForm.sourceCurrency} onChange={e => setRebalanceForm({...rebalanceForm, sourceCurrency: e.target.value as Currency})}>
                    <option value="KES">KES</option><option value="USD">USD</option><option value="GBP">GBP</option>
                  </select>
                  <input type="number" step="0.01" required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount..." value={rebalanceForm.withdrawAmount || ''} onChange={e => setRebalanceForm({...rebalanceForm, withdrawAmount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DEPOSIT TO (Liquidity)</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={rebalanceForm.targetCurrency} onChange={e => setRebalanceForm({...rebalanceForm, targetCurrency: e.target.value as Currency})}>
                    <option value="USD">USD</option><option value="KES">KES</option><option value="GBP">GBP</option>
                  </select>
                  <input type="number" step="0.01" required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount..." value={rebalanceForm.depositAmount || ''} onChange={e => setRebalanceForm({...rebalanceForm, depositAmount: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">AUDIT REASON / BROKER NOTES</label>
                <textarea required className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-20" placeholder="e.g. Bought USD via FX Broker Ref X772" value={rebalanceForm.notes} onChange={e => setRebalanceForm({...rebalanceForm, notes: e.target.value})}></textarea>
              </div>
              <button
                type="submit"
                disabled={rebalanceSubmitting || stepUpRequesting}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rebalanceSubmitting || stepUpRequesting ? "Requesting Step-Up..." : "Commit Double-Entry Record"}
              </button>
              {stepUpError && !stepUpModalOpen && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {stepUpError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {stepUpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div>
                <h3 className="font-bold text-slate-800">Step-Up Verification</h3>
                <p className="text-xs text-slate-500">
                  Email code required for treasury rebalancing
                </p>
              </div>
              <button
                onClick={closeStepUpModal}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close step-up verification"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitStepUpCode} className="space-y-4 p-6">
              {stepUpError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {stepUpError}
                </div>
              )}

              <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Challenge details</p>
                <p className="mt-1">
                  Delivery: <span className="font-semibold">{stepUpChallenge?.delivery || "EMAIL"}</span>
                </p>
                {stepUpChallenge?.expiresAt && (
                  <p className="mt-1">
                    Expires: <span className="font-semibold">{new Date(stepUpChallenge.expiresAt).toLocaleString()}</span>
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Enter the one-time code sent to the admin account currently signed in.
                </p>
              </div>

              {stepUpChallenge ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Verification Code</label>
                  <input
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter 6-digit code"
                    value={stepUpCode}
                    onChange={(e) => setStepUpCode(e.target.value)}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  The previous code is no longer active. Request a new code to continue.
                </div>
              )}

              <button
                type="submit"
                disabled={stepUpVerifying || stepUpRequesting || !stepUpChallenge}
                className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stepUpVerifying ? "Verifying..." : "Verify and Rebalance"}
              </button>

              <button
                type="button"
                onClick={requestNewCode}
                disabled={stepUpRequesting || !rebalanceForm}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stepUpRequesting ? "Sending Code..." : "Resend Code"}
              </button>

              <button
                type="button"
                onClick={closeStepUpModal}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                Back to Rebalance Form
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
