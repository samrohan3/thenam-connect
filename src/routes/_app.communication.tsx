import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bell, Hash, User as UserIcon, Plus, Megaphone, Trash2, Pin, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  useMarkNotificationRead,
  useEmployees,
  useChatMessages,
  useSendMessage,
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/lib/api-hooks";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/communication")({
  head: () => ({ meta: [{ title: "Communication — Thenam ERP" }] }),
  component: CommunicationPage,
});

interface ActiveChat {
  type: "channel" | "dm";
  id: string; // channel name or recipient userId/empId
  recipientUserId?: string;
  name: string;
  avatar?: string;
  designation?: string;
}

function CommunicationPage() {
  const { user } = useAuthStore();
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Announcement modal state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPinned, setAnnPinned] = useState(false);

  // Role permissions check for Announcements
  const userRole = (user?.role || "").toLowerCase();
  const canPostAnnouncement = ["admin", "founder", "manager", "super admin"].includes(userRole);

  // Active chat state (default to #general channel)
  const [activeChat, setActiveChat] = useState<ActiveChat>({
    type: "channel",
    id: "general",
    name: "general",
  });

  // Queries & Mutations
  const { data: employees } = useEmployees();
  const { data: notifications, isLoading: isNotifsLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const { data: messages, isLoading: isMessagesLoading } = useChatMessages(
    activeChat.type === "channel" ? activeChat.id : undefined,
    activeChat.type === "dm" ? activeChat.recipientUserId : undefined
  );
  const sendMessage = useSendMessage();

  const { data: announcements, isLoading: isAnnouncementsLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  // Scroll to bottom when messages load/update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim()) return;

    const payload: { content: string; channel?: string; recipientId?: string } = {
      content: draft.trim(),
    };

    if (activeChat.type === "dm" && activeChat.recipientUserId) {
      payload.recipientId = activeChat.recipientUserId;
    } else {
      payload.channel = activeChat.id;
    }

    const currentDraft = draft;
    setDraft("");

    sendMessage.mutate(payload, {
      onError: (err: any) => {
        setDraft(currentDraft);
        toast.error(err.response?.data?.message || "Failed to send message");
      },
    });
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    createAnnouncement.mutate(
      { title: annTitle, content: annContent, pinned: annPinned },
      {
        onSuccess: () => {
          toast.success("Announcement published successfully!");
          setAnnouncementModalOpen(false);
          setAnnTitle("");
          setAnnContent("");
          setAnnPinned(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to post announcement");
        },
      }
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement.mutate(id, {
      onSuccess: () => toast.success("Announcement deleted"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Communication & Workspace Chat"
        subtitle="Group channels, 1-on-1 team messaging, and leadership announcements."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-4 items-start">
        {/* Left Column: Channels & Direct Messages */}
        <div className="space-y-4">
          <SectionCard title="Channels" description="Group conversations">
            <div className="space-y-1">
              <button
                onClick={() =>
                  setActiveChat({
                    type: "channel",
                    id: "general",
                    name: "general",
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeChat.type === "channel" && activeChat.id === "general"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>everyone (general)</span>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                  All
                </Badge>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Direct Messages" description="Chat 1-on-1 with team members">
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {!employees || employees.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No team members found</p>
              ) : (
                employees
                  .filter((emp: any) => emp.email !== user?.email)
                  .map((emp: any) => {
                    const empUserId = emp.user || emp._id;
                    const isSelected = activeChat.type === "dm" && activeChat.recipientUserId === empUserId;
                    return (
                      <button
                        key={emp._id}
                        onClick={() =>
                          setActiveChat({
                            type: "dm",
                            id: emp._id,
                            recipientUserId: empUserId,
                            name: emp.name,
                            avatar: emp.avatar,
                            designation: emp.designation || emp.department,
                          })
                        }
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-card/80"
                        }`}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={emp.avatar || ""} />
                          <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                            {emp.name?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left truncate flex-1">
                          <p className="font-medium truncate">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {emp.designation || emp.role || "Team Member"}
                          </p>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </SectionCard>
        </div>

        {/* Middle Column: Chat Window */}
        <SectionCard
          title={
            activeChat.type === "channel" ? (
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                <span>#{activeChat.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={activeChat.avatar || ""} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {activeChat.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{activeChat.name}</p>
                  <p className="text-[11px] text-muted-foreground font-normal">
                    {activeChat.designation || "Direct Message"}
                  </p>
                </div>
              </div>
            )
          }
          description={
            activeChat.type === "channel"
              ? "General channel for all organization members"
              : "Private direct message"
          }
          className="flex flex-col h-[580px]"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
            {isMessagesLoading ? (
              <div className="py-16 text-center text-xs text-muted-foreground">Loading chat messages...</div>
            ) : !messages || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
                <p className="text-xs text-muted-foreground opacity-70">
                  {activeChat.type === "channel"
                    ? "Start the conversation with everyone in #general"
                    : `Send a direct message to ${activeChat.name}`}
                </p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const currentUserId = user?._id || user?.id;
                const isMe = msg.sender?._id === currentUserId || msg.sender?.id === currentUserId;

                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                      <AvatarImage src={msg.sender?.avatar || ""} />
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                        {msg.sender?.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                        <span className="font-semibold text-foreground">{isMe ? "You" : msg.sender?.name || "Member"}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                            : "bg-card border border-border text-foreground rounded-tl-none shadow-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                activeChat.type === "channel"
                  ? "Message #everyone (general)..."
                  : `Message ${activeChat.name}...`
              }
              className="rounded-xl h-11 border-border focus-visible:ring-primary"
            />
            <Button
              onClick={handleSend}
              disabled={!draft.trim() || sendMessage.isPending}
              className="rounded-xl gradient-royal text-white gap-1.5 px-4 h-11 shrink-0"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </div>
        </SectionCard>

        {/* Right Column: Announcements & Notifications */}
        <div className="space-y-4">
          <SectionCard
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-500" />
                  <span>Announcements</span>
                </div>
                {canPostAnnouncement && (
                  <Button
                    size="sm"
                    onClick={() => setAnnouncementModalOpen(true)}
                    className="h-7 text-xs rounded-lg gradient-royal text-white gap-1 px-2.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post
                  </Button>
                )}
              </div>
            }
            description="Updates from leadership"
          >
            {isAnnouncementsLoading ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Loading announcements...</p>
            ) : !announcements || announcements.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <Megaphone className="h-8 w-8 text-muted-foreground opacity-30 mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">No announcements yet</p>
                {canPostAnnouncement && (
                  <p className="text-[11px] text-muted-foreground opacity-70">
                    Click "+ Post" above to broadcast an update to the team.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {announcements.map((ann: any) => (
                  <div
                    key={ann._id}
                    className="p-3 rounded-xl bg-card border border-border space-y-2 relative group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {ann.pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                          <h4 className="text-xs font-semibold text-foreground leading-snug">{ann.title}</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          By {ann.author?.name || "Leadership"} •{" "}
                          {new Date(ann.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {canPostAnnouncement && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Notifications" description="Recent alerts">
            {isNotifsLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading notifications...</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-xs">
                <Bell className="h-4 w-4" />
                <span>No new notifications</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {notifications.map((n: any) => (
                  <div
                    key={n._id}
                    className="p-2.5 rounded-xl bg-card border border-border text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-[11px]">{n.title}</p>
                      <p className="text-muted-foreground text-[10px] leading-tight">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] text-primary h-6 px-2 shrink-0"
                        onClick={() => markRead.mutate(n._id)}
                      >
                        Read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Dialog for Posting Announcements (Restricted to Admin, Founder, Manager) */}
      <Dialog open={announcementModalOpen} onOpenChange={setAnnouncementModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Broadcast Announcement</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-2">
            <div>
              <label htmlFor="annTitle" className="text-xs font-semibold text-foreground">
                Title
              </label>
              <Input
                id="annTitle"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Q3 Company Meeting & Product Roadmap Update"
                className="mt-1 rounded-xl"
                required
              />
            </div>

            <div>
              <label htmlFor="annContent" className="text-xs font-semibold text-foreground">
                Announcement Message
              </label>
              <Textarea
                id="annContent"
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Write the announcement details to be broadcasted to all team members..."
                rows={4}
                className="mt-1 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="annPinned"
                checked={annPinned}
                onChange={(e) => setAnnPinned(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="annPinned" className="text-xs text-muted-foreground select-none cursor-pointer">
                Pin to top of Announcements
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl text-xs"
                onClick={() => setAnnouncementModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAnnouncement.isPending}
                className="rounded-xl gradient-royal text-white text-xs gap-1 px-4"
              >
                <Megaphone className="h-3.5 w-3.5" /> Publish Announcement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
