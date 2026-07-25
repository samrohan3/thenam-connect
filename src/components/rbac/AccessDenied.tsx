import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { normalizeRole } from "@/lib/permissions";

export function AccessDenied({ resource }: { resource?: string }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentRole = normalizeRole(user?.role);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-rose-500/10 blur-xl animate-pulse" />
        <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-lg">
          <ShieldAlert className="h-10 w-10" />
        </div>
      </div>

      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 rounded-full border border-rose-500/20 mb-3">
        403 Access Denied
      </span>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-3">
        Restricted Area
      </h1>

      <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
        Your current role (<strong className="text-foreground font-semibold">{currentRole}</strong>) does not have permission to access {resource ? <span className="font-semibold text-foreground">{resource}</span> : "this page"}. Contact your system administrator or founder if you believe this is an error.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="gap-2 rounded-xl border-border"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>

        <Button
          onClick={() => navigate({ to: "/" })}
          className="gap-2 rounded-xl gradient-royal text-white hover:opacity-90 shadow-md"
        >
          <Home className="h-4 w-4" /> Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
