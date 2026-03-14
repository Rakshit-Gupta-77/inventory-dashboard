import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, Edit2, ArrowRightLeft, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Inventory</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Stock</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">View and update stock levels across all products.</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-secondary border border-border hover:bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors btn-press">
                <ArrowRightLeft size={14} />
                Internal Transfer
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-medium tracking-tight">Internal Stock Transfer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Reference</label>
                  <input required value={transferData.reference} onChange={(e) => setTransferData({...transferData, reference: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="TRF-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Product</label>
                  <select required value={transferData.product_id} onChange={(e) => setTransferData({...transferData, product_id: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select Product</option>
                    {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-upper text-[10px]">From Location</label>
                    <select required value={transferData.from_location_id} onChange={(e) => setTransferData({...transferData, from_location_id: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select Source</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label-upper text-[10px]">To Location</label>
                    <select required value={transferData.to_location_id} onChange={(e) => setTransferData({...transferData, to_location_id: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select Destination</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Quantity</label>
                  <input type="number" required min="1" value={transferData.quantity} onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value)})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <DialogFooter className="mt-6">
                  <button type="submit" disabled={transferMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md text-sm font-medium transition-all glow-primary btn-press flex items-center justify-center gap-2">
                    {transferMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                    Complete Transfer
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
                <Plus size={14} />
                Stock Adjustment
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-medium tracking-tight">Stock Adjustment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdjustmentSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Reference</label>
                  <input required value={adjustmentData.reference} onChange={(e) => setAdjustmentData({...adjustmentData, reference: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="ADJ-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Product</label>
                  <select required value={adjustmentData.product_id} onChange={(e) => setAdjustmentData({...adjustmentData, product_id: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select Product</option>
                    {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Location</label>
                  <select required value={adjustmentData.location_id} onChange={(e) => setAdjustmentData({...adjustmentData, location_id: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select Location</option>
                    {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Counted Quantity</label>
                  <input type="number" required min="0" value={adjustmentData.counted_quantity} onChange={(e) => setAdjustmentData({...adjustmentData, counted_quantity: parseInt(e.target.value)})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Reason</label>
                  <input value={adjustmentData.reason} onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Damaged items" />
                </div>
                <DialogFooter className="mt-6">
                  <button type="submit" disabled={adjustmentMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md text-sm font-medium transition-all glow-primary btn-press flex items-center justify-center gap-2">
                    {adjustmentMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Apply Adjustment
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-secondary/30 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2 flex-1 w-full max-w-sm">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or SKU..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-40">
            <label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Warehouse</label>
            <select 
              value={warehouseFilter} 
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Warehouses</option>
              {warehouses?.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-40">
            <label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Category</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Product", "SKU", "Location", "Warehouse", "On Hand", ""].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-5 py-3 text-sm font-medium">{row.product_name}</td>
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{row.sku}</td>
                  <td className="px-5 py-3 text-sm">{row.location_name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{row.warehouse_name}</td>
                  <td className="px-5 py-3 font-mono-data text-sm">
                    <span className={row.quantity < 10 ? "text-warning" : ""}>{row.quantity}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No stock data found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
