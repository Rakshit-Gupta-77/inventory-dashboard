import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  MapPin,
  FileInput,
  FileOutput,
  History,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Stock", icon: Package, path: "/stock" },
  { label: "Products", icon: Package, path: "/products" },
];

const operationItems = [
  { label: "Receipts", icon: FileInput, path: "/receipts" },
  { label: "Delivery", icon: FileOutput, path: "/delivery" },
  { label: "Move History", icon: History, path: "/move-history" },
];

const settingItems = [
  { label: "Warehouse", icon: Warehouse, path: "/warehouse" },
  { label: "Locations", icon: MapPin, path: "/locations" },
];

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative mb-1",
      active
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 erp-active-item"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    )}
  >
    <Icon size={18} className={cn("shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} />
    {!collapsed && (
      <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
    {active && !collapsed && (
      <motion.div
        layoutId="sidebar-active-indicator"
        className="absolute right-2 w-1 h-4 bg-primary-foreground/40 rounded-full"
      />
    )}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </button>
);

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const renderGroup = (title: string, items: typeof navItems) => (
    <div className="space-y-1 mb-6">
      {!collapsed && (
        <p className="label-upper px-3 mb-3 flex items-center gap-2">
          <span className="w-1 h-1 bg-primary rounded-full" />
          {title}
        </p>
      )}
      {items.map((item) => (
        <SidebarItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          active={location.pathname === item.path}
          collapsed={collapsed}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen border-r border-border/50 flex flex-col bg-card/50 backdrop-blur-xl overflow-hidden shrink-0 z-30 relative"
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center gap-3 px-4 border-b border-border/50 shrink-0 bg-background/40",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <div className="w-9 h-9 bg-premium-gradient rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
          <Package size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-lg leading-none">
              APEX<span className="text-primary">INV</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enterprise</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
        {renderGroup("Main", navItems)}
        {renderGroup("Operations", operationItems)}
        {renderGroup("Settings", settingItems)}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-4 space-y-2 bg-background/40">
        <SidebarItem
          icon={User}
          label="Profile"
          active={location.pathname === "/profile"}
          collapsed={collapsed}
          onClick={() => navigate("/profile")}
        />
        <SidebarItem
          icon={LogOut}
          label="Logout"
          active={false}
          collapsed={collapsed}
          onClick={handleLogout}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full mt-2 hover:bg-secondary flex items-center justify-center h-8",
            collapsed ? "px-0" : "px-2"
          )}
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </motion.aside>
  );
}
