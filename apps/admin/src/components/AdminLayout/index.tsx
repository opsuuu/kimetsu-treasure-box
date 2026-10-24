import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { LogOut, ChevronRight, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { navItems } from "@/config/navigation";

export function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-300",
          "md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="px-5 py-5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-giyu to-shinobu px-4 py-2 shadow-sm">
            <span className="text-xs font-bold tracking-widest text-white">
              義忍 × 圖鑑
            </span>
          </div>
          <p className="mt-1.5 text-[12px] text-gray-400 ms-2">後台管理系統</p>
        </div>

        <div className="mx-4 border-t border-gray-100" />

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-linear-to-r from-giyu/10 to-shinobu/10 text-giyu"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-giyu"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-giyu/60" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-3">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} className="shrink-0" />
            登出
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            className="mr-4 md:hidden"
          >
            <Menu size={20} />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
            <div className="h-5 w-5 rounded-full bg-linear-to-br from-giyu to-shinobu" />
            <span className="text-xs font-medium text-gray-700">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
