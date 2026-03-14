import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, Edit2 } from "lucide-react";

interface StockItem {
  product: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
}

const stockData: StockItem[] = [
  { product: "Steel Rods", sku: "APX-101", onHand: 200, reserved: 50, available: 150 },
  { product: "Hydraulic Fluid", sku: "APX-102", onHand: 12, reserved: 0, available: 12 },
  { product: "Servo Motors", sku: "APX-103", onHand: 85, reserved: 20, available: 65 },
  { product: "Brake Pads", sku: "APX-104", onHand: 3, reserved: 0, available: 3 },
  { product: "Copper Wire (100m)", sku: "APX-105", onHand: 340, reserved: 100, available: 240 },
  { product: "Filter Cartridge", sku: "APX-106", onHand: 8, reserved: 2, available: 6 },
  { product: "Steel Gaskets", sku: "APX-107", onHand: 128, reserved: 30, available: 98 },
];

export default function StockPage() {
  const [search, setSearch] = useState("");

  const filtered = stockData.filter(
    (s) => s.product.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="label-upper">Inventory</span>
          <ChevronRight size={12} />
          <span className="label-upper text-foreground">Stock</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tighter">Stock</h1>
        <p className="text-sm text-muted-foreground mt-1">View and update stock levels across all products.</p>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or SKU..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Product", "SKU", "On Hand", "Reserved", "Available", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((row, i) => (
              <motion.tr
                key={row.sku}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-secondary/30 transition-colors"
              >
                <td className="px-5 py-3 text-sm font-medium">{row.product}</td>
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{row.sku}</td>
                <td className="px-5 py-3 font-mono-data text-sm">{row.onHand}</td>
                <td className="px-5 py-3 font-mono-data text-sm text-muted-foreground">{row.reserved}</td>
                <td className="px-5 py-3 font-mono-data text-sm">
                  <span className={row.available < 10 ? "text-warning" : ""}>{row.available}</span>
                </td>
                <td className="px-5 py-3">
                  <button className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
