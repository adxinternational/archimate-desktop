import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FolderOpen, Users, HardHat, Building2,
  ChevronLeft, ChevronRight, Menu, X, LogOut, Settings,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { getInitials } from "@/lib/constants";

const NAV_ITEMS = [
  { path: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/projets", label: "Projets", icon: FolderOpen },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/chantier", label: "Chantier", icon: HardHat },
  { path: "/cabinet", label: "Cabinet", icon: Building2 },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed ? "justify-center px-2" : ""
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Compass className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-sidebar-foreground tracking-wide">ArchiMate</div>
            <div className="text-xs text-sidebar-foreground/50">Cabinet d'architecture</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          collapsed ? (
            <Tooltip key={path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={path}>
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-150 cursor-pointer",
                    isActive(path)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <Link key={path} href={path}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group",
                isActive(path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </Link>
          )
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-sidebar-foreground truncate">{user.name ?? user.email}</div>
                <div className="text-xs text-sidebar-foreground/50 truncate">{user.email}</div>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <a href={getLoginUrl()}>
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center cursor-pointer">
                      <LogOut className="w-4 h-4 text-sidebar-foreground/70" />
                    </div>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right">Se connecter</TooltipContent>
              </Tooltip>
            ) : (
              <a href={getLoginUrl()} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80">
                  Se connecter
                </Button>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-8 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sidebar-primary" />
                <span className="font-bold text-sidebar-foreground">ArchiMate</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">ArchiMate</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
