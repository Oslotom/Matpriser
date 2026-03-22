import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("prices.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT,
    standardized_name TEXT,
    store_chain TEXT,
    price REAL,
    unit TEXT,
    purchase_date TEXT,
    user_id TEXT
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT
  );

  CREATE TABLE IF NOT EXISTS receipts_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    store_chain TEXT,
    item_count INTEGER
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Track visitor
  app.post("/api/track-visit", (req, res) => {
    db.prepare("INSERT INTO analytics (event_type) VALUES ('visit')").run();
    res.json({ success: true });
  });

  // API Route: Get stats for dashboard
  app.get("/api/stats", (req, res) => {
    const visitors = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE event_type = 'visit'").get() as any;
    const uploads = db.prepare("SELECT COUNT(*) as count FROM receipts_log").get() as any;
    const products = db.prepare("SELECT COUNT(DISTINCT product_id) as count FROM prices").get() as any;
    const totalItems = db.prepare("SELECT COUNT(*) as count FROM prices").get() as any;
    const chains = db.prepare("SELECT COUNT(DISTINCT store_chain) as count FROM prices").get() as any;
    const stores = db.prepare("SELECT COUNT(DISTINCT store_chain) as count FROM receipts_log").get() as any; // Simplified for now

    // Weekly uploads for graph
    const weeklyData = db.prepare(`
      SELECT 
        strftime('%W', timestamp) as week_num,
        COUNT(*) as count
      FROM receipts_log
      GROUP BY week_num
      ORDER BY week_num DESC
      LIMIT 8
    `).all() as any[];

    // Format weekly data for recharts
    const formattedWeekly = weeklyData.reverse().map(d => ({
      name: `Uke ${d.week_num}`,
      uploads: d.count
    }));

    res.json({
      visitors: visitors.count,
      uploads: uploads.count,
      products: products.count,
      totalItems: totalItems.count,
      chains: chains.count,
      stores: stores.count,
      weekly: formattedWeekly
    });
  });

  // API Route: Search products
  app.get("/api/products/search", (req, res) => {
    const { q } = req.query;
    if (!q || (q as string).length < 2) return res.json([]);

    const search = `%${q}%`;
    const rows = db.prepare(`
      SELECT product_id, standardized_name, store_chain, price, purchase_date
      FROM prices
      WHERE standardized_name LIKE ? OR product_id LIKE ?
      ORDER BY purchase_date DESC
      LIMIT 50
    `).all(search, search) as any[];

    res.json(rows);
  });

  // API Route: Save receipt data
  app.post("/api/receipts", (req, res) => {
    const { items, store, comparison_date } = req.body;
    
    console.log(`Saving receipt from ${store?.store_chain} with ${items?.length} items`);

    if (!items || !store) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Log the upload
    db.prepare("INSERT INTO receipts_log (store_chain, item_count) VALUES (?, ?)").run(store.store_chain, items.length);

    const insert = db.prepare(`
      INSERT INTO prices (product_id, standardized_name, store_chain, price, unit, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((items, storeChain, date) => {
      for (const item of items) {
        console.log(`  - Saving ${item.standardized_name} (${item.product_id}): ${item.price_total} kr`);
        insert.run(
          item.product_id,
          item.standardized_name,
          storeChain,
          item.price_total / (item.quantity || 1), // Price per unit
          item.unit,
          date
        );
      }
    });

    try {
      transaction(items, store.store_chain, store.purchase_date || comparison_date);
      res.json({ success: true });
    } catch (err) {
      console.error("DB Error:", err);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // API Route: Get comparison prices
  app.get("/api/prices", (req, res) => {
    const { product_ids } = req.query;
    if (!product_ids) return res.json({});

    const ids = (product_ids as string).split(",");
    console.log(`Fetching prices for ${ids.length} products: ${ids.join(', ')}`);
    const placeholders = ids.map(() => "?").join(",");
    
    // Get the latest price for each product in each store
    const query = db.prepare(`
      SELECT product_id, store_chain, price
      FROM prices
      WHERE product_id IN (${placeholders})
      AND id IN (
        SELECT MAX(id)
        FROM prices
        GROUP BY product_id, store_chain
      )
    `);

    const rows = query.all(...ids) as any[];
    console.log(`  - Found ${rows.length} price points`);
    
    const results: Record<string, Record<string, number>> = {};
    rows.forEach(row => {
      if (!results[row.product_id]) results[row.product_id] = {};
      results[row.product_id][row.store_chain] = row.price;
    });

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
