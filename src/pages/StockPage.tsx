import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, Edit2, ArrowRightLeft, Plus, Loader2, Warehouse, Box, Info, AlertCircle, History, Filter, MoreVertical, Package, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [transferData, setTransferData] = useState({ reference: "", from_location_id: "", to_location_id: "", product_id: "", quantity: 1 });
  const [adjustmentData, setAdjustmentData] = useState({ reference: "", product_id: "", location_id: "", counted_quantity: 0, reason: "" });
  const queryClient = useQueryClient();

  const { data: stock, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: api.stock.list,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: api.locations.list,
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.warehouses.list,
  });

  const categories = products ? Array.from(new Set(products.map(p => p.category))) : [];

  const stats = useMemo(() => {
    if (!stock) return { totalItems: 0, lowStock: 0, warehouses: 0 };
    const lowStock = stock.filter(s => s.quantity < 10).length;
    const uniqueWarehouses = new Set(stock.map(s => s.warehouse_name)).size;
    const totalQty = stock.reduce((acc, curr) => acc + curr.quantity, 0);
    return { totalQty, lowStock, warehouses: uniqueWarehouses };
  }, [stock]);

  const transferMutation = useMutation({
    mutationFn: api.transfers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["move-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setIsTransferOpen(false);
      setTransferData({ reference: "", from_location_id: "", to_location_id: "", product_id: "", quantity: 1 });
      toast.success("Transfer completed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Transfer failed");
    },
  });

  const adjustmentMutation = useMutation({
    mutationFn: api.adjustments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["move-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setIsAdjustmentOpen(false);
      setAdjustmentData({ reference: "", product_id: "", location_id: "", counted_quantity: 0, reason: "" });
      toast.success("Stock adjustment completed");
    },
    onError: (err: any) => {
      toast.error(err.message || "Adjustment failed");
    },
  });

  const filtered = stock?.filter((s) => {
    const matchesSearch = s.product_name.toLowerCase().includes(search.toLowerCase()) || 
                         s.sku.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || s.warehouse_name === warehouseFilter;
    const product = products?.find(p => p.id === s.product_id);
    const matchesCategory = categoryFilter === "all" || product?.category === categoryFilter;
    
    return matchesSearch && matchesWarehouse && matchesCategory;
  }) || [];

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferMutation.mutate(transferData);
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustmentMutation.mutate(adjustmentData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Inventory</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Stock Levels</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Inventory Stock</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time stock monitoring across all warehouses and locations.</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-secondary/50 border border-border/50 hover:bg-secondary text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press">
                <ArrowRightLeft size={18} className="text-primary" />
                <span>Internal Transfer</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-card">
              <div className="p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Stock Transfer</DialogTitle>
                  <p className="text-muted-foreground text-sm">Move items between different storage locations.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleTransferSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="label-upper">Reference Number</label>
                  <input required value={transferData.reference} onChange={(e) => setTransferData({...transferData, reference: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" placeholder="e.g. TRF-2024-001" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Select Product</label>
                  <select required value={transferData.product_id} onChange={(e) => setTransferData({...transferData, product_id: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="">Choose product to move...</option>
                    {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="label-upper text-red-400/80">From Location</label>
                    <select required value={transferData.from_location_id} onChange={(e) => setTransferData({...transferData, from_location_id: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="">Source...</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label-upper text-emerald-400/80">To Location</label>
                    <select required value={transferData.to_location_id} onChange={(e) => setTransferData({...transferData, to_location_id: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="">Destination...</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Transfer Quantity</label>
                  <input type="number" required min="1" value={transferData.quantity} onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value)})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" />
                </div>
                <DialogFooter className="pt-4">
                  <button type="submit" disabled={transferMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary flex items-center justify-center gap-2 active:scale-[0.98]">
                    {transferMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRightLeft size={18} />}
                    <span>Confirm Transfer</span>
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 glow-primary active:scale-95">
                <Plus size={18} />
                <span>Inventory Adjustment</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-card">
              <div className="p-6 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Stock Adjustment</DialogTitle>
                  <p className="text-muted-foreground text-sm">Correct stock levels based on physical counts.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="label-upper">Reference / Reason</label>
                  <input required value={adjustmentData.reference} onChange={(e) => setAdjustmentData({...adjustmentData, reference: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" placeholder="e.g. ADJ-2024-DAMAGE" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="label-upper">Product</label>
                    <select required value={adjustmentData.product_id} onChange={(e) => setAdjustmentData({...adjustmentData, product_id: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="">Select...</option>
                      {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label-upper">Location</label>
                    <select required value={adjustmentData.location_id} onChange={(e) => setAdjustmentData({...adjustmentData, location_id: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="">Select...</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper">New Physical Count</label>
                  <input type="number" required min="0" value={adjustmentData.counted_quantity} onChange={(e) => setAdjustmentData({...adjustmentData, counted_quantity: parseInt(e.target.value)})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" />
                  <p className="text-[10px] text-muted-foreground/60 italic">This will overwrite the current quantity for this location.</p>
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Notes</label>
                  <textarea value={adjustmentData.reason} onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all h-20 resize-none" placeholder="Explain why this adjustment is needed..." />
                </div>
                <DialogFooter className="pt-4">
                  <button type="submit" disabled={adjustmentMutation.isPending} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                    {adjustmentMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    <span>Update Inventory</span>
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Stock On Hand", value: stats.totalQty, icon: Box, color: "text-primary", bg: "bg-primary/10" },
          { label: "Low Stock Alerts", value: stats.lowStock, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Warehouses Active", value: stats.warehouses, icon: Warehouse, color: "text-emerald-500", bg: "bg-emerald-500/10" }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="card-surface p-6 flex items-center justify-between border-border/40"
          >
            <div>
              <p className="label-upper mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight">{isLoading ? "..." : stat.value}</h3>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 w-full md:w-96 focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, or location..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/40"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
            <Warehouse size={14} className="text-muted-foreground" />
            <select 
              value={warehouseFilter} 
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-2"
            >
              <option value="all">All Warehouses</option>
              {warehouses?.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-2"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden border-border/40 shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 label-upper">Product & SKU</th>
                <th className="px-6 py-4 label-upper">Warehouse / Location</th>
                <th className="px-6 py-4 label-upper">Status</th>
                <th className="px-6 py-4 label-upper">Quantity</th>
                <th className="px-6 py-4 label-upper text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={i}><td colSpan={5} className="px-6 py-5"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group hover:bg-muted/40 transition-all duration-200"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground/90">{row.product_name}</div>
                          <div className="text-[10px] font-mono-data text-primary/70 font-bold uppercase tracking-wider">{row.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Warehouse size={14} className="text-muted-foreground/60" />
                          {row.warehouse_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                          <MapPin size={12} />
                          {row.location_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {row.quantity <= 0 ? (
                        <span className="erp-badge bg-red-500/10 text-red-500 border-red-500/20">Out of Stock</span>
                      ) : row.quantity < 10 ? (
                        <span className="erp-badge bg-amber-500/10 text-amber-500 border-amber-500/20">Low Stock</span>
                      ) : (
                        <span className="erp-badge bg-emerald-500/10 text-emerald-500 border-emerald-500/20">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-mono-data text-base font-bold", row.quantity < 10 ? "text-amber-500" : "text-foreground")}>
                          {row.quantity}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Units</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="View History">
                          <History size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                      <Box size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No stock records found</p>
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

