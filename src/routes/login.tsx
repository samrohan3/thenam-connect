import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Users, KeyRound, UserCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Thenam Software Solutions" }] }),
  component: LoginPage,
});

type RoleType = "admin" | "manager" | "employee" | "founder";

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>("admin");
  const [email, setEmail] = useState("admin@thenam.com");
  const [password, setPassword] = useState("Admin@1234");

  const rolesList: Array<{ id: RoleType; label: string; email: string; desc: string }> = [
    { id: "admin", label: "Admin", email: "admin@thenam.com", desc: "Full System Control" },
    { id: "manager", label: "Manager", email: "isha@thenam.com", desc: "Venture & Projects" },
    { id: "employee", label: "Employee", email: "neha@thenam.com", desc: "Tasks & Team" },
    { id: "founder", label: "Founder", email: "aarav@thenam.com", desc: "Executive Insights" },
  ];

  const handleRoleSelect = async (roleItem: typeof rolesList[0]) => {
    setSelectedRole(roleItem.id);
    setEmail(roleItem.email);
    setPassword("Admin@1234");
    toast.info(`Logging in as ${roleItem.label}...`);

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, roleItem.email, "Admin@1234");
      const idToken = await res.user.getIdToken();
      await login({ token: idToken, role: roleItem.id });
      toast.success(`Logged in as ${roleItem.id.toUpperCase()}`);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      toast.error(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await res.user.getIdToken();
      await login({ token: idToken, role: selectedRole });
      toast.success(`Logged in as ${selectedRole.toUpperCase()}`);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error("Firebase Submit Error:", err);
      toast.error(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const idToken = await user.getIdToken();
      await login({ token: idToken, role: selectedRole });
      toast.success(`Authenticated with Google as ${user.displayName || "User"}`);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      toast.error(err.response?.data?.message || err.message || "Google Sign-In Failed");
    } finally {
      setLoading(false);
    }
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
              Multi-role Firebase authentication, finance, people, projects, and live analytics.
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
          <p className="mt-1.5 text-sm text-muted-foreground">
            Select a role & sign in with Firebase Auth.
          </p>

          {/* Role selector buttons */}
          <div className="mt-6">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Login Role</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {rolesList.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${selectedRole === r.id ? 'border-primary bg-primary/10 text-foreground font-semibold' : 'border-border bg-slate-900/50 text-muted-foreground hover:bg-slate-900'}`}
                >
                  <UserCheck className={`h-4 w-4 ${selectedRole === r.id ? 'text-primary' : 'opacity-40'}`} />
                  <div>
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Remember me for 30 days
            </label>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5 cursor-pointer"
              >
                {loading ? "Signing in…" : `Sign in as ${selectedRole.toUpperCase()}`}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-11 rounded-xl border-border bg-slate-900/50 hover:bg-slate-900 gap-2 cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-emerald-400" />
                Sign in with Firebase / Google
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need workspace access?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Contact Administrator</Link>
          </p>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}
