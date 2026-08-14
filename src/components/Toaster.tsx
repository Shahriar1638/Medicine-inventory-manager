"use client";

import { useStore } from "@/lib/store";
import { formatBDT } from "@/lib/format";
import { CheckIcon, XIcon } from "@/components/icons";

export default function Toaster() {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <span className="toast-icon">
            <CheckIcon width={16} height={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {toast.title ?? "Added to cart"}
            </div>
            <div className="toast-sub">
              <span className="truncate">{toast.name}</span>
              {toast.price !== undefined && (
                <span className="font-mono-data toast-price">{formatBDT(toast.price)}</span>
              )}
            </div>
          </div>
          <button
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <XIcon width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
