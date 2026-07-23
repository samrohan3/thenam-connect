import { useEffect, useState, useMemo } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, MessageSquare, Menu, Plus, Search, Sun, Moon, Calendar, LogOut, User } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AppSidebar } from "./app-sidebar";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useVentures, useProjects, useEmployees, useTasks } from "@/lib/api-hooks";

export function AppTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [today, setToday] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: ventures } = useVentures();
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: tasks } = useTasks();

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    const results: Array<{ title: string; subtitle: string; category: string; path: string }> = [];

    ventures?.filter((v: any) => v.name?.toLowerCase().includes(term) || v.code?.toLowerCase().includes(term))
      .slice(0, 3)
      .forEach((v: any) => results.push({ title: v.name, subtitle: `Venture • ${v.category || "Business"}`, category: "Venture", path: "/ventures" }));

    projects?.filter((p: any) => p.name?.toLowerCase().includes(term))
      .slice(0, 3)
      .forEach((p: any) => results.push({ title: p.name, subtitle: `Project • ${p.status}`, category: "Project", path: "/projects" }));

    employees?.filter((e: any) => e.name?.toLowerCase().includes(term) || e.email?.toLowerCase().includes(term))
      .slice(0, 3)
      .forEach((e: any) => results.push({ title: e.name, subtitle: `Employee • ${e.department || e.role}`, category: "Team", path: "/team" }));

    tasks?.filter((t: any) => t.title?.toLowerCase().includes(term))
      .slice(0, 3)
      .forEach((t: any) => results.push({ title: t.title, subtitle: `Task • ${t.status}`, category: "Task", path: "/tasks" }));

    return results;
  }, [searchQuery, ventures, projects, employees, tasks]);

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 lg:px-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
            <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden lg:inline-flex">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden md:block flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search ventures, people, projects, tasks…"
            className="pl-9 h-10 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
            ⌘K
          </kbd>

          {/* Floating Search Results */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl bg-slate-950 border border-border shadow-2xl p-3 max-h-80 overflow-y-auto space-y-2">
              {filteredResults.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2 text-center">No results found for "{searchQuery}"</p>
              ) : (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigate({ to: item.path as any });
                      setSearchQuery("");
                      setSearchFocused(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-900 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{item.category}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden xl:flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {today}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-xl gradient-royal text-white hover:opacity-90 cursor-pointer">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Quick add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-950 text-foreground border-border">
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/projects" })} className="cursor-pointer">Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/tasks" })} className="cursor-pointer">Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/team" })} className="cursor-pointer">Employee</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/finance" })} className="cursor-pointer">Transaction</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/ventures" })} className="cursor-pointer">Venture</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate({ to: "/communication" })}>
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
          </Button>

          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate({ to: "/communication" })}>
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition cursor-pointer ml-1">
                <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Admin"}`} />
                <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-950 text-foreground border-border">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="cursor-pointer gap-2">
                <User className="h-4 w-4" /> Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }} className="text-rose-400 focus:text-rose-400 cursor-pointer gap-2">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
