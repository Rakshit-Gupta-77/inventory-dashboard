import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, MapPin, Search, Filter, MoreVertical, Edit2, Warehouse, Layers, Box } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: api.locations.list,
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.warehouses.list,
  });

  const filtered = locations?.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase()) || 
                         loc.warehouse_name.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || loc.warehouse_name === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  }) || [];

  const getLocationTypeStyle = (type: string) => {
    switch (type) {
      case 'Internal': return "bg-primary/10 text-primary border-primary/20";
      case 'View': return "bg-muted/50 text-muted-foreground border-border";
      default: return "bg-secondary/50 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Configuration</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Storage Locations</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">Define and manage specific storage bins, racks, and areas within your warehouses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary active:scale-95">
            <Plus size={20} />
            <span>New Location</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 w-full md:w-96 focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by name or warehouse..." 
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
        </div>
      </div>

      <div className="card-surface overflow-hidden border-border/40 shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 label-upper">Location Details</th>
                <th className="px-6 py-4 label-upper">Parent Warehouse</th>
                <th className="px-6 py-4 label-upper">Location Type</th>
                <th className="px-6 py-4 label-upper">Occupancy</th>
                <th className="px-6 py-4 label-upper text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => <tr key={i}><td colSpan={5} className="px-6 py-5"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>)
              ) : filtered.length > 0 ? (
                filtered.map((loc, i) => (
                  <motion.tr
                    key={loc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group hover:bg-muted/40 transition-all duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground/90">{loc.name}</div>
                          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mt-0.5">ID: {loc.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Warehouse size={14} className="text-muted-foreground/50" />
                        {loc.warehouse_name}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("erp-badge flex items-center gap-1.5 w-fit", getLocationTypeStyle(loc.type))}>
                        <Layers size={10} />
                        {loc.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 max-w-[100px]">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-50">
                          <span>Usage</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[65%]" />
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                      <MapPin size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">No locations found matching your search</p>
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

