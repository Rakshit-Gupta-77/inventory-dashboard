import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Package, 
  FileInput, 
  FileOutput, 
  ArrowRightLeft, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";

const StatCard = ({ label, value, trend, icon: Icon, loading, color }: { 
  label: string; 
  value: string | number; 
  trend?: number; 
  icon: React.ElementType; 
  loading?: boolean;
  color: "blue" | "purple" | "amber" | "green" | "rose"
}) => {
  const colors = {
    blue: "from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20",
    green: "from-green-500/20 to-green-500/5 text-green-500 border-green-500/20",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-500 border-rose-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden p-6 rounded-2xl border bg-gradient-to-br shadow-sm",
        colors[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label-upper opacity-80 mb-1">{label}</p>
          {loading ? (
            <Skeleton className="h-9 w-24 bg-current/10" />
          ) : (
            <h3 className="text-3xl font-black tracking-tighter text-foreground">
              {value}
            </h3>
          )}
        </div>
        <div className="p-3 rounded-xl bg-background/50 border border-white/10 shadow-inner">
          <Icon size={24} />
        </div>
      </div>
      
      {!loading && trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
            trend > 0 ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">vs last month</span>
        </div>
      )}
      
      {/* Background Decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
        <Icon size={100} strokeWidth={1} />
      </div>
    </motion.div>
  );
};

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

  // Mock data for charts
  const categoryData = products ? Array.from(products.reduce((acc: any, p) => {
    acc.set(p.category, (acc.get(p.category) || 0) + 1);
    return acc;
  }, new Map())).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  const activityData = [
    { day: 'Mon', receipts: 4, deliveries: 2 },
    { day: 'Tue', receipts: 3, deliveries: 5 },
    { day: 'Wed', receipts: 7, deliveries: 3 },
    { day: 'Thu', receipts: 5, deliveries: 8 },
    { day: 'Fri', receipts: 8, deliveries: 4 },
    { day: 'Sat', receipts: 2, deliveries: 1 },
    { day: 'Sun', receipts: 1, deliveries: 2 },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="label-upper">Enterprise</span>
            <ChevronRight size={12} />
            <span className="label-upper text-primary font-black">IMS Dashboard</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">System Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time inventory analytics and operations control.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lowStockAlerts.length > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest animate-pulse shadow-lg shadow-rose-500/5"
            >
              <AlertTriangle size={16} />
              {lowStockAlerts.length} Critical Alerts
            </motion.div>
          )}
          <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Activity size={16} />
            Generate Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Products" value={kpis?.totalProducts || 0} loading={loadingKpis} icon={Package} color="blue" trend={12} />
        <StatCard label="Low Stock" value={kpis?.lowStockItems || 0} loading={loadingKpis} icon={AlertTriangle} color="rose" trend={-5} />
        <StatCard label="Pending Receipts" value={kpis?.pendingReceipts || 0} loading={loadingKpis} icon={FileInput} color="purple" trend={8} />
        <StatCard label="Pending Deliveries" value={kpis?.pendingDeliveries || 0} loading={loadingKpis} icon={FileOutput} color="amber" trend={15} />
        <StatCard label="Internal Transfers" value={kpis?.transfersToday || 0} loading={loadingKpis} icon={ArrowRightLeft} color="green" trend={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card-surface p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Operational Activity
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">Weekly throughput of goods</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Receipts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Deliveries</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Area type="monotone" dataKey="receipts" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorReceipts)" />
                <Area type="monotone" dataKey="deliveries" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDeliveries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-surface p-8"
        >
          <div className="mb-8">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <PieChartIcon size={20} className="text-primary" />
              Stock Mix
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">Inventory by Category</p>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black">{categoryData.length}</span>
              <span className="text-[8px] uppercase font-black text-muted-foreground">Categories</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-muted-foreground">{c.name}</span>
                </div>
                <span className="text-xs font-black">{c.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card-surface p-8">
          <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Operations Control
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Incoming Logistics", sub: `${kpis?.pendingReceipts || 0} pending receipts`, icon: FileInput, path: "/receipts", color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Customer Fulfillment", sub: `${kpis?.pendingDeliveries || 0} pending orders`, icon: FileOutput, path: "/delivery", color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((a) => (
              <button 
                key={a.label} 
                onClick={() => navigate(a.path)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98] text-left group shadow-sm"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", a.bg, a.color)}>
                  <a.icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-500" />
              Inventory Risks
            </h3>
            {lowStockAlerts.length > 5 && (
              <button onClick={() => navigate("/stock")} className="text-[10px] text-primary hover:underline uppercase font-black tracking-widest">View All</button>
            )}
          </div>
          <div className="space-y-3">
            {loadingProducts ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : displayAlerts.length > 0 ? (
              displayAlerts.map((a) => (
                <motion.div 
                  key={a.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-all cursor-pointer group shadow-sm"
                  onClick={() => navigate("/stock")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{a.sku}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-rose-500">{a.stock || 0} {a.uom}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Min: {a.min_stock_level || 10}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 bg-muted/5 rounded-2xl border border-dashed border-border/50">
                <Package size={40} strokeWidth={1} className="mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">No Inventory Risks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity table - upgraded */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-border/50 bg-background/40">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              System Ledger
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">Latest stock movements across nodes</p>
          </div>
          <button onClick={() => navigate("/move-history")} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-border rounded-lg hover:bg-secondary transition-colors">Audit Full Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Operation", "Reference", "Entity", "Quantity", "Timestamp", "Status"].map((h) => (
                  <th key={h} className="px-8 py-4 label-upper">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {loadingHistory ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}><td colSpan={6} className="px-8 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : moveHistory?.length > 0 ? (
                moveHistory.slice(0, 8).map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="table-row-hover group cursor-pointer"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          row.type === 'Receipt' ? "bg-green-500" : row.type === 'Delivery' ? "bg-rose-500" : "bg-blue-500"
                        )} />
                        <span className="text-sm font-bold">{row.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 font-mono text-xs text-primary font-black">{row.reference}</td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{row.product_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">{row.sku}</span>
                      </div>
                    </td>
                    <td className={cn(
                      "px-8 py-4 font-mono text-sm font-black",
                      row.type === 'Receipt' ? "text-green-500" : row.type === 'Delivery' ? "text-rose-500" : "text-foreground"
                    )}>
                      {row.type === 'Receipt' ? '+' : row.type === 'Delivery' ? '-' : ''}{row.quantity}
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-muted-foreground/80">
                      {new Date(row.date).toLocaleDateString()}
                      <span className="block text-[10px] font-medium opacity-50">{new Date(row.date).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="erp-badge border-green-500/20 text-green-500 bg-green-500/5">Validated</span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">No System Activity Logged</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

