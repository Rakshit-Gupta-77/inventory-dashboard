import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 group relative ${
      active
        ? "bg-secondary text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
    }`}
  >
    <Icon size={18} className={active ? "text-primary" : "group-hover:text-foreground"} />
    {!collapsed && <span className="text-sm font-medium tracking-tight">{label}</span>}
    {active && (
      <motion.div
        layoutId="sidebar-active"
        className="absolute right-2 w-1 h-4 bg-primary rounded-full"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const renderGroup = (title: string, items: typeof navItems) => (
    <div className="space-y-1">
      {!collapsed && <p className="label-upper px-3 mb-2">{title}</p>}
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
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen border-r border-border flex flex-col bg-background overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
        <div className="w-7 h-7 bg-primary rounded flex items-center justify-center shrink-0">
          <Package size={14} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold tracking-tighter text-lg">
            APEX<span className="text-muted-foreground">INV</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {renderGroup("Main", navItems)}
        <div className="h-px bg-border" />
        {renderGroup("Operations", operationItems)}
        <div className="h-px bg-border" />
        {renderGroup("Settings", settingItems)}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <SidebarItem
          icon={User}
          label="Profile"
          active={false}
          collapsed={collapsed}
          onClick={() => {}}
        />
        <SidebarItem
          icon={LogOut}
          label="Logout"
          active={false}
          collapsed={collapsed}
          onClick={() => {}}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
