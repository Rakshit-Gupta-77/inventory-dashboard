import { motion } from "framer-motion";
import { ChevronRight, Package, FileInput, FileOutput, ArrowRightLeft, AlertTriangle } from "lucide-react";

const StatCard = ({ label, value, trend, icon: Icon }: { label: string; value: string; trend: number; icon: React.ElementType }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="card-surface p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <p className="label-upper">{label}</p>
      <Icon size={16} className="text-muted-foreground" />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-mono-data font-medium tracking-tighter">{value}</span>
      <span className={`text-[10px] font-mono-data ${trend > 0 ? "text-success" : "text-destructive"}`}>
        {trend > 0 ? "+" : ""}{trend}%
      </span>
    </div>
  </motion.div>
);

const recentActivity = [
  { type: "Receipt", ref: "RCP-001", product: "Steel Rods", qty: "+50", time: "2 min ago", status: "Done" },
  { type: "Delivery", ref: "DLV-003", product: "Hydraulic Fluid", qty: "-20", time: "15 min ago", status: "Ready" },
  { type: "Transfer", ref: "MVE-012", product: "Steel Gaskets", qty: "30", time: "1 hr ago", status: "Done" },
  { type: "Receipt", ref: "RCP-002", product: "Servo Motors", qty: "+100", time: "2 hr ago", status: "Waiting" },
  { type: "Adjustment", ref: "ADJ-005", product: "Copper Wire", qty: "-3", time: "3 hr ago", status: "Done" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="label-upper">Inventory</span>
          <ChevronRight size={12} />
          <span className="label-upper text-foreground">Dashboard</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tighter">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Products" value="1,482" trend={2.4} icon={Package} />
        <StatCard label="Low Stock Items" value="12" trend={-12.5} icon={AlertTriangle} />
        <StatCard label="Pending Receipts" value="8" trend={5.0} icon={FileInput} />
        <StatCard label="Pending Deliveries" value="14" trend={8.1} icon={FileOutput} />
        <StatCard label="Transfers Today" value="6" trend={0.4} icon={ArrowRightLeft} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <p className="label-upper mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Receipt", sub: "5 to validate", icon: FileInput },
              { label: "New Delivery", sub: "3 to confirm", icon: FileOutput },
            ].map((a) => (
              <button key={a.label} className="flex items-center gap-3 p-4 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors btn-press">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <a.icon size={18} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card-surface p-5">
          <p className="label-upper mb-3">Stock Alerts</p>
          <div className="space-y-2">
            {[
              { name: "Hydraulic Fluid", stock: 12, min: 50 },
              { name: "Brake Pads", stock: 3, min: 20 },
              { name: "Filter Cartridge", stock: 8, min: 25 },
            ].map((a) => (
              <div key={a.name} className="flex items-center justify-between p-3 rounded-md bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-warning" />
                  <span className="text-sm">{a.name}</span>
                </div>
                <span className="font-mono-data text-xs text-warning">{a.stock}/{a.min}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <p className="label-upper">Recent Activity</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Type", "Reference", "Product", "Qty", "Time", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 label-upper">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {recentActivity.map((row, i) => (
              <motion.tr
                key={row.ref}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 text-sm">{row.type}</td>
                <td className="px-5 py-3 font-mono-data text-xs text-primary">{row.ref}</td>
                <td className="px-5 py-3 text-sm">{row.product}</td>
                <td className={`px-5 py-3 font-mono-data text-sm ${row.qty.startsWith("+") ? "text-success" : row.qty.startsWith("-") ? "text-destructive" : "text-foreground"}`}>{row.qty}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{row.time}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                    row.status === "Done" ? "border-success/30 text-success bg-success/5" :
                    row.status === "Ready" ? "border-primary/30 text-primary bg-primary/5" :
                    "border-warning/30 text-warning bg-warning/5"
                  }`}>{row.status}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
