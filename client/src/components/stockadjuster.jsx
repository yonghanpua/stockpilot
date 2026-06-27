import React, { useState } from "react";

const LOW = 5; // badge threshold

export default function StockAdjuster({ product, onAdjust }) {
  const [busy, setBusy] = useState(false);
  const { stock_count: count } = product;

  const isLow = count > 0 && count < LOW;
  const isZero = count === 0;

  async function adjust(delta) {
    if (busy || count + delta < 0) return;
    setBusy(true);
    try {
      await onAdjust(product.id, delta);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Status badge */}
      <span
        className={isZero ? "badge-red" : isLow ? "badge-amber" : "badge-green"}
      >
        {isZero ? "Out of stock" : isLow ? "Low stock" : "In stock"}
      </span>

      {/* ± stepper */}
      <div className="stepper">
        <button
          onClick={() => adjust(-1)}
          disabled={busy || count === 0}
          aria-label="Decrease stock"
        >
          −
        </button>

        <span>{count}</span>

        <button
          onClick={() => adjust(+1)}
          disabled={busy}
          aria-label="Increase stock"
        >
          +
        </button>
      </div>
    </div>
  );
}
