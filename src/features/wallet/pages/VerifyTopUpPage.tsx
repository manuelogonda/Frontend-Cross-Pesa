import { useNavigate, useSearchParams } from "react-router-dom";
import { useWallets } from "../hooks/useWallets";
import { useEffect, useRef, useState } from "react";

export const VerifyTopUpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyTopUp, topUpError } = useWallets();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  
  // 🚨 THE FIX: A shield to prevent React Strict Mode from running this twice
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // If we already started verifying, stop the second strict-mode run immediately
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      const txId = searchParams.get('transaction_id');
      const status = searchParams.get('status');
      
      const expectedAmount = sessionStorage.getItem("pending_topup_amount");
      const expectedCurrency = sessionStorage.getItem("pending_topup_currency");

      if (status !== 'successful' || !txId || !expectedAmount || !expectedCurrency) {
        setVerificationStatus('failed');
        return;
      }

      const isSuccess = await verifyTopUp(txId, expectedAmount, expectedCurrency);
      
      if (isSuccess) {
        setVerificationStatus('success');
        
        sessionStorage.removeItem("pending_topup_amount");
        sessionStorage.removeItem("pending_topup_currency");
        
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setVerificationStatus('failed');
      }
    };

    verify();
  }, [searchParams, verifyTopUp, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded shadow text-center">
        {verificationStatus === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Verifying your payment...</h2>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div>
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div>
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600">{topUpError || "Session expired or verification mismatched."}</p>
          </div>
        )}
      </div>
    </div>
  );
};