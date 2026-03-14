import { motion } from "framer-motion";
import { ChevronRight, Package, FileInput, FileOutput, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, trend, icon: Icon, loading }: { label: string; value: string | number; trend?: number; icon: React.ElementType; loading?: boolean }) => (
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
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <>
          <span className="text-2xl font-mono-data font-medium tracking-tighter">{value}</span>
          {trend !== undefined && (
            <span className={`text-[10px] font-mono-data ${trend > 0 ? "text-success" : "text-destructive"}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
        </>
      )}
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: api.dashboard.kpis,
  });

  const { data: moveHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["move-history"],
    queryFn: api.moveHistory.list,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const lowStockAlerts = products?.filter(p => (p.stock || 0) < (p.min_stock_level || 10)) || [];
  const displayAlerts = lowStockAlerts.slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="label-upper">Inventory</span>
            <ChevronRight size={12} />
            <span className="label-upper text-foreground">Dashboard</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter">Dashboard</h1>
        </div>
        
        {lowStockAlerts.length > 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider animate-pulse"
          >
            <AlertTriangle size={14} />
            {lowStockAlerts.length} Low Stock Items
          </motion.div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Products" value={kpis?.totalProducts || 0} loading={loadingKpis} icon={Package} />
        <StatCard label="Low Stock Items" value={kpis?.lowStockItems || 0} loading={loadingKpis} icon={AlertTriangle} />
        <StatCard label="Pending Receipts" value={kpis?.pendingReceipts || 0} loading={loadingKpis} icon={FileInput} />
        <StatCard label="Pending Deliveries" value={kpis?.pendingDeliveries || 0} loading={loadingKpis} icon={FileOutput} />
        <StatCard label="Transfers Today" value={kpis?.transfersToday || 0} loading={loadingKpis} icon={ArrowRightLeft} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <p className="label-upper mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Receipt", sub: `${kpis?.pendingReceipts || 0} to validate`, icon: FileInput, path: "/receipts" },
              { label: "New Delivery", sub: `${kpis?.pendingDeliveries || 0} to confirm`, icon: FileOutput, path: "/delivery" },
            ].map((a) => (
              <button 
                key={a.label} 
                onClick={() => navigate(a.path)}
                className="flex items-center gap-3 p-4 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors btn-press"
              >
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
          <div className="flex items-center justify-between mb-3">
            <p className="label-upper">Critical Stock Alerts</p>
            {lowStockAlerts.length > 5 && (
              <button onClick={() => navigate("/stock")} className="text-[10px] text-primary hover:underline uppercase font-bold">View All</button>
            )}
          </div>
          <div className="space-y-2">
            {loadingProducts ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)
            ) : displayAlerts.length > 0 ? (
              displayAlerts.map((a) => (
                <motion.div 
                  key={a.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-md bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors cursor-pointer"
                  onClick={() => navigate("/stock")}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-destructive" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{a.sku}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono-data text-xs text-destructive font-bold">{a.stock || 0} {a.uom}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Min: {a.min_stock_level || 10}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package size={24} className="mb-2 opacity-20" />
                <p className="text-sm">All stock levels are healthy</p>
              </div>
            )}
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
            {loadingHistory ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : moveHistory?.length > 0 ? (
              moveHistory.slice(0, 5).map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 text-sm">{row.type}</td>
                  <td className="px-5 py-3 font-mono-data text-xs text-primary">{row.reference}</td>
                  <td className="px-5 py-3 text-sm">{row.product_name}</td>
                  <td className={`px-5 py-3 font-mono-data text-sm ${row.type === 'Receipt' ? "text-success" : row.type === 'Delivery' ? "text-destructive" : "text-foreground"}`}>
                    {row.type === 'Receipt' ? '+' : row.type === 'Delivery' ? '-' : ''}{row.quantity}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(row.date).toLocaleTimeString()}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider border-success/30 text-success bg-success/5">Done</span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
