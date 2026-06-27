import React, { useState, useMemo } from "react";
import StockAdjuster from "./StockAdjuster.jsx";

export default function InventoryTable({
  products,
  loading,
  onEdit,
  onDelete,
  onAdjustStock,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "updated_at", dir: "desc" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }, [products, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sort.key],
        vb = b[sort.key];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort]);

  function toggleSort(key) {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
  }

  const totalValue = products.reduce((s, p) => s + p.price * p.stock_count, 0);

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1">{sort.dir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <section className="flex flex-col">
      {/* ── Header: search + stat ── */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200">
        <input
          type="search"
          placeholder="Search SKU, name, description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field max-w-xs"
        />
        <p className="text-sm text-slate-500 shrink-0">
          Total value:{" "}
          <span className="font-semibold text-slate-700">
            ${totalValue.toFixed(2)}
          </span>
        </p>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <p className="p-8 text-center text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="p-8 text-center text-slate-400">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  { label: "SKU", key: "sku" },
                  { label: "Name", key: "name" },
                  { label: "Price", key: "price" },
                  { label: "Stock", key: "stock_count" },
                  { label: "Updated", key: "updated_at" },
                  { label: "Actions", key: null },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    className="th"
                    onClick={() => key && toggleSort(key)}
                    style={{ cursor: key ? "pointer" : "default" }}
                  >
                    {label}
                    {key && <SortIcon col={key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAdjustStock={onAdjustStock}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const ProductRow = React.memo(function ProductRow({
  product,
  onEdit,
  onDelete,
  onAdjustStock,
}) {
  return (
    <tr className="row-enter hover:bg-slate-50 transition-colors">
      <td className="td font-mono text-xs">{product.sku}</td>
      <td className="td">
        <p className="font-medium text-slate-800">{product.name}</p>
        {product.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
            {product.description}
          </p>
        )}
      </td>
      <td className="td">${Number(product.price).toFixed(2)}</td>
      <td className="td">
        <StockAdjuster product={product} onAdjust={onAdjustStock} />
      </td>
      <td className="td text-xs text-slate-400">
        {new Date(product.updated_at).toLocaleDateString()}
      </td>
      <td className="td">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 border border-sky-200 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
});
