import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Search, Bell, User, Command as CommandIcon, Package, Warehouse, History, ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const { data: stock } = useQuery({
    queryKey: ["stock"],
    queryFn: api.stock.list,
  });

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/60 backdrop-blur-xl z-20 shrink-0 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setOpen(true)}
              className="relative group max-w-md w-full flex items-center gap-3 bg-secondary/40 border border-transparent hover:border-primary/20 hover:bg-background rounded-full py-2 px-4 text-sm text-muted-foreground transition-all duration-200"
            >
              <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left">Search everything...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-secondary transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            <div className="h-8 w-px bg-border/50 mx-1" />
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none mb-1">Admin User</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Inventory Manager</p>
              </div>
              <Avatar className="h-9 w-9 border border-border/50 shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => runCommand(() => navigate("/products"))}>
                <Package className="mr-2 h-4 w-4" />
                <span>View Products</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/stock"))}>
                <Warehouse className="mr-2 h-4 w-4" />
                <span>Check Stock</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/move-history"))}>
                <History className="mr-2 h-4 w-4" />
                <span>Movement Ledger</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {products?.slice(0, 5).map((p) => (
                <CommandItem key={p.id} onSelect={() => runCommand(() => navigate("/products"))}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-primary/60" />
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Warehouses">
              <CommandItem onSelect={() => runCommand(() => navigate("/warehouse"))}>
                <Warehouse className="mr-2 h-4 w-4 text-primary/60" />
                <span>Main Warehouse</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main className="flex-1 overflow-y-auto bg-muted/20 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

