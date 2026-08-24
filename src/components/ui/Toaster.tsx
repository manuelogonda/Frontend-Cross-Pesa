import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../store/toastStore';

const TOAST_STYLES: Record<ToastType, { icon: typeof Info; iconColor: string; barColor: string }> = {
  info: { icon: Info, iconColor: 'text-indigo-500', barColor: 'bg-indigo-500' },
  success: { icon: CheckCircle2, iconColor: 'text-emerald-500', barColor: 'bg-emerald-500' },
  error: { icon: AlertCircle, iconColor: 'text-red-500', barColor: 'bg-red-500' },
};

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
    >
      {toasts.map((t) => {
        const style = TOAST_STYLES[t.type];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300"
            role="status"
          >
            <span className={`w-1 self-stretch ${style.barColor}`} />
            <Icon size={20} className={`mt-3.5 shrink-0 ${style.iconColor}`} />
            <p className="flex-1 py-3.5 pr-2 text-sm font-medium text-slate-700">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="p-3.5 text-slate-400 transition-colors hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
