import React, { useState } from "react";
import { useProducts } from "./hooks/useProducts.js";
import { useToast } from "./hooks/useToast.js";
import ProductForm from "./components/ProductForm.jsx";
import InventoryTable from "./components/InventoryTable.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import ToastStack from "./components/ToastStack.jsx";

export default function App() {
  const {
    products,
    loading,
    error,
    refresh,
    createProduct,
    updateProduct,
    adjustStock,
    removeProduct,
  } = useProducts();

  const { toasts, toast, dismiss } = useToast();

  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formBusy, setFormBusy] = useState(false);

  // ── Form submit (create OR update) ───────────────
  async function handleFormSubmit(payload) {
    setFormBusy(true);
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        toast(`"${payload.name}" updated.`);
        setEditProduct(null);
      } else {
        await createProduct(payload);
        toast(`"${payload.name}" added.`);
      }
      return true;
    } catch (err) {
      toast(err.message, "error");
      return false;
    } finally {
      setFormBusy(false);
    }
  }

  // ── Delete ────────────────────────────────────────
  async function handleDeleteConfirm() {
    try {
      await removeProduct(deleteTarget.id);
      toast(`"${deleteTarget.name}" deleted.`, "info");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  // ── Stock adjustment with low-stock toast ─────────
  async function handleAdjustStock(id, delta) {
    const updated = await adjustStock(id, delta);
    if (updated.stock_count === 0)
      toast(`${updated.name} is out of stock.`, "error");
    else if (updated.stock_count < 5)
      toast(`${updated.name}: ${updated.stock_count} left.`, "info");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-sky-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"
            />
          </svg>
          <span className="font-semibold text-slate-800 text-lg tracking-tight">
            StockPilot
          </span>
        </div>
        <button
          onClick={refresh}
          className="text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg px-3 py-1.5 transition"
        >
          ↻ Refresh
        </button>
      </header>

      <main className="grid lg:grid-cols-[380px_1fr]">
        {/* Sticky form — left column */}
        <ProductForm
          onSubmit={handleFormSubmit}
          editProduct={editProduct}
          onCancelEdit={() => setEditProduct(null)}
          loading={formBusy}
        />

        {/* Table — right column */}
        <InventoryTable
          products={products}
          loading={loading}
          onEdit={setEditProduct}
          onDelete={setDeleteTarget}
          onAdjustStock={handleAdjustStock}
        />
      </main>

      <ConfirmModal
        product={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
