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
