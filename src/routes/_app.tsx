import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/authStore";
import { AnnouncementPopup } from "@/components/announcements/AnnouncementPopup";
import { useNotifications } from "@/lib/api-hooks";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useRef } from "react";

function EmployeeCelebration() {
  const { data: notifications } = useNotifications();
  const processedNotifs = useRef(new Set<string>());

  useEffect(() => {
    if (!notifications) return;

    notifications.forEach((n: any) => {
      if (n.type === "employee_joined" && !n.isRead && !processedNotifs.current.has(n._id)) {
        processedNotifs.current.add(n._id);
        
        // Trigger confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();

        // Show Toast
        toast(
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base text-primary">🎉 {n.title}</h3>
            <p className="text-sm">{n.message}</p>
          </div>,
          { duration: 8000, position: "top-center" }
        );
      }
    });
  }, [notifications]);

  return null;
}

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-background text-foreground flex">
        <AnnouncementPopup />
        <EmployeeCelebration />
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <AppTopbar onToggleSidebar={() => setCollapsed((c) => !c)} />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
}
