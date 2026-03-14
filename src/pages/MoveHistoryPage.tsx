import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function MoveHistoryPage() {
  const [search, setSearch] = useState("");

  const { data: history, isLoading } = useQuery({
    queryKey: ["move-history"],
    queryFn: api.moveHistory.list,
  });

  const filtered = history?.filter(
    (m) => m.reference.toLowerCase().includes(search.toLowerCase()) || 
           m.product_name.toLowerCase().includes(search.toLowerCase()) ||
           m.sku?.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Date", "Reference", "Product", "From", "To", "Quantity"].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>)
            ) : filtered.length > 0 ? (
              filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(row.date).toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{row.reference}</td>
                  <td className="px-5 py-3 text-sm font-medium">{row.product_name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{row.from_location_name || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{row.to_location_name || "—"}</td>
                  <td className={`px-5 py-3 font-mono-data text-sm ${row.type === 'Receipt' ? "text-success" : row.type === 'Delivery' ? "text-destructive" : "text-foreground"}`}>
                    {row.type === 'Receipt' ? '+' : row.type === 'Delivery' ? '-' : ''}{row.quantity}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No move history found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
