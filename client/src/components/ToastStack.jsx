// client/src/components/ToastStack.jsx
import React from "react";

const icons = {
  success: (
    <svg
      className="h-4 w-4 shrink-0 text-emerald-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg
      className="h-4 w-4 shrink-0 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="h-4 w-4 shrink-0 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
      />
    </svg>
  ),
};

export default function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="toast flex items-center gap-2.5 rounded-xl border border-slate-200
                     bg-white px-4 py-3 shadow-lg text-sm text-slate-700
                     cursor-pointer hover:bg-slate-50 transition max-w-xs"
        >
          {icons[t.type] ?? icons.info}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
