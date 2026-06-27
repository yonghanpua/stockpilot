const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json.data ?? json;
}

export const api = {
  getAll: () => request("/products"),
  create: (payload) =>
    request("/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, data) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adjustStock: (id, delta) =>
    request(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ delta }),
    }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
};
