import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ShieldCheck, Key, Shield, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin-security")({
  component: AdminSecurityPage,
});

function AdminSecurityPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users-security"],
    queryFn: async () => {
      const res = await api.get("/auth/users");
      return res.data.data;
    },
  });

  const approveReset = useMutation({
    mutationFn: async ({ email, approved }: { email: string; approved: boolean }) => {
      await api.post("/auth/approve-reset", { email, approved });
    },
    onSuccess: () => {
      toast.success("Reset request processed.");
      queryClient.invalidateQueries({ queryKey: ["all-users-security"] });
    },
    onError: () => toast.error("Failed to process reset request"),
  });

  if (isLoading) return <div className="p-8">Loading security dashboard...</div>;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Security & User Management</h1>
          <p className="text-sm text-muted-foreground">Special Admin Access to view credentials and manage resets.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {users?.map((user: any) => (
          <div key={user._id} className="p-5 rounded-2xl border bg-card/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {(user.roles || []).map((r: string) => (
                  <span key={r} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="space-y-1 text-right">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-end gap-1">
                  <Key className="w-3 h-3" /> Password
                </p>
                <p className="text-sm font-mono bg-black/20 px-2 py-1 rounded border border-border/50 text-emerald-400">
                  {user.plainPassword || "********"}
                </p>
              </div>

              {user.resetPasswordStatus === "pending" && (
                <div className="flex items-center gap-2 border-l border-border pl-6">
                  <p className="text-xs font-bold text-amber-500 mr-2">Reset Requested!</p>
                  <Button size="sm" variant="default" onClick={() => approveReset.mutate({ email: user.email, approved: true })} className="bg-emerald-500 hover:bg-emerald-600 h-8">
                    <UserCheck className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => approveReset.mutate({ email: user.email, approved: false })} className="h-8">
                    <UserX className="w-4 h-4 mr-1" /> Deny
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
