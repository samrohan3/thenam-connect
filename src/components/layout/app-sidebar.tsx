import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Users,
  Users2,
  FolderKanban,
  CheckSquare,
  Trophy,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute, normalizeRole } from "@/lib/permissions";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/ventures", label: "Ventures", icon: Briefcase },
  { to: "/teams", label: "Teams", icon: Users2 },
  { to: "/team", label: "Employees", icon: Users },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/rewards", label: "Rewards", icon: Trophy },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuthStore();
  const role = normalizeRole(user?.role);

  // Filter navigation items based on role permissions
  const visibleNav = nav.filter((item) => canAccessRoute(user?.role, item.to));

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden lg:flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src="/logo.png" alt="Thenam Logo" className="h-9 w-9 shrink-0 object-contain" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              Thenam
            </p>
            <p className="truncate text-[11px] text-white/60">Business ERP Platform</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition",
            collapsed && "rotate-180",
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleNav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-all",
                "hover:bg-white/5 hover:text-white",
                active && "bg-white/10 text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl gradient-royal opacity-90"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3 rounded-xl px-2 py-2", !collapsed && "bg-white/5")}>
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white/10">
            <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name || "Logged User"}</p>
              <p className="truncate text-[11px] font-medium text-emerald-400">{role}</p>
            </div>
          )}
          {!collapsed && (
            <Link
              to="/login"
              onClick={logout}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
