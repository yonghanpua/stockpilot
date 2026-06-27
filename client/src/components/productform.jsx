import React, { useState, useEffect } from "react";

const EMPTY = {
  sku: "",
  name: "",
  description: "",
  price: "",
  stock_count: "",
};
const Field = ({ label, id, error, children }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-xs font-medium text-slate-600 mb-1"
    >
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default function ProductForm({
  onSubmit,
  editProduct,
  onCancelEdit,
  loading,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editProduct) {
      setForm({
        sku: editProduct.sku,
        name: editProduct.name,
        description: editProduct.description ?? "",
        price: String(editProduct.price),
        stock_count: String(editProduct.stock_count),
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editProduct]);

  const isEditing = Boolean(editProduct);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.sku.trim()) e.sku = "SKU is required.";
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.price || isNaN(+form.price) || +form.price < 0)
      e.price = "Enter a valid price ≥ 0.";
    if (!form.stock_count || isNaN(+form.stock_count) || +form.stock_count < 0)
      e.stock_count = "Enter a valid quantity ≥ 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const ok = await onSubmit({
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock_count: parseInt(form.stock_count, 10),
    });
    if (ok && !isEditing) {
      setForm(EMPTY);
      setErrors({});
    }
  }

  return (
    <aside
      className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto
                      border-r border-slate-200 bg-white p-6 flex flex-col gap-5"
    >
      {/* Panel heading */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          {isEditing ? "Edit product" : "Add product"}
        </h2>
        {isEditing && (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600 ring-1 ring-sky-200">
            Editing
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 flex-1"
      >
        <Field label="SKU" id="sku" error={errors.sku}>
          <input
            id="sku"
            className="field"
            placeholder="e.g. WDG-001"
            value={form.sku}
            onChange={set("sku")}
            disabled={isEditing}
          />
        </Field>

        <Field label="Name" id="name" error={errors.name}>
          <input
            id="name"
            className="field"
            placeholder="Product name"
            value={form.name}
            onChange={set("name")}
          />
        </Field>

        <Field label="Description" id="description">
          <input
            id="description"
            className="field"
            placeholder="Optional"
            value={form.description}
            onChange={set("description")}
          />
        </Field>

        <Field label="Price ($)" id="price" error={errors.price}>
          <input
            id="price"
            className="field"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={set("price")}
          />
        </Field>

        <Field label="Stock count" id="stock_count" error={errors.stock_count}>
          <input
            id="stock_count"
            className="field"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.stock_count}
            onChange={set("stock_count")}
          />
        </Field>

        {/* Buttons pinned to bottom */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2
                         text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold
                       text-white hover:bg-sky-700 transition disabled:opacity-50"
          >
            {loading ? "Saving…" : isEditing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </aside>
  );
}
