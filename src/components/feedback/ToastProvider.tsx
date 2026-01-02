"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: ToastAction;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  notify: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toneMap = {
  success: "border-emerald-400/40 text-emerald-200",
  error: "border-red-400/40 text-red-200",
  warning: "border-amber-400/40 text-amber-200",
  info: "border-sky-400/40 text-sky-200",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const Icon = iconMap[toast.type];
  const ariaLive =
    toast.type === "error" || toast.type === "warning"
      ? "assertive"
      : "polite";
  const role = ariaLive === "assertive" ? "alert" : "status";

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (toast.duration === 0) return;
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, toast.duration ?? 3800);
    return () => clearTimeout(timeout);
  }, [toast.duration, onDismiss]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  const handleAction = () => {
    toast.action?.onClick();
    handleClose();
  };

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`pointer-events-auto rounded-xl border bg-black/80 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur transition duration-200 ${
        toneMap[toast.type]
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          <p className="text-sm text-white/80">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-white/60 hover:text-white transition"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={handleAction}
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/30 hover:bg-white/20"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((toast: ToastOptions) => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts([{ ...toast, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-3">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
