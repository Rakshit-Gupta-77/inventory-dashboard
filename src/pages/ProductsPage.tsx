import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search, Edit2 } from "lucide-react";

const products = [
  { id: "1", name: "Steel Rods", sku: "APX-101", category: "Raw Materials", uom: "kg", stock: 200 },
  { id: "2", name: "Hydraulic Fluid", sku: "APX-102", category: "Fluids", uom: "L", stock: 12 },
  { id: "3", name: "Servo Motors", sku: "APX-103", category: "Electronics", uom: "pcs", stock: 85 },
  { id: "4", name: "Brake Pads", sku: "APX-104", category: "Parts", uom: "pcs", stock: 3 },
  { id: "5", name: "Copper Wire (100m)", sku: "APX-105", category: "Raw Materials", uom: "roll", stock: 340 },
  { id: "6", name: "Filter Cartridge", sku: "APX-106", category: "Parts", uom: "pcs", stock: 8 },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Main</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Products</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Products</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
          <Plus size={14} />
          New Product
        </button>
      </header>

      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 py-2 max-w-sm">
        <Search size={14} className="text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50" />
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-border bg-secondary/30">
            {["Product", "SKU", "Category", "UoM", "Stock", ""].map((h) => (
              <th key={h} className="px-5 py-3 label-upper">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{p.sku}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3 text-xs">{p.uom}</td>
                <td className="px-5 py-3 font-mono-data text-sm"><span className={p.stock < 10 ? "text-warning" : ""}>{p.stock}</span></td>
                <td className="px-5 py-3"><button className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
