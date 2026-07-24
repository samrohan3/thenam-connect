import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSettings, useUpdateSettings, useUsers, useUpdateProfile, useChangePassword } from "@/lib/api-hooks";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Thenam ERP" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { user, checkAuth } = useAuthStore();
  
  // Queries & Mutations
  const { data: settings } = useSettings();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone
    }, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        checkAuth();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    });
  };

  // Password Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    changePassword.mutate({
      currentPassword,
      newPassword
    }, {
      onSuccess: () => {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to update password");
      }
    });
  };

  // Company Settings Form States
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [companyReg, setCompanyReg] = useState("");
  const [companyFiscal, setCompanyFiscal] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  useEffect(() => {
    if (settings?.company) {
      setCompanyName(settings.company.name || "");
      setCompanyDomain(settings.company.domain || "");
      setCompanyReg(settings.company.registration || "");
      setCompanyFiscal(settings.company.fiscalYear || "");
      setCompanyAddress(settings.company.address || "");
    }
  }, [settings]);

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      company: {
        name: companyName,
        domain: companyDomain,
        registration: companyReg,
        fiscalYear: companyFiscal,
        address: companyAddress
      }
    }, {
      onSuccess: () => {
        toast.success("Company settings updated successfully!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to update settings");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Manage your profile, security, workspace and preferences." />

      <Tabs defaultValue="profile">
        <TabsList className="rounded-xl mb-4 flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SectionCard title="Your profile" description="How teammates see you">
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                  <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground capitalize font-semibold tracking-wide border border-border/60 px-2 py-0.5 rounded-full bg-card">{user?.role}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div><Label htmlFor="sFirstName">First name</Label><Input id="sFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5 rounded-xl border-border" required /></div>
                <div><Label htmlFor="sLastName">Last name</Label><Input id="sLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
                <div><Label htmlFor="sEmail">Email</Label><Input id="sEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 rounded-xl border-border" required /></div>
                <div><Label htmlFor="sPhone">Phone</Label><Input id="sPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="submit" disabled={updateProfile.isPending} className="rounded-xl gradient-royal text-white cursor-pointer">
                    {updateProfile.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <SectionCard title="Security" description="Passwords, sessions and 2FA">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="sCurrPass">Current password</Label><Input id="sCurrPass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1.5 rounded-xl border-border" required /></div>
                <div><Label htmlFor="sNewPass">New password</Label><Input id="sNewPass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5 rounded-xl border-border" required /></div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={changePassword.isPending} className="rounded-xl gradient-royal text-white cursor-pointer">
                  {changePassword.isPending ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </form>
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-semibold">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Extra security using an authenticator app</p>
              </div>
              <Switch defaultChecked />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="theme">
          <SectionCard title="Appearance" description="Choose how Thenam looks to you">
            <button
              onClick={toggle}
              className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border p-5 text-left card-hover cursor-pointer"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
                <p className="text-xs text-muted-foreground">Tap to switch — respects system preference by default</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} />
            </button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionCard title="Notifications" description="Choose what you want to hear about">
            <div className="space-y-3">
              {[
                "Weekly executive summary",
                "New tasks assigned to me",
                "Payments over $10,000",
                "Team mentions",
                "System maintenance",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <p className="text-sm font-medium">{n}</p>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="company">
          <SectionCard title="Company details" description="Legal and workspace information">
            <form onSubmit={handleCompanySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="cName">Company name</Label><Input id="cName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1.5 rounded-xl border-border" required /></div>
              <div><Label htmlFor="cDom">Domain</Label><Input id="cDom" value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
              <div><Label htmlFor="cReg">Registration</Label><Input id="cReg" value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
              <div><Label htmlFor="cFis">Fiscal year</Label><Input id="cFis" value={companyFiscal} onChange={(e) => setCompanyFiscal(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
              <div className="md:col-span-2"><Label htmlFor="cAddr">Head office address</Label><Input id="cAddr" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="mt-1.5 rounded-xl border-border" /></div>
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button type="submit" disabled={updateSettings.isPending} className="rounded-xl gradient-royal text-white cursor-pointer">
                  {updateSettings.isPending ? "Saving..." : "Save company details"}
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="users">
          <SectionCard
            title="User management"
            description="Invite and manage workspace members"
          >
            <ul className="divide-y divide-border">
              {isUsersLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading workspace users...</div>
              ) : !users || users.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No users found.</div>
              ) : (
                users.map((u: any) => (
                  <li key={u._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">{u.role}</span>
                  </li>
                ))
              )}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
      <Toaster />
    </PageContainer>
  );
}
