import { useEffect, useState } from "react";
import { AlertIcon } from "./Icons";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertIcon />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={onCancel}
            className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="h-11 flex-1 rounded-xl bg-rose-500 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(244,63,94,0.7)] transition hover:bg-rose-600 disabled:opacity-60"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
