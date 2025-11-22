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

      <div className="pointer-events-none fixed top-4 right-4 z-[70] flex flex-col gap-3 w-80 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-glass-heavy backdrop-blur-xl border border-white/10 shadow-glow-sm"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${variantToColor[toast.variant ?? "info"]
                  }`}
              />
              <div className="p-4 pl-5">
                <p className="text-sm font-semibold text-white tracking-wide">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.description}</p>
                ) : null}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
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
