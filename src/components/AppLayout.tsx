import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Search } from "lucide-react";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search SKUs, products, locations..."
              className="bg-transparent border-none outline-none text-sm w-full max-w-md placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-secondary border border-border" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
