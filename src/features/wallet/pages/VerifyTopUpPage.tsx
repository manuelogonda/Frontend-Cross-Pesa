import { useNavigate, useSearchParams } from "react-router-dom";
import { useWallets } from "../hooks/useWallets";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Loader2, XCircle } from "lucide-react";

export const VerifyTopUpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // We only need the verify function and the error state from the hook
  const { verifyTopUp, topUpError } = useWallets();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  
  // 🚨 THE FIX: A shield to prevent React Strict Mode from running this API call twice
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // If we already started verifying, stop the second strict-mode run immediately
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      // Flutterwave redirects with these URL parameters
      const txId = searchParams.get('transaction_id');
      const status = searchParams.get('status');
      
      const expectedAmount = sessionStorage.getItem("pending_topup_amount");
      const expectedCurrency = sessionStorage.getItem("pending_topup_currency");

      if (status !== 'successful' || !txId || !expectedAmount || !expectedCurrency) {
        setVerificationStatus('failed');
        return;
      }

      // Execute strict backend Double-Entry Ledger validation
      const isSuccess = await verifyTopUp(txId, expectedAmount, expectedCurrency);
      
      if (isSuccess) {
        setVerificationStatus('success');
        
        // Clean up session storage so stale data isn't left behind
        sessionStorage.removeItem("pending_topup_amount");
        sessionStorage.removeItem("pending_topup_currency");
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setVerificationStatus('failed');
      }
    };

    verify();
  }, [searchParams, verifyTopUp, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in duration-300">
        
        {/* VERIFYING STATE */}
        {verificationStatus === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mb-6" />
            <h2 className="text-xl font-bold text-slate-900">Verifying your payment...</h2>
            <p className="text-slate-500 mt-2 text-sm">Please don't close this window.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {verificationStatus === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-8">Your wallet has been securely funded.</p>
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2 font-medium">
              <Loader2 size={16} className="animate-spin" /> Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* FAILED STATE */}
        {verificationStatus === 'failed' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <XCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 text-sm mb-8">
              {topUpError || "Session expired, invalid transaction, or amount mismatch."}
            </p>
            <button 
              onClick={() => navigate('/topup')}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Try Again
              <ArrowRight size={18} />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};