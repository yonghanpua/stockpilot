import initSqlJS from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "inventory.db");

const SQL = await initSqlJS();

const db = fs.existsSync(DB_PATH)
  ? new SQL.Database(fs.readFileSync(DB_PATH))
  : new SQL.Database();

function persist() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        sku         TEXT NOT NULL UNIQUE,
        name        TEXT NOT NULL,
        description TEXT DEFAULT '',
        price       REAL NOT NULL CHECK (price >= 0),
        stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )   
`);
persist();

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  return queryAll(sql, params)[0];
}

function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

const { n } = queryOne("SELECT COUNT(*) AS n FROM products");

if (n === 0) {
  [
    ["WDG-001", "Bluetooth Speaker", "Portable 20W", 49.99, 12],
    ["WDG-002", "USB-C Hub 7-in-1", "HDMI & SD", 34.99, 3],
    ["WDG-003", "Mechanical Keyboard", "TKL Browns", 89.99, 7],
  ].forEach(([sku, name, desc, price, stock]) =>
    db.run(
      "INSERT INTO products (sku, name, description, price, stock_count) VALUES (?, ?, ?, ?, ?)",
      [sku, name, desc, price, stock],
    ),
  );
  persist();
}

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", (_req, res) => {
  const rows = queryAll("SELECT * FROM products ORDER BY created_at DESC");
  res.json({ success: true, data: rows });
});

app.post("/api/products", (req, res) => {
  const { sku, name, description = "", price, stock_count = 0 } = req.body;

  if (!sku || !name || price == null)
    return res
      .status(400)
      .json({ success: false, error: "sku, name, and price are required." });

  if (
    queryOne("SELECT id FROM products WHERE sku=?", [sku.trim().toUpperCase()])
  )
    return res
      .status(409)
      .json({ success: false, error: `SKU '${sku}' already exists.` });

  db.run(
    "INSERT INTO products (sku,name,description,price,stock_count) VALUES (?,?,?,?,?)",
    [
      sku.trim().toUpperCase(),
      name.trim(),
      description.trim(),
      parseFloat(price),
      parseInt(stock_count),
    ],
  );
  persist();

  const created = queryOne("SELECT * FROM products WHERE sku=?", [
    sku.trim().toUpperCase(),
  ]);
  res.status(201).json({ success: true, data: created });
});

app.put("/api/products/:id", (req, res) => {
  const existing = queryOne("SELECT * FROM products WHERE id=?", [
    req.params.id,
  ]);
  if (!existing)
    return res.status(404).json({ success: false, error: "Product not found" });

  const {
    sku = existing.sku,
    name = existing.name,
    description = existing.description,
    price = existing.price,
    stock_count = existing.stock_count,
  } = req.body;

  db.run(
    `UPDATE products SET sku=?,name=?,description=?,
      price=?,stock_count=?,updated_at=datetime('now') WHERE id=?`,
    [
      sku.trim().toUpperCase(),
      name.trim(),
      description.trim(),
      parseFloat(price),
      parseInt(stock_count),
      req.params.id,
    ],
  );
  persist();

  res.json({
    success: true,
    data: queryOne("SELECT * FROM products WHERE id=?", [req.params.id]),
  });
});

app.patch("/api/products/:id/stock", (req, res) => {
  const p = queryOne("SELECT * FROM products WHERE id=?", [req.params.id]);
  if (!p) return res.status(404).json({ success: false, error: "Not found" });

  let newStock;
  if (req.body.delta !== undefined)
    newStock = p.stock_count + parseInt(req.body.delta);
  else if (req.body.stock_count !== undefined)
    newStock = parseInt(req.body.stock_count);
  else
    return res
      .status(400)
      .json({ success: false, error: "Provide delta or stock_count" });

  if (newStock < 0)
    return res
      .status(400)
      .json({ success: false, error: "Stock cannot go below 0" });

  db.run(
    `UPDATE products SET stock_count=?,updated_at=datetime('now') WHERE id=?`,
    [newStock, req.params.id],
  );
  persist();

  res.json({
    success: true,
    data: queryOne("SELECT * FROM products WHERE id=?", [req.params.id]),
  });
});

app.delete("/api/products/:id", (req, res) => {
  const p = queryOne("SELECT * FROM products WHERE id=?", [req.params.id]);
  if (!p) return res.status(404).json({ success: false, error: "Not found" });

  db.run("DELETE FROM products WHERE id=?", [req.params.id]);
  persist();
  res.json({ success: true, message: `'${p.name}' deleted.` });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
