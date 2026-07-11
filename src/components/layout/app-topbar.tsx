import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Menu, Plus, Search, Sun, Moon, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AppSidebar } from "./app-sidebar";
import { Link } from "@tanstack/react-router";

export function AppTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [today, setToday] = useState("");
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
            placeholder="Search ventures, people, docs…"
            className="pl-9 h-10 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden xl:flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {today}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-xl gradient-royal text-white hover:opacity-90">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Quick add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Project</DropdownMenuItem>
              <DropdownMenuItem>Task</DropdownMenuItem>
              <DropdownMenuItem>Employee</DropdownMenuItem>
              <DropdownMenuItem>Transaction</DropdownMenuItem>
              <DropdownMenuItem>Document</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 rounded-full bg-gold text-gold-foreground text-[10px]">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Link to="/settings" className="ml-1">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition">
              <AvatarImage src="https://i.pravatar.cc/100?img=12" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
