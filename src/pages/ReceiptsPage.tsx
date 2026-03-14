import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search, FileInput, Loader2, Trash2, Truck, Calendar, User, MoreVertical, CheckCircle2, Clock, AlertCircle, Package, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    if (newItems.length > 1) {
      newItems.splice(index, 1);
      setFormData({ ...formData, items: newItems });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Done": return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 };
      case "Ready": return { color: "bg-primary/10 text-primary border-primary/20", icon: Clock };
      case "Draft": return { color: "bg-muted/50 text-muted-foreground border-border", icon: FileInput };
      case "Canceled": return { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle };
      default: return { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Operations</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Inbound Shipments</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Receipts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage incoming goods and vendor deliveries.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary active:scale-95">
              <Plus size={20} />
              <span>New Receipt</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl bg-card">
            <div className="p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border/50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">Create Goods Receipt</DialogTitle>
                <p className="text-muted-foreground text-sm">Register new incoming shipment from a vendor.</p>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-upper">Reference Code</label>
                  <div className="relative group">
                    <FileInput className="absolute left-3 top-3 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input required value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-all" placeholder="e.g. RCP-2024-001" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Vendor Name</label>
                  <div className="relative group">
                    <Truck className="absolute left-3 top-3 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input required value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-all" placeholder="e.g. Global Supplies Inc." />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                    <Package size={16} /> Order Items
                  </h3>
                  <button type="button" onClick={addItem} className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} /> Add Line
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 gap-4 items-end bg-secondary/20 p-4 rounded-xl border border-border/50 relative group/item"
                    >
                      <div className="col-span-5 space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product</label>
                        <select required value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)} className="w-full bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-all cursor-pointer">
                          <option value="">Choose product...</option>
                          {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                        <input type="number" required min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} className="w-full bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-all" />
                      </div>
                      <div className="col-span-4 space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Destination</label>
                        <select required value={item.destination_location_id} onChange={(e) => updateItem(index, "destination_location_id", e.target.value)} className="w-full bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-all cursor-pointer">
                          <option value="">Choose location...</option>
                          {locations?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                        </select>
                      </div>
                      <div className="col-span-1 pb-1 flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)} 
                          disabled={formData.items.length === 1}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/50">
                <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary flex items-center justify-center gap-2 active:scale-[0.98]">
                  {createMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <FileInput size={20} />}
                  <span>Confirm & Create Receipt</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 w-full md:w-96 focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts by reference or vendor..." className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/40" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
            <Clock size={14} className="text-muted-foreground" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-2"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden border-border/40 shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 label-upper">Reference</th>
                <th className="px-6 py-4 label-upper">Vendor / Source</th>
                <th className="px-6 py-4 label-upper">Scheduled Date</th>
                <th className="px-6 py-4 label-upper">Status</th>
                <th className="px-6 py-4 label-upper text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4].map(i => <tr key={i}><td colSpan={5} className="px-6 py-5"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>)
              ) : filtered.length > 0 ? (
                filtered.map((r, i) => {
                  const status = getStatusStyle(r.status);
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr 
                      key={r.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.04 }} 
                      className="group hover:bg-muted/40 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileInput size={20} />
                          </div>
                          <span className="font-mono-data text-sm font-bold text-primary tracking-tight">{r.reference}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                            {r.vendor.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground/90">{r.vendor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar size={14} className="text-muted-foreground/50" />
                          {new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn("erp-badge w-fit flex items-center gap-1.5 py-1 px-3", status.color)}>
                          <StatusIcon size={12} />
                          {r.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status !== "Done" && r.status !== "Canceled" && (
                            <button 
                              onClick={() => validateMutation.mutate(r.id)}
                              disabled={validateMutation.isPending}
                              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                            >
                              {validateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              Validate
                            </button>
                          )}
                          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                      <Truck size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No receipts found matching your filters</p>
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

