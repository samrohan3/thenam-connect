import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Thenam Software Solutions" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: replace with real auth API call
    setTimeout(() => navigate({ to: "/" }), 700);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left illustration */}
      <div className="relative hidden lg:block overflow-hidden gradient-brand text-white">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Thenam Software Solutions</p>
              <p className="text-xs opacity-80">Business Management ERP Platform</p>
            </div>
          </div>

          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1]"
            >
              Run every venture from one command center.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-white/85"
            >
              Finance, people, projects and analytics — unified, real-time, enterprise-grade.
            </motion.p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, label: "Revenue", value: "$2.4M" },
                { icon: Users, label: "Team", value: "128" },
                { icon: ShieldCheck, label: "Uptime", value: "99.99%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <s.icon className="h-4 w-4 opacity-80" />
                  <p className="mt-3 text-xs opacity-80">{s.label}</p>
                  <p className="text-lg font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-70">© {new Date().getFullYear()} Thenam Software Solutions</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Thenam Software Solutions</p>
              <p className="text-xs text-muted-foreground">Business Management ERP</p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your workspace to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                defaultValue="aarav@thenam.com"
                className="mt-1.5 h-11 rounded-xl"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                required
                defaultValue="••••••••"
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Remember me for 30 days
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5"
            >
              {loading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Contact your admin</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
