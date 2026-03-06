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
  Bot,
  X,
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
    { name: "Applications", href: "/applications", icon: Files },
    { name: "New Application", href: "/applications/new", icon: PlusCircle },
    { name: "Decision History", href: "/history", icon: History },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-900 shadow-sm">
      <div className="p-8 flex items-center justify-between border-b border-slate-50">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/assets/chinhin-logo.png"
                alt="Chin Hin Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-xl leading-none tracking-tight">
                CHIN HIN
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                Credit Sentinel
              </p>
            </div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="px-4 py-8 flex-1">
        <nav className="space-y-1">
          {navigation.map((item) => {
            // Fix: Only highlight exact match or parent without more specific child active
            const isExactMatch = location === item.href;
            const isParentOfCurrent =
              item.href !== "/" && location.startsWith(item.href + "/");

            // Only mark as active if it's an exact match
            const isActive = isExactMatch;

            // For parent routes like /applications, show subtle indicator if child is active
            const hasActiveChild = isParentOfCurrent;

            return (
              <Link
                key={item.name}
                href={item.disabled ? "#" : item.href}
                onClick={() => setIsMobileOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-black transition-all cursor-pointer group",
                    isActive
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                      : hasActiveChild
                      ? "bg-slate-100 text-slate-700"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-white"
                        : hasActiveChild
                        ? "text-primary"
                        : "text-slate-300 group-hover:text-primary",
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 rounded-3xl p-4 flex items-center gap-4 border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate text-slate-900">
              Officer 01
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Chin Hin HQ
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex selection:bg-primary selection:text-white">
      {/* Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-80 border-none shadow-2xl">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <img
                src="/assets/chinhin-logo.png"
                alt="Chin Hin"
                className="h-10 w-auto hidden sm:block"
              />
              <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full hidden sm:block" />
                {navigation.find(
                  (n) =>
                    n.href === location ||
                    (n.href !== "/" && location.startsWith(n.href)),
                )?.name || "Credit Sentinel"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Agent Orchestration Active
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 pl-3 pr-2 h-14 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-900/20">
                    AD
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-3 rounded-3xl border-slate-100 shadow-2xl mt-2"
              >
                <DropdownMenuLabel className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2 px-2">
                  Account Control
                </DropdownMenuLabel>
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-2xl font-bold p-3 hover:bg-slate-50 cursor-pointer">
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/team">
                  <DropdownMenuItem className="rounded-2xl font-bold p-3 hover:bg-slate-50 cursor-pointer">
                    Team Management
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                <DropdownMenuItem className="text-rose-600 focus:text-rose-600 font-black rounded-2xl p-3 hover:bg-rose-50 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-10 max-w-[1440px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
        <footer className="border-t border-slate-100 bg-white/80 px-10 py-4 flex items-center justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Powered by BlockNexa Labs
          </p>
        </footer>
      </div>
    </div>
  );
}
