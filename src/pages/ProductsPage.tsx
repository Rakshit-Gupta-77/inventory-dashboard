import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search, Edit2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
              <Plus size={14} />
              New Product
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium tracking-tight">Create New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="label-upper text-[10px]">Product Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Steel Rods" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">SKU / Code</label>
                  <input required value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="SKU-123" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Category</label>
                  <input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="Raw Materials" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Unit of Measure</label>
                  <select value={formData.uom} onChange={(e) => setFormData({...formData, uom: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="L">Liters (L)</option>
                    <option value="roll">Rolls</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Min Stock Level</label>
                  <input type="number" required value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value)})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md text-sm font-medium transition-all glow-primary btn-press flex items-center justify-center gap-2">
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Product
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium">{p.name}</td>
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{p.sku}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 text-xs">{p.uom}</td>
                  <td className="px-5 py-3 font-mono-data text-sm"><span className={(p.stock || 0) < (p.min_stock_level || 10) ? "text-warning" : ""}>{p.stock || 0}</span></td>
                  <td className="px-5 py-3"><button className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button></td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
