import { motion } from "framer-motion";
import { ChevronRight, Plus, MapPin } from "lucide-react";

const locations = [
  { id: "1", name: "Rack A-01", warehouse: "WH-A", type: "Storage", items: 42 },
  { id: "2", name: "Rack A-02", warehouse: "WH-A", type: "Storage", items: 38 },
  { id: "3", name: "Production Line 1", warehouse: "WH-C", type: "Production", items: 12 },
  { id: "4", name: "Receiving Bay", warehouse: "WH-A", type: "Receiving", items: 5 },
  { id: "5", name: "Shipping Dock", warehouse: "WH-B", type: "Shipping", items: 18 },
  { id: "6", name: "Cold Storage", warehouse: "WH-B", type: "Storage", items: 24 },
];

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Settings</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Locations</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Locations</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors glow-primary btn-press">
          <Plus size={14} />
          Add Location
        </button>
      </header>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Location", "Warehouse", "Type", "Items"].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {locations.map((loc, i) => (
              <motion.tr
                key={loc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-sm font-medium">{loc.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{loc.warehouse}</td>
                <td className="px-5 py-3">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-secondary/50 font-bold uppercase tracking-wider">
                    {loc.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono-data text-sm">{loc.items}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
