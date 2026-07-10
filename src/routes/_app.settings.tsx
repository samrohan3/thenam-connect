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

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Thenam ERP" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();

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
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage src="https://i.pravatar.cc/200?img=12" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="rounded-xl">Change photo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>First name</Label><Input defaultValue="Aarav" className="mt-1.5 rounded-xl" /></div>
                <div><Label>Last name</Label><Input defaultValue="Sharma" className="mt-1.5 rounded-xl" /></div>
                <div><Label>Email</Label><Input defaultValue="aarav@thenam.com" className="mt-1.5 rounded-xl" /></div>
                <div><Label>Phone</Label><Input defaultValue="+91 98765 43210" className="mt-1.5 rounded-xl" /></div>
                <div className="md:col-span-2"><Label>Role</Label><Input defaultValue="Admin · Founder" className="mt-1.5 rounded-xl" /></div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="ghost">Cancel</Button>
                  <Button className="rounded-xl gradient-royal text-white">Save changes</Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <SectionCard title="Security" description="Passwords, sessions and 2FA">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Current password</Label><Input type="password" className="mt-1.5 rounded-xl" /></div>
              <div><Label>New password</Label><Input type="password" className="mt-1.5 rounded-xl" /></div>
            </div>
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
              className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border p-5 text-left card-hover"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Company name</Label><Input defaultValue="Thenam Software Solutions" className="mt-1.5 rounded-xl" /></div>
              <div><Label>Domain</Label><Input defaultValue="thenam.com" className="mt-1.5 rounded-xl" /></div>
              <div><Label>Registration</Label><Input defaultValue="U72900KA2019PTC000000" className="mt-1.5 rounded-xl" /></div>
              <div><Label>Fiscal year</Label><Input defaultValue="Apr — Mar" className="mt-1.5 rounded-xl" /></div>
              <div className="md:col-span-2"><Label>Head office</Label><Input defaultValue="Bengaluru, India" className="mt-1.5 rounded-xl" /></div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="users">
          <SectionCard
            title="User management"
            description="Invite and manage workspace members"
            actions={<Button className="rounded-xl gradient-royal text-white">Invite user</Button>}
          >
            <ul className="divide-y divide-border">
              {[
                { name: "Aarav Sharma", role: "Owner",   email: "aarav@thenam.com" },
                { name: "Isha Patel",   role: "Admin",   email: "isha@thenam.com"  },
                { name: "Kabir Menon",  role: "Manager", email: "kabir@thenam.com" },
                { name: "Neha Reddy",   role: "Member",  email: "neha@thenam.com"  },
              ].map((u) => (
                <li key={u.email} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{u.role}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
