import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await api.getAll());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProduct = useCallback(async (payload) => {
    const created = await api.create(payload);
    setProducts((prev) => [created, ...prev]); // prepend
    return created;
  }, []);

  const updateProduct = useCallback(async (id, data) => {
    const updated = await api.update(id, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const adjustStock = useCallback(async (id, delta) => {
    const updated = await api.adjustStock(id, delta);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await api.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products,
    loading,
    error,
    refresh,
    createProduct,
    updateProduct,
    adjustStock,
    removeProduct,
  };
}
