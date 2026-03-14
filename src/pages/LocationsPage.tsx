import { motion } from "framer-motion";
import { ChevronRight, Plus, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function LocationsPage() {
  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: api.locations.list,
  });

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
          New Location
        </button>
      </header>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Location", "Warehouse", "Type", ""].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => <tr key={i}><td colSpan={4} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>)
            ) : locations?.length > 0 ? (
              locations.map((loc, i) => (
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
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{loc.warehouse_name}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-secondary/50 font-bold uppercase tracking-wider">
                      {loc.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">No locations found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
