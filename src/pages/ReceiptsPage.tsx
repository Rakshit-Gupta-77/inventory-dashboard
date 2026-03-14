import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Eye, Search } from "lucide-react";

interface Receipt {
  id: string;
  reference: string;
  date: string;
  contact: string;
  sourceDoc: string;
  effectiveDate: string;
  status: "Draft" | "Waiting" | "Ready" | "Done";
  products: { name: string; qty: number }[];
}

const receipts: Receipt[] = [
  { id: "1", reference: "RCP-001", date: "2025/12/01", contact: "Vendor A", sourceDoc: "PO-4521", effectiveDate: "2025/12/03", status: "Done", products: [{ name: "Steel Rods", qty: 50 }, { name: "Gaskets", qty: 100 }] },
  { id: "2", reference: "RCP-002", date: "2025/12/05", contact: "Vendor B", sourceDoc: "PO-4530", effectiveDate: "2025/12/07", status: "Ready", products: [{ name: "Servo Motors", qty: 25 }] },
  { id: "3", reference: "RCP-003", date: "2025/12/10", contact: "Vendor C", sourceDoc: "PO-4545", effectiveDate: "2025/12/12", status: "Waiting", products: [{ name: "Brake Pads", qty: 200 }] },
  { id: "4", reference: "RCP-004", date: "2025/12/12", contact: "Vendor A", sourceDoc: "PO-4552", effectiveDate: "", status: "Draft", products: [{ name: "Copper Wire", qty: 500 }] },
];

const statusColors: Record<string, string> = {
  Draft: "border-muted-foreground/30 text-muted-foreground bg-muted/5",
  Waiting: "border-warning/30 text-warning bg-warning/5",
  Ready: "border-primary/30 text-primary bg-primary/5",
  Done: "border-success/30 text-success bg-success/5",
};

export default function ReceiptsPage() {
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [search, setSearch] = useState("");

  const filtered = receipts.filter(
    (r) => r.reference.toLowerCase().includes(search.toLowerCase()) || r.contact.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Operations</span>
            <ChevronRight size={12} />
            <button onClick={() => setSelected(null)} className="label-upper hover:text-foreground">Receipts</button>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">{selected.reference}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-medium tracking-tighter">Receipt</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${statusColors[selected.status]}`}>{selected.status}</span>
          </div>
        </header>

        <div className="flex gap-3">
          {["Validate", "Print", "Cancel"].map((a) => (
            <button key={a} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary border border-border hover:bg-secondary/80 transition-colors btn-press">
              {a}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <span className="label-upper self-center">Quantity ▸ Done</span>
          </div>
        </div>

        <div className="card-surface p-6 grid grid-cols-2 gap-6">
          <div><p className="label-upper mb-1">Date</p><p className="text-sm">{selected.date}</p></div>
          <div><p className="label-upper mb-1">Effective Date</p><p className="text-sm">{selected.effectiveDate || "—"}</p></div>
          <div><p className="label-upper mb-1">Contact</p><p className="text-sm">{selected.contact}</p></div>
          <div><p className="label-upper mb-1">Source Document</p><p className="text-sm font-mono-data text-primary">{selected.sourceDoc}</p></div>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="p-5 border-b border-border"><p className="label-upper">Products</p></div>
          <table className="w-full text-left">
            <thead><tr className="border-b border-border bg-secondary/30">
              <th className="px-5 py-3 label-upper">Product</th>
              <th className="px-5 py-3 label-upper">Quantity</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {selected.products.map((p) => (
                <tr key={p.name} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 text-sm">{p.name}</td>
                  <td className="px-5 py-3 font-mono-data text-sm">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Operations</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Receipts</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Receipts</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
          <Plus size={14} />
          New Receipt
        </button>
      </header>

      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 py-2 max-w-sm">
        <Search size={14} className="text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts..." className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50" />
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-border bg-secondary/30">
            {["Reference", "Date", "Contact", "Source Doc", "Status", ""].map((h) => (
              <th key={h} className="px-5 py-3 label-upper">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{r.reference}</td>
                <td className="px-5 py-3 text-sm">{r.date}</td>
                <td className="px-5 py-3 text-sm">{r.contact}</td>
                <td className="px-5 py-3 font-mono-data text-xs">{r.sourceDoc}</td>
                <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${statusColors[r.status]}`}>{r.status}</span></td>
                <td className="px-5 py-3"><button onClick={() => setSelected(r)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Eye size={14} /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
