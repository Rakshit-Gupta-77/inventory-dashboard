import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search, FileInput, Loader2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    vendor: "",
    items: [{ product_id: "", quantity: 1, destination_location_id: "" }]
  });
  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: api.receipts.list,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: api.locations.list,
  });

  const createMutation = useMutation({
    mutationFn: api.receipts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      setIsOpen(false);
      setFormData({
        reference: "",
        vendor: "",
        items: [{ product_id: "", quantity: 1, destination_location_id: "" }]
      });
      toast.success("Receipt created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create receipt");
    },
  });

  const validateMutation = useMutation({
    mutationFn: api.receipts.validate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      toast.success("Receipt validated and stock updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Validation failed");
    },
  });

  const filtered = receipts?.filter((r) => {
    const matchesSearch = r.reference.toLowerCase().includes(search.toLowerCase()) || 
                         r.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.some(item => !item.product_id || !item.destination_location_id)) {
      toast.error("Please fill in all item details");
      return;
    }
    createMutation.mutate(formData);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: 1, destination_location_id: "" }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

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
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
              <Plus size={14} />
              New Receipt
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium tracking-tight">Create New Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Reference</label>
                  <input required value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="RCP-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="label-upper text-[10px]">Vendor</label>
                  <input required value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="Vendor Name" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <label className="label-upper text-[10px]">Products</label>
                  <button type="button" onClick={addItem} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end bg-secondary/20 p-3 rounded-md border border-border/50">
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase">Product</label>
                      <select required value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)} className="w-full bg-secondary/50 border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                        <option value="">Select Product</option>
                        {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase">Qty</label>
                      <input type="number" required min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} className="w-full bg-secondary/50 border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="col-span-5 space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase">Destination Location</label>
                      <select required value={item.destination_location_id} onChange={(e) => updateItem(index, "destination_location_id", e.target.value)} className="w-full bg-secondary/50 border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                        <option value="">Select Location</option>
                        {locations?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 pb-1.5">
                      <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-6">
                <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md text-sm font-medium transition-all glow-primary btn-press flex items-center justify-center gap-2">
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />}
                  Create Receipt
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-secondary/30 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2 flex-1 w-full max-w-sm">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts..." className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50" />
        </div>

        <div className="flex flex-col gap-1 w-full md:w-40">
          <label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-border bg-secondary/30">
            {["Reference", "Vendor", "Date", "Status", ""].map((h) => (
              <th key={h} className="px-5 py-3 label-upper">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>)
            ) : filtered.length > 0 ? (
              filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{r.reference}</td>
                  <td className="px-5 py-3 text-sm">{r.vendor}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                      r.status === "Done" ? "border-success/30 text-success bg-success/5" :
                      r.status === "Ready" ? "border-primary/30 text-primary bg-primary/5" :
                      "border-warning/30 text-warning bg-warning/5"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.status !== "Done" && (
                      <button 
                        onClick={() => validateMutation.mutate(r.id)}
                        disabled={validateMutation.isPending}
                        className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1 rounded border border-border transition-colors"
                      >
                        {validateMutation.isPending ? "Validating..." : "Validate"}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No receipts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
