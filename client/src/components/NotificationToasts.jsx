import React from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Sparkles, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationToasts({ setActivePage }) {
  const { toasts, dismissToast, setIsOpen: setDrawerOpen } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border-2 border-emerald-600/30 text-stone-900 animate-in slide-in-from-top-3 fade-in duration-300 flex items-start gap-3 ring-1 ring-black/5"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : toast.type === 'alert' ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-700" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs text-emerald-950 flex items-center justify-between">
              <span>{toast.title}</span>
            </h5>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
              {toast.message}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  dismissToast(toast.id);
                  setDrawerOpen(true);
                  if (toast.link && setActivePage) {
                    setActivePage(toast.link);
                  }
                }}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <span>View Updates</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
