import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, History, ArrowRight, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, MoreVertical, Calendar, Package, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MoveHistoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ["move-history"],
    queryFn: api.moveHistory.list,
  });

  const filtered = history?.filter((m) => {
    const matchesSearch = m.reference.toLowerCase().includes(search.toLowerCase()) || 
                         m.product_name.toLowerCase().includes(search.toLowerCase()) ||
                         m.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const getMoveTypeStyle = (type: string) => {
    switch (type) {
      case 'Receipt': return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: ArrowDownLeft, label: "Incoming" };
      case 'Delivery': return { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: ArrowUpRight, label: "Outgoing" };
      case 'Transfer': return { color: "text-primary bg-primary/10 border-primary/20", icon: RefreshCw, label: "Internal" };
      case 'Adjustment': return { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: History, label: "Adjustment" };
      default: return { color: "text-muted-foreground bg-muted border-border", icon: ArrowRight, label: type };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <span className="label-upper">Operations</span>
          <ChevronRight size={12} />
          <span className="label-upper text-foreground">Stock Ledger</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Move History</h1>
        <p className="text-muted-foreground text-sm mt-1">Audit trail of all stock movements, transfers, and inventory adjustments.</p>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 w-full md:w-96 focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by reference, product, or SKU..." 
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/40" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-2"
            >
              <option value="all">All Movements</option>
              <option value="Receipt">Receipts</option>
              <option value="Delivery">Deliveries</option>
              <option value="Transfer">Transfers</option>
              <option value="Adjustment">Adjustments</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden border-border/40 shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 label-upper">Timestamp</th>
                <th className="px-6 py-4 label-upper">Reference</th>
                <th className="px-6 py-4 label-upper">Movement Type</th>
                <th className="px-6 py-4 label-upper">Product Info</th>
                <th className="px-6 py-4 label-upper">Location Flow</th>
                <th className="px-6 py-4 label-upper text-right">Qty Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>)
              ) : filtered.length > 0 ? (
                filtered.map((row, i) => {
                  const moveType = getMoveTypeStyle(row.type);
                  const TypeIcon = moveType.icon;
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group hover:bg-muted/40 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground/80">{new Date(row.date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground font-mono-data">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono-data text-xs px-2 py-1 rounded bg-secondary/50 text-primary border border-primary/10">
                          {row.reference}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn("erp-badge w-fit flex items-center gap-1.5 py-1 px-3", moveType.color)}>
                          <TypeIcon size={12} />
                          {moveType.label}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{row.product_name}</div>
                            <div className="text-[10px] font-mono-data text-muted-foreground/60">{row.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground/50 text-[9px] uppercase tracking-tighter mb-0.5">From</span>
                            <span className="px-2 py-0.5 rounded bg-muted/50 border border-border/50">{row.from_location_name || "External"}</span>
                          </div>
                          <ArrowRight size={12} className="text-muted-foreground/30 mt-3" />
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground/50 text-[9px] uppercase tracking-tighter mb-0.5">To</span>
                            <span className="px-2 py-0.5 rounded bg-muted/50 border border-border/50">{row.to_location_name || "Customer"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={cn("font-mono-data text-sm font-bold", 
                          row.type === 'Receipt' ? "text-emerald-500" : 
                          row.type === 'Delivery' ? "text-red-500" : 
                          "text-foreground"
                        )}>
                          {row.type === 'Receipt' ? '+' : row.type === 'Delivery' ? '-' : ''}{row.quantity}
                          <span className="text-[9px] ml-1 uppercase opacity-50 font-normal">Units</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                      <History size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No movement records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

