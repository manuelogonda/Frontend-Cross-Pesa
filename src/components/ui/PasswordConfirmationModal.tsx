import { KeyRound, X } from "lucide-react";
import type { FormEvent } from "react";

type PasswordConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  password: string;
  error?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

export const PasswordConfirmationModal = ({
  open,
  title,
  description,
  password,
  error,
  isSubmitting = false,
  submitLabel = "Confirm",
  onPasswordChange,
  onSubmit,
  onCancel,
}: PasswordConfirmationModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600" aria-label="Close confirmation dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800 flex items-start gap-3">
            <KeyRound size={18} className="mt-0.5 shrink-0" />
            <p>Enter your account password to confirm this action.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Confirming..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
