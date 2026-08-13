import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ShieldCheck, TrendingUp, Users, UserCheck, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import api from "@/lib/api";
import { useForgotPassword } from "@/lib/api-hooks";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Thenam Software Solutions" }] }),
  component: LoginPage,
});

type RoleType = "admin" | "finance" | "founder" | "designer" | "analyst" | "developer";

const rolesList: Array<{ id: RoleType; label: string; desc: string }> = [
  { id: "admin", label: "Admin", desc: "Full System Access" },
  { id: "founder", label: "Founder", desc: "Executive Dashboard" },
  { id: "finance", label: "Finance", desc: "Transactions & Books" },
  { id: "analyst", label: "Analyst", desc: "Projects & Strategy" },
  { id: "designer", label: "Designer", desc: "Creative & Tasks" },
  { id: "developer", label: "Developer", desc: "Engineering & Code" },
];

const roleThemes: Record<RoleType | "default", { gradient: string; tint: string; accent: string }> = {
  default: { gradient: "from-slate-800 via-slate-900 to-black", tint: "bg-slate-500/10 border-slate-500/30 text-slate-400", accent: "bg-slate-500" },
  admin: { gradient: "from-blue-600 via-indigo-700 to-purple-800", tint: "bg-blue-500/10 border-blue-500/30 text-blue-400", accent: "bg-blue-500" },
  founder: { gradient: "from-amber-600 via-orange-700 to-yellow-850", tint: "bg-amber-500/10 border-amber-500/30 text-amber-400", accent: "bg-amber-500" },
  finance: { gradient: "from-emerald-600 via-green-700 to-teal-800", tint: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", accent: "bg-emerald-500" },
  analyst: { gradient: "from-cyan-600 via-blue-700 to-indigo-800", tint: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400", accent: "bg-cyan-500" },
  designer: { gradient: "from-pink-600 via-rose-700 to-red-800", tint: "bg-pink-500/10 border-pink-500/30 text-pink-400", accent: "bg-pink-500" },
  developer: { gradient: "from-slate-600 via-gray-700 to-zinc-800", tint: "bg-slate-500/10 border-slate-500/30 text-slate-400", accent: "bg-slate-500" },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, setActiveRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [step, setStep] = useState<"login" | "role_select">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);
  
  // Forgot Password State
  const [resetState, setResetState] = useState<"none" | "waiting" | "approved">("none");
  const [newPassword, setNewPassword] = useState("");
  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPasswordSubmit = () => {
    if (!username) {
      toast.error("Please enter your username first.");
      return;
    }
    toast.info(`Sending password reset request to admin for ${username}...`);
    forgotPasswordMutation.mutate(username, {
      onSuccess: (data: any) => {
        toast.success(data.message || `Password reset request sent.`);
        setResetState("waiting");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to generate password reset request.");
      }
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resetState === "waiting") {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/auth/reset-status/${username}`);
          const status = res.data.status;
          if (status === "approved") {
            setResetState("approved");
            clearInterval(interval);
            toast.success("Admin approved your password reset! Please set a new password.");
          } else if (status === "denied") {
            setResetState("none");
            clearInterval(interval);
            toast.error("Admin denied your password reset request.");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [resetState, username]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/set-new-password', { email: username, newPassword });
      toast.success("Password updated! You can now sign in.");
      setResetState("none");
      setPassword(newPassword);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to set new password");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Authenticate with credentials only (no role required initially)
      const payload = await login({ username, password });
      
      const roles: RoleType[] = payload.roles || [];
      if (roles.length === 0) {
          toast.error("User has no assigned roles.");
          return;
      }
      
      if (roles.length === 1) {
        // Only one role, auto-redirect
        setActiveRole(roles[0]);
        if (payload.isFirstLogin) {
          toast.success(
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base">Welcome to Thenam Software Solutions!</h3>
              <p className="text-sm">We are thrilled to have you here. Let's build great things together! 🎉</p>
            </div>,
            { duration: 10000 }
          );
        } else {
          toast.success(`Logged in securely`);
        }
        navigate({ to: "/" });
      } else {
        // Multiple roles, move to step 2
        setAvailableRoles(roles);
        setStep("role_select");
      }
    } catch (dbErr: any) {
      console.error("Login Error:", dbErr);
      const msg = dbErr.response?.data?.message || dbErr.message;
      toast.error(msg === "user not exists" ? "User does not exist" : (msg === "incorrect password" ? "Incorrect password" : msg));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: RoleType) => {
      setActiveRole(role);
      toast.success(`Active workspace set to ${role.toUpperCase()}`);
      navigate({ to: "/" });
  };

  const currentTheme = step === "login" ? roleThemes.default : (roleThemes[availableRoles[0]] || roleThemes.default);

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground overflow-hidden font-sans relative">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-[20%] bottom-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className={`relative hidden lg:block overflow-hidden transition-all duration-700 bg-gradient-to-br ${currentTheme.gradient} text-white`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 bottom-0 h-[520px] w-[520px] rounded-full bg-black/20 blur-3xl" />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="Thenam Logo" className="h-11 w-11 object-contain shrink-0" />
            <div>
              <p className="font-bold text-lg tracking-wide">Thenam Software Solutions</p>
              <p className="text-xs opacity-75">Business Management ERP Platform</p>
            </div>
          </div>

          <div className="max-w-md my-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 bg-white/15 border border-white/25 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Core Command Center
            </span>
            <motion.h1 key={step} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] drop-shadow-md">
              Run every venture from one command center.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} className="mt-4 text-base text-white/90 font-medium">
              Multi-role secure JWT authentication, finance, people, projects, and live analytics.
            </motion.p>
            
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[ { icon: TrendingUp, label: "Revenue", value: "$2.4M" }, { icon: Users, label: "Team", value: "128" }, { icon: ShieldCheck, label: "Uptime", value: "99.9%" } ].map((s) => (
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

      <div className="flex items-center justify-center p-6 lg:p-12 z-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md p-8 rounded-3xl bg-card/50 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-20 transition-all duration-700 ${currentTheme.accent}`} />
          
          <div className="lg:hidden mb-8 flex items-center gap-3.5">
            <img src="/logo.png" alt="Thenam Logo" className="h-10 w-10 object-contain shrink-0" />
            <div>
              <p className="font-bold text-sm">Thenam Software Solutions</p>
              <p className="text-[11px] text-muted-foreground">Business Management ERP</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {resetState === "none" && step === "login" && (
              <motion.div key="loginForm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Sign in with your secure local credentials.</p>

                <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
                  <div>
                    <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground">Username, Email or Phone</Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <Input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 h-11 rounded-2xl bg-background/60 border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all" placeholder="Enter your credentials" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Password</Label>
                      <button type="button" onClick={handleForgotPasswordSubmit} className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium cursor-pointer">Forgot password?</button>
                    </div>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-11 rounded-2xl bg-background/60 border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <Checkbox id="remember" defaultChecked className="rounded-md border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">Remember me for 30 days</label>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold tracking-wide hover:from-indigo-600 hover:to-blue-700 transition shadow-lg shadow-indigo-500/10 gap-1.5 cursor-pointer">
                      {loading ? "Authenticating…" : `Sign in`}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {resetState === "none" && step === "role_select" && (
              <motion.div key="roleSelect" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Select Workspace</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">You have multiple assigned roles. Choose your active workspace for this session.</p>

                <div className="mt-8 grid grid-cols-1 gap-3">
                  {rolesList.filter(r => availableRoles.includes(r.id)).map((r) => (
                    <motion.button key={r.id} type="button" whileHover={{ scale: 1.02, translateY: -1 }} whileTap={{ scale: 0.98 }} onClick={() => handleRoleSelect(r.id)} className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 cursor-pointer relative border-slate-300 dark:border-slate-800 bg-background/40 hover:border-indigo-500 hover:shadow-lg`}>
                      <div className={`p-2 rounded-xl bg-indigo-500/10 text-indigo-500`}>
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 absolute right-4 text-muted-foreground opacity-50" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {resetState === "waiting" && (
              <motion.div key="waitingForm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center py-8">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Awaiting Approval</h2>
                <p className="text-sm text-muted-foreground">We have sent a notification to the administrator to approve your password reset for <strong>{username}</strong>.</p>
                <p className="text-xs text-muted-foreground mt-4">Please do not close this window. We are polling for approval...</p>
                <Button variant="ghost" onClick={() => setResetState("none")} className="mt-8 text-xs text-muted-foreground">Cancel</Button>
              </motion.div>
            )}

            {resetState === "approved" && (
              <motion.div key="approvedForm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Reset Approved</h2>
                <p className="text-sm text-muted-foreground mb-6">The administrator has approved your request. Please set a new password.</p>
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">New Password</Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input type={showPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10 h-11 rounded-2xl bg-background/60 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold cursor-pointer mt-4">
                    {loading ? "Saving..." : "Set Password & Sign In"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need workspace access? <Link to="/login" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline font-bold transition-all">Contact Administrator</Link>
          </p>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}
