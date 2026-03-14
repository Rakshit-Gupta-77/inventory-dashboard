import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Warehouse as WarehouseIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function WarehousePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.warehouses.list,
  });

  const selected = warehouses?.find(w => w.id === selectedId);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Settings</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Warehouse</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Warehouses</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
          <Plus size={14} />
          New Warehouse
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : selected ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <WarehouseIcon size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-medium">{selected.name}</h2>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">Back to list</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="label-upper mb-1">Full Name</p>
              <p className="text-sm">{selected.name}</p>
            </div>
            <div>
              <p className="label-upper mb-1">Short Code</p>
              <p className="font-mono-data text-sm text-primary">{selected.short_code}</p>
            </div>
            <div className="col-span-2">
              <p className="label-upper mb-1">Address</p>
              <p className="text-sm">{selected.address}</p>
            </div>
          </div>
          <div>
            <p className="label-upper mb-2">Locations ({selected.locations_count})</p>
            <div className="h-40 rounded-md bg-secondary/30 border border-border flex items-center justify-center text-sm text-muted-foreground">
              Location details are available in the Locations page
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses?.map((wh, i) => (
            <motion.button
              key={wh.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedId(wh.id)}
              className="card-surface p-5 text-left hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <WarehouseIcon size={18} className="text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-mono-data text-[10px] text-primary">{wh.short_code}</span>
              </div>
              <h3 className="font-medium mb-1">{wh.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-4">{wh.address}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-[10px] label-upper">Locations</span>
                <span className="font-mono-data text-xs">{wh.locations_count}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
