import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { nanoid } from "nanoid";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastInternal extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  pushToast: (toast: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantToColor: Record<ToastVariant, string> = {
  success: "from-emerald-400 to-emerald-500",
  error: "from-rose-500 to-pink-500",
  info: "from-sky-500 to-blue-500",
  warning: "from-amber-400 to-amber-500"
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const pushToast = useCallback((toast: ToastOptions) => {
    const next: ToastInternal = {
      id: nanoid(),
      variant: "info",
      duration: 5_000,
      ...toast
    };

    setToasts((prev) => [...prev, next]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== next.id));
    }, next.duration);

    return () => clearTimeout(timeout);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed top-0 right-0 z-50 p-4 space-y-2 w-80 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto glass rounded-2xl border border-white/10 shadow-glow overflow-hidden"
            >
              <div
                className={`h-1 bg-gradient-to-r ${
                  variantToColor[toast.variant ?? "info"]
                } animate-progress-shimmer`}
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs text-white/70 mt-1">{toast.description}</p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
