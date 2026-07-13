import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Paperclip, Send, Bell } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/communication")({
  head: () => ({ meta: [{ title: "Communication — Thenam ERP" }] }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const [draft, setDraft] = useState("");

  const send = () => { setDraft(""); };

  return (
    <PageContainer>
      <PageHeader
        title="Communication"
        subtitle="Chat, announcements and team updates in one place."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
        <SectionCard title="Channels">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center gap-3"
          >
            <MessageSquare className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No channels yet</p>
          </motion.div>
        </SectionCard>

        <SectionCard title="Messages" description="Select a channel to start chatting" className="flex flex-col">
          <div className="flex-1 flex items-center justify-center py-16 text-center text-muted-foreground text-sm">
            <p>No messages yet</p>
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a message…"
              className="rounded-xl h-11"
            />
            <Button onClick={send} className="rounded-xl gradient-royal text-white gap-1.5">
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Announcements" description="Latest from leadership">
            <p className="text-sm text-muted-foreground py-8 text-center">No announcements yet</p>
          </SectionCard>

          <SectionCard title="Notifications">
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
              <Bell className="h-4 w-4" />
              <span>No notifications</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
