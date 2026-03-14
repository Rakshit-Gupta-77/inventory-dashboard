import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Warehouse as WarehouseIcon } from "lucide-react";

interface WarehouseData {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  locations: number;
}

const warehouseData: WarehouseData[] = [
  { id: "1", name: "Main Warehouse", shortCode: "WH-A", address: "123 Industrial Blvd, Houston TX", locations: 24 },
  { id: "2", name: "East Distribution Center", shortCode: "WH-B", address: "456 Logistics Way, Dallas TX", locations: 16 },
  { id: "3", name: "Production Floor Storage", shortCode: "WH-C", address: "789 Factory Rd, Austin TX", locations: 8 },
];

export default function WarehousePage() {
  const [selected, setSelected] = useState<WarehouseData | null>(null);

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
          Add Warehouse
        </button>
      </header>

      {selected ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight">{selected.name}</h2>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="label-upper mb-1">Name</p>
              <p className="text-sm">{selected.name}</p>
            </div>
            <div>
              <p className="label-upper mb-1">Short Code</p>
              <p className="font-mono-data text-sm text-primary">{selected.shortCode}</p>
            </div>
            <div className="col-span-2">
              <p className="label-upper mb-1">Address</p>
              <p className="text-sm">{selected.address}</p>
            </div>
          </div>
          <div>
            <p className="label-upper mb-2">Locations ({selected.locations})</p>
            <div className="h-40 rounded-md bg-secondary/30 border border-border flex items-center justify-center text-sm text-muted-foreground">
              Location map / list will render here
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouseData.map((wh, i) => (
            <motion.button
              key={wh.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(wh)}
              className="card-surface p-5 text-left hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <WarehouseIcon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{wh.name}</p>
                  <p className="font-mono-data text-[10px] text-primary">{wh.shortCode}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{wh.address}</p>
              <p className="label-upper mt-3">{wh.locations} Locations</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
