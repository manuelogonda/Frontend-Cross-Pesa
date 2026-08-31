import { X } from "lucide-react";
import type { FormEvent } from "react";
import type { StepUpChallengeResponse } from "../../features/admin/validation/adminSchema";

type StepUpCodeModalProps = {
  open: boolean;
  title: string;
  description: string;
  challenge: StepUpChallengeResponse | null;
  code: string;
  error?: string | null;
  isRequesting?: boolean;
  isVerifying?: boolean;
  submitLabel?: string;
  resendLabel?: string;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  onRequestNewCode?: () => void;
};

export const StepUpCodeModal = ({
  open,
  title,
  description,
  challenge,
  code,
  error,
  isRequesting = false,
  isVerifying = false,
  submitLabel = "Verify Code",
  resendLabel = "Resend Code",
  onCodeChange,
  onSubmit,
  onCancel,
  onRequestNewCode,
}: StepUpCodeModalProps) => {
  if (!open) return null;

  const disabled = isRequesting || isVerifying || !challenge;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600" aria-label="Close step-up dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {challenge ? (
            <>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-700 space-y-2">
                <p className="font-semibold text-indigo-800">Verification challenge issued</p>
                <p>
                  Delivery: <span className="font-medium text-slate-900">{challenge.delivery}</span>
                </p>
                <p>
                  Expires at: <span className="font-medium text-slate-900">{challenge.expiresAt}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Verification code
                </label>
                <input
                  value={code}
                  onChange={(event) => onCodeChange(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter the code"
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              {error || "Unable to start verification."}
            </div>
          )}

          {error && challenge && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {challenge && onRequestNewCode && (
              <button
                type="button"
                onClick={onRequestNewCode}
                disabled={isRequesting || isVerifying}
                className="px-4 py-2.5 rounded-2xl border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {isRequesting ? "Requesting..." : resendLabel}
              </button>
            )}
            <button
              type="submit"
              disabled={disabled}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
