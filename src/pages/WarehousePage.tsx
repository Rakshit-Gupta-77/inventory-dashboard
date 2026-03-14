import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Warehouse as WarehouseIcon, MapPin, Building2, MoreVertical, Edit2, Box, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function WarehousePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.warehouses.list,
  });

  const selected = warehouses?.find(w => w.id === selectedId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Configuration</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Infrastructure</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">Warehouses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your storage facilities and physical infrastructure.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 glow-primary active:scale-95">
            <Plus size={20} />
            <span>Register Warehouse</span>
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : selected ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="card-surface overflow-hidden border-border/40 shadow-2xl shadow-black/10"
        >
          <div className="p-8 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border/50">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setSelectedId(null)} 
                className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50"
              >
                <ArrowLeft size={14} /> Back to Infrastructure
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-all"><Edit2 size={18} /></button>
                <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-all"><Settings size={18} /></button>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <WarehouseIcon size={40} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight">{selected.name}</h2>
                  <span className="font-mono-data text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-bold tracking-widest">
                    {selected.short_code}
                  </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-primary/50" />
                  {selected.address}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="label-upper text-primary/80">Infrastructure Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Internal Code</span>
                  <span className="text-sm font-mono-data font-bold uppercase">{selected.short_code}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Facility Type</span>
                  <span className="text-sm font-semibold">Distribution Center</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Active Locations</span>
                  <span className="text-sm font-bold text-primary">{selected.locations_count}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="label-upper text-primary/80">Location Topology</h3>
              <div className="h-48 rounded-2xl bg-secondary/20 border border-border/50 border-dashed flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <MapPin size={24} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Visual topology map coming soon.</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">Detailed floor plan and location hierarchy will be displayed here.</p>
                <button className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View List in Locations <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses?.map((wh, i) => (
            <motion.div
              key={wh.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                onClick={() => setSelectedId(wh.id)}
                className="card-surface w-full p-6 text-left hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-6 relative">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-inner">
                    <WarehouseIcon size={28} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono-data text-[10px] font-bold tracking-widest text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded">
                      {wh.short_code}
                    </span>
                    <button className="mt-2 p-1.5 text-muted-foreground/30 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-6 relative">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{wh.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                    <MapPin size={12} className="text-muted-foreground/50" />
                    {wh.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-border/50 relative">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] label-upper opacity-50">Locations</span>
                      <span className="font-mono-data text-sm font-bold text-primary">{wh.locations_count}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] label-upper opacity-50">Storage</span>
                      <span className="text-sm font-bold">94%</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-6 h-6 rounded-full border-2 border-card bg-secondary flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Box size={10} className="text-primary/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (warehouses?.length || 0) * 0.1 }}
            className="card-surface p-6 border-dashed border-2 bg-secondary/5 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm group-hover:text-foreground transition-colors">Register Warehouse</p>
              <p className="text-xs opacity-60">Expand your physical network</p>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}

