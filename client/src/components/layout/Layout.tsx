import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Files, 
  PlusCircle, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Menu,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Applications Queue", href: "/applications", icon: Files },
    { name: "New Application", href: "/applications/new", icon: PlusCircle },
    { name: "Agent Tasks", href: "/agent-tasks", icon: Zap },
    { name: "Decision History", href: "/history", icon: History },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings, disabled: true },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-black text-lg leading-none tracking-tight">Credit Sentinel</h1>
          <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">Autonomous Engine</p>
        </div>
      </div>
      
      <div className="px-4 py-4 flex-1">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.disabled ? "#" : item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-slate-400")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-slate-900">Alex Morgan</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-wider">Credit Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 fixed inset-y-0 z-50">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {navigation.find((n) => n.href === location || (n.href !== '/' && location.startsWith(n.href)))?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Agent Active</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-auto py-1.5 hover:bg-slate-100 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shadow-md shadow-primary/20">
                    AM
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <DropdownMenuLabel className="font-black text-xs text-slate-400 uppercase tracking-widest">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg font-bold">Profile</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg font-bold">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg font-bold">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
