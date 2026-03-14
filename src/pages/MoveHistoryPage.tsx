import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, Filter } from "lucide-react";

const moveData = [
  { id: "1", reference: "MVE-001", date: "12/01/2025", product: "Steel Rods", from: "WH-A / Rack A-01", to: "WH-C / Prod Line 1", qty: 30, status: "Done" },
  { id: "2", reference: "MVE-002", date: "12/03/2025", product: "Gaskets", from: "WH-A / Rack A-02", to: "WH-B / Shipping Dock", qty: 50, status: "Done" },
  { id: "3", reference: "MVE-003", date: "12/05/2025", product: "Servo Motors", from: "WH-B / Cold Storage", to: "WH-A / Rack A-01", qty: 15, status: "Ready" },
  { id: "4", reference: "MVE-004", date: "12/08/2025", product: "Brake Pads", from: "WH-A / Receiving Bay", to: "WH-A / Rack A-02", qty: 200, status: "Done" },
  { id: "5", reference: "MVE-005", date: "12/10/2025", product: "Copper Wire", from: "WH-A / Rack A-01", to: "WH-C / Prod Line 1", qty: 100, status: "Waiting" },
  { id: "6", reference: "ADJ-001", date: "12/11/2025", product: "Steel Rods", from: "—", to: "Adjustment", qty: -3, status: "Done" },
];

const statusColors: Record<string, string> = {
  Done: "border-success/30 text-success bg-success/5",
  Ready: "border-primary/30 text-primary bg-primary/5",
  Waiting: "border-warning/30 text-warning bg-warning/5",
};

export default function MoveHistoryPage() {
  const [search, setSearch] = useState("");

  const filtered = moveData.filter(
    (m) => m.reference.toLowerCase().includes(search.toLowerCase()) || m.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="label-upper">Operations</span>
          <ChevronRight size={12} />
          <span className="label-upper text-foreground">Move History</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tighter">Move History</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete log of all stock movements, transfers, and adjustments.</p>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or product..." className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-secondary border border-border hover:bg-secondary/80 transition-colors btn-press">
          <Filter size={12} />
          Filter
        </button>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Reference", "Date", "Product", "From", "To", "Qty", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((m, i) => (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{m.reference}</td>
                <td className="px-5 py-3 text-sm">{m.date}</td>
                <td className="px-5 py-3 text-sm font-medium">{m.product}</td>
                <td className="px-5 py-3 font-mono-data text-xs text-muted-foreground">{m.from}</td>
                <td className="px-5 py-3 font-mono-data text-xs text-muted-foreground">{m.to}</td>
                <td className={`px-5 py-3 font-mono-data text-sm ${m.qty < 0 ? "text-destructive" : ""}`}>{m.qty}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${statusColors[m.status]}`}>{m.status}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
