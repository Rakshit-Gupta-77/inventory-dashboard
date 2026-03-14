import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search, Edit2, Loader2, Package, Box, Filter, MoreVertical, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", sku: "", category: "", uom: "pcs", min_stock_level: 10 });
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const createMutation = useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsOpen(false);
      setFormData({ name: "", sku: "", category: "", uom: "pcs", min_stock_level: 10 });
      toast.success("Product created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create product");
    },
  });

  const filtered = products?.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStockStatus = (stock: number, min: number) => {
    if (stock <= 0) return { label: "Out of Stock", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle };
    if (stock < min) return { label: "Low Stock", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertTriangle };
    return { label: "In Stock", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Inventory</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Catalog</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your product catalog and inventory levels.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 w-full md:w-80 focus-within:border-primary/50 transition-all">
            <Search size={16} className="text-muted-foreground" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search products by name or SKU..." 
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/40" 
            />
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 glow-primary active:scale-95">
                <Plus size={18} />
                <span>New Product</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-card">
              <div className="p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Create Product</DialogTitle>
                  <p className="text-muted-foreground text-sm">Add a new item to your inventory catalog.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="label-upper">Product Name</label>
                  <div className="relative group">
                    <Package className="absolute left-3 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" placeholder="e.g. Industrial Steel Plate" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="label-upper">SKU / Code</label>
                    <input required value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" placeholder="PRD-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="label-upper">Category</label>
                    <div className="relative group">
                      <Box className="absolute left-3 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                      <input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" placeholder="Raw Materials" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="label-upper">Unit of Measure</label>
                    <select value={formData.uom} onChange={(e) => setFormData({...formData, uom: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="L">Liters (L)</option>
                      <option value="roll">Rolls</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label-upper">Min Stock Level</label>
                    <input type="number" required value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value)})} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary flex items-center justify-center gap-2 active:scale-[0.98]">
                    {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    <span>Confirm & Create</span>
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="card-surface overflow-hidden border-border/40 shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 label-upper">Product Info</th>
                <th className="px-6 py-4 label-upper">SKU</th>
                <th className="px-6 py-4 label-upper">Category</th>
                <th className="px-6 py-4 label-upper">UoM</th>
                <th className="px-6 py-4 label-upper">Stock Level</th>
                <th className="px-6 py-4 label-upper text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((p, i) => {
                  const status = getStockStatus(p.stock || 0, p.min_stock_level || 10);
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr 
                      key={p.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="group hover:bg-muted/40 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Package size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground/90">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mt-0.5">ID: {p.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono-data text-xs px-2 py-1 rounded bg-secondary/50 text-primary border border-primary/10">
                          {p.sku}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="erp-badge bg-secondary/30 border-border/50 text-muted-foreground/80">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-muted-foreground font-medium uppercase tracking-wider">{p.uom}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-4 max-w-[120px]">
                            <span className="font-mono-data text-sm font-bold">{p.stock || 0}</span>
                            <span className="text-[10px] text-muted-foreground/50">/ min {p.min_stock_level}</span>
                          </div>
                          <div className={cn("erp-badge w-fit flex items-center gap-1 text-[9px]", status.color)}>
                            <StatusIcon size={10} />
                            {status.label}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                      <Box size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No products found matching your search</p>
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

