import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ShieldCheck, TrendingUp, Users, KeyRound, UserCheck, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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
      await login({ email: roleItem.email, password: "Admin@1234", role: roleItem.id });
      toast.success(`Logged in as ${roleItem.id.toUpperCase()}`);
      navigate({ to: "/" });
    } catch (dbErr: any) {
      console.error("Login Error:", dbErr);
      toast.error(dbErr.response?.data?.message || dbErr.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password, role: selectedRole });
      toast.success(`Logged in as ${selectedRole.toUpperCase()}`);
      navigate({ to: "/" });
    } catch (dbErr: any) {
      console.error("Login Error:", dbErr);
      toast.error(dbErr.response?.data?.message || dbErr.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    toast.info("Using Developer Fast Login...");
    setLoading(true);
    try {
      // Direct sign in with credentials of the currently selected role
      const matchedRole = rolesList.find(r => r.id === selectedRole) || rolesList[0];
      await login({ email: matchedRole.email, password: "Admin@1234", role: selectedRole });
      toast.success(`Signed in as ${selectedRole.toUpperCase()} (Developer Bypass)`);
      navigate({ to: "/" });
    } catch (dbErr: any) {
      console.error("Login Error:", dbErr);
      toast.error("Developer Fast Login Failed");
    } finally {
      setLoading(false);
    }
  };
  // Role-specific theme configuration for dynamic styling
  const roleThemes: Record<RoleType, { gradient: string; tint: string; accent: string }> = {
    admin: {
      gradient: "from-blue-600 via-indigo-700 to-purple-800",
      tint: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      accent: "text-blue-500"
    },
    manager: {
      gradient: "from-teal-600 via-emerald-700 to-cyan-800",
      tint: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      accent: "text-emerald-500"
    },
    employee: {
      gradient: "from-purple-600 via-pink-700 to-rose-800",
      tint: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      accent: "text-pink-500"
    },
    founder: {
      gradient: "from-amber-600 via-orange-700 to-yellow-850",
      tint: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      accent: "text-amber-500"
    }
  };

  const currentTheme = roleThemes[selectedRole];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Background Decorative Blobs for Login Form (Right Panel) */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-[20%] bottom-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left illustration - Dynamic Gradient based on Selected Role */}
      <div className={`relative hidden lg:block overflow-hidden transition-all duration-700 bg-gradient-to-br ${currentTheme.gradient} text-white`}>
        {/* Dynamic decorative shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 bottom-0 h-[520px] w-[520px] rounded-full bg-black/20 blur-3xl" 
        />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          {/* Header Brand */}
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="Thenam Logo" className="h-11 w-11 object-contain shrink-0" />
            <div>
              <p className="font-bold text-lg tracking-wide">Thenam Software Solutions</p>
              <p className="text-xs opacity-75">Business Management ERP Platform</p>
            </div>
          </div>

          {/* Core App Pitch */}
          <div className="max-w-md my-auto">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 bg-white/15 border border-white/25 backdrop-blur-sm`}>
              <ShieldCheck className="h-3.5 w-3.5" /> Core Command Center
            </span>
            <motion.h1
              key={selectedRole}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] drop-shadow-md"
            >
              Run every venture from one command center.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              className="mt-4 text-base text-white/90 font-medium"
            >
              Multi-role secure JWT authentication, finance, people, projects, and live analytics.
            </motion.p>

            {/* Quick Metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, label: "Revenue", value: "$2.4M" },
                { icon: Users, label: "Team", value: "128" },
                { icon: ShieldCheck, label: "Uptime", value: "99.9%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all shadow-md">
                  <s.icon className="h-4 w-4 opacity-80 mb-2" />
                  <p className="text-[11px] opacity-75 uppercase font-semibold tracking-wider">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-60">© {new Date().getFullYear()} Thenam Software Solutions. All rights reserved.</p>
        </div>
      </div>

      {/* Right form - Styled beautifully with Glassmorphism Card */}
      <div className="flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle colored glow in card corner */}
          <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-20 transition-all duration-700 bg-current ${currentTheme.accent}`} />

          {/* Logo for mobile view */}
          <div className="lg:hidden mb-8 flex items-center gap-3.5">
            <img src="/logo.png" alt="Thenam Logo" className="h-10 w-10 object-contain shrink-0" />
            <div>
              <p className="font-bold text-sm">Thenam Software Solutions</p>
              <p className="text-[11px] text-muted-foreground">Business Management ERP</p>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Select a role & sign in with secure local credentials.
          </p>

          {/* Role selector buttons */}
          <div className="mt-6">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Login Role</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {rolesList.map((r) => (
                <motion.button
                  key={r.id}
                  type="button"
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect(r)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-2.5 cursor-pointer relative ${
                    selectedRole === r.id 
                      ? 'border-indigo-500/80 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5' 
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${selectedRole === r.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wide">{r.label}</p>
                    <p className="text-[9px] opacity-75">{r.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500 text-slate-100 transition-all placeholder:text-slate-600"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Forgot password?</a>
              </div>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500 text-slate-100 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <Checkbox id="remember" defaultChecked className="rounded-md border-slate-800 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold tracking-wide hover:from-indigo-600 hover:to-blue-700 transition shadow-lg shadow-indigo-500/10 gap-1.5 cursor-pointer"
              >
                {loading ? "Signing in…" : `Sign in as ${selectedRole.toUpperCase()}`}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-11 rounded-2xl border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 text-slate-300 hover:text-white transition gap-2 cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-amber-500" />
                Developer Fast Login
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Need workspace access?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold transition-all">Contact Administrator</Link>
          </p>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}
