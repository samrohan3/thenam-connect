import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { useVentures, useCreateVenture } from "@/lib/api-hooks";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/ventures")({
  head: () => ({ meta: [{ title: "Ventures — Thenam ERP" }] }),
  component: VenturesPage,
});

function VenturesPage() {
  const { data: ventures, isLoading } = useVentures();
  const createVenture = useCreateVenture();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [gradient, setGradient] = useState("gradient-royal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key) return;
    
    createVenture.mutate({
      name,
      key,
      tagline,
      description,
      industry,
      gradient
    }, {
      onSuccess: () => {
        toast.success("Venture created successfully");
        setOpen(false);
        setName("");
        setKey("");
        setTagline("");
        setDescription("");
        setIndustry("");
        setGradient("gradient-royal");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to create venture");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ventures"
        subtitle="Every business under the Thenam umbrella."
        actions={
          <Button className="rounded-xl gradient-royal text-white cursor-pointer" onClick={() => setOpen(true)}>
            New venture
          </Button>
        }
      />

      <SectionCard title="Your ventures" description={`${ventures?.length || 0} ventures found`}>
        {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading ventures...</div>
        ) : !ventures || ventures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-royal text-white shadow-elevated">
                <Building2 className="h-9 w-9" />
              </div>
              <div>
                <p className="text-lg font-semibold">No ventures yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first venture to start tracking revenue, teams and projects.
                </p>
              </div>
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={() => setOpen(true)}>
                <ArrowRight className="h-4 w-4" /> Create venture
              </Button>
            </motion.div>
        ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ventures.map((venture: any) => (
                    <div key={venture._id} className="p-5 rounded-2xl bg-slate-900 border border-border">
                        <div className="flex justify-between items-start mb-4">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-slate-300">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${venture.status === 'active' ? 'bg-emerald/10 text-emerald' : 'bg-slate-800 text-slate-400'}`}>
                                {venture.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{venture.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{venture.description}</p>
                        
                        <div className="flex gap-4 text-sm mt-4 pt-4 border-t border-border/50">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium text-foreground capitalize">{venture.industry || 'General'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Venture</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new business or branch under the Thenam portfolio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vName">Venture Name</Label>
                <Input id="vName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PaperHeros" className="mt-1.5 rounded-xl border-border" required />
              </div>
              <div>
                <Label htmlFor="vKey">Venture Key</Label>
                <Input id="vKey" value={key} onChange={(e) => setKey(e.target.value.toLowerCase())} placeholder="e.g. paperheros" className="mt-1.5 rounded-xl border-border" required />
              </div>
            </div>
            <div>
              <Label htmlFor="vTagline">Tagline</Label>
              <Input id="vTagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Sustainable paper products" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="vIndustry">Industry</Label>
              <Input id="vIndustry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Manufacturing" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="vDesc">Description</Label>
              <Textarea id="vDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the venture's target market and operations..." className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="vGrad">Brand Accent</Label>
              <select
                id="vGrad"
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
              >
                <option value="gradient-royal">Royal Purple</option>
                <option value="gradient-emerald">Emerald Green</option>
                <option value="gradient-gold">Sunset Gold</option>
                <option value="gradient-brand">Tech Indigo</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createVenture.isPending} className="rounded-xl gradient-royal text-white hover:opacity-90">
                {createVenture.isPending ? "Creating..." : "Create Venture"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
