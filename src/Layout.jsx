import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState } from "react";
import {
  LayoutDashboard, Package, Factory, Bell, Search,
  Menu, X, ChevronRight, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "Dashboard", icon: LayoutDashboard },
  { name: "Purchase Orders", href: "PurchaseOrders", icon: Package },
  { name: "Suppliers", href: "Suppliers", icon: Factory },
  { name: "Alerts", href: "Alerts", icon: Bell },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Customer trace page has its own layout
  if (currentPageName === "CustomerTrace") {
    return (
      <div className="min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl("CustomerTrace")} className="flex items-center gap-3">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69817631c26bdf765478e800/c906bcb45_Screenshot2026-02-09at62054PM.png"
                  alt="TraceLoom"
                  className="w-10 h-10 object-contain rounded-lg"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">TraceLoom</span>
              </Link>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  Control Tower
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69817631c26bdf765478e800/240cb254c_Screenshot2026-02-09at62040PM.png"
              alt="TraceLoom"
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">TraceLoom</span>
              <span className="text-navy-600 font-semibold ml-1 text-sm">Pulse</span>
            </div>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-pink-50 hover:via-purple-50 hover:to-cyan-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <Link to={createPageUrl("CustomerTrace")}>
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-cyan-50 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-semibold text-sm mb-1">
                <Search className="w-4 h-4 text-purple-600" />
                Customer Portal
              </div>
              <p className="text-xs text-slate-500">Public traceability view</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Alerts")}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
