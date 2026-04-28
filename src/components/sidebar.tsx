"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Inbox, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  Users, 
  Building2,
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Unified Inbox", href: "/inbox", icon: Inbox },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Crisis Alerts", href: "/alerts", icon: ShieldAlert, urgent: true },
];

const managementItems = [
  { name: "Brands", href: "/brands", icon: Building2 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-4">
        <div>
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "w-5 h-5",
                      pathname === item.href ? "text-primary" : "group-hover:text-accent-foreground"
                    )} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.urgent && (
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Management
          </p>
          <ul className="space-y-1">
            {managementItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    pathname === item.href ? "text-primary" : "group-hover:text-accent-foreground"
                  )} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 p-2 rounded-lg flex-1 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-premium-gradient flex items-center justify-center text-primary-foreground font-bold text-xl">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">Super Admin</p>
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-muted-foreground hover:text-rose-500 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </aside>
  );
}
