import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useVentures } from "@/lib/api-hooks";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/ventures")({
  head: () => ({ meta: [{ title: "Ventures — Thenam ERP" }] }),
  component: VenturesPage,
});

function VenturesPage() {
  const { data: ventures, isLoading } = useVentures();

  return (
    <PageContainer>
      <PageHeader title="Ventures" subtitle="Manage company ventures and business units." />
      <SectionCard title="All Ventures" icon={<Building2 className="h-5 w-5" />}>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading ventures...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ventures?.map((v: any) => (
              <div key={v._id || v.id} className="p-4 border rounded-xl bg-card">
                <h3 className="font-semibold text-lg">{v.name}</h3>
                {v.description && <p className="text-sm text-muted-foreground mt-1">{v.description}</p>}
              </div>
            )) || <p className="text-sm text-muted-foreground">No ventures found.</p>}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
