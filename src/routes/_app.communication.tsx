import { useState, useRef, useEffect, DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, Send, Bell, Hash, User as UserIcon, Plus, Megaphone, 
  Trash2, Pin, ShieldCheck, Search, Image, Video, FileText, Paperclip, 
  ExternalLink, X, Loader2, RefreshCw, Download, Globe, AlertCircle, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  useMarkNotificationRead,
  useChatMessages,
  useSendMessage,
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  // New API hooks
  useDirectUsers,
  useDirectConversation,
  useSendDirectMessage,
  useDirectMessages,
  useMarkMessageRead,
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
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { parseGoogleDriveLink, loadGoogleScripts } from "@/lib/google-drive";

export const Route = createFileRoute("/_app/communication")({
  head: () => ({ meta: [{ title: "Communication — Thenam ERP" }] }),
  component: CommunicationPage,
});

interface ActiveChat {
  type: "channel" | "dm";
  id: string; // 'general' or recipient user ID
  recipientUserId?: string;
  name: string;
  avatar?: string;
  designation?: string;
}

interface DraftAttachment {
  id: string;
  file?: File;
  name: string;
  type: string; // mime classification
  size: number;
  progress: number;
  status: "uploading" | "uploaded" | "failed";
  url?: string;
  storagePath?: string;
  provider: "firebase" | "google-drive";
  fileId?: string;
}

function CommunicationPage() {
  const { user } = useAuthStore();
  const currentUserId = (user as any)?._id || (user as any)?.id;

  const [draft, setDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment states
  const [draftAttachments, setDraftAttachments] = useState<DraftAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [gdModalOpen, setGdModalOpen] = useState(false);
  const [gdLinkInput, setGdLinkInput] = useState("");
  const [gdNameInput, setGdNameInput] = useState("");

  // Pending (local) messages state
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);

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
  const { data: directUsers, isLoading: isUsersLoading } = useDirectUsers();
  const { data: notifications, isLoading: isNotifsLoading } = useNotifications();
  const markNotifRead = useMarkNotificationRead();

  // Channel Message Queries (General)
  const { data: channelMessages, isLoading: isChannelMessagesLoading } = useChatMessages(
    activeChat.type === "channel" ? activeChat.id : undefined
  );
  const sendChannelMessage = useSendMessage();

  // Direct Message Queries
  const { data: directConversation } = useDirectConversation(
    activeChat.type === "dm" ? activeChat.recipientUserId : undefined
  );
  const { data: directMessages, isLoading: isDirectMessagesLoading } = useDirectMessages(
    activeChat.type === "dm" ? activeChat.recipientUserId : undefined
  );
  const sendDirectMessage = useSendDirectMessage(activeChat.recipientUserId || "");

  const { data: announcements, isLoading: isAnnouncementsLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const isMessagesLoading = activeChat.type === "channel" ? isChannelMessagesLoading : isDirectMessagesLoading;
  const dbMessages = activeChat.type === "channel" ? channelMessages : directMessages;

  // Clear pending messages matching loaded DB messages
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0 && pendingMessages.length > 0) {
      setPendingMessages((prev) =>
        prev.filter((pMsg) => !dbMessages.some((dbMsg: any) => dbMsg.text === pMsg.text && dbMsg.createdAt === pMsg.createdAt))
      );
    }
  }, [dbMessages, pendingMessages]);

  // Combine DB and Pending messages for rendering
  const messages = [
    ...(dbMessages || []),
    ...pendingMessages.filter(
      (pMsg) =>
        pMsg.recipientUserId === activeChat.recipientUserId ||
        (activeChat.type === "channel" && pMsg.channel === activeChat.id)
    ),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Scroll to bottom when messages load/update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Drag & Drop events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(Array.from(e.dataTransfer.files));
    }
  };

  // Perform Firebase Storage uploads
  const handleFilesUpload = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File "${file.name}" is larger than the 25MB upload limit.`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const localId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      let typeClassification = "file";
      if (file.type.startsWith("image/")) typeClassification = "image";
      else if (file.type.startsWith("video/")) typeClassification = "video";

      const newAtt: DraftAttachment = {
        id: localId,
        file,
        name: file.name,
        type: typeClassification,
        size: file.size,
        progress: 0,
        status: "uploading",
        provider: "firebase",
      };

      setDraftAttachments((prev) => [...prev, newAtt]);

      // Path: communication/direct/{conversationId}/{filename} OR communication/general/{filename}
      const conversationId = activeChat.type === "dm" ? directConversation?._id || "temp" : "general";
      const storagePath =
        activeChat.type === "dm"
          ? `communication/direct/${conversationId}/${Date.now()}-${file.name}`
          : `communication/general/${Date.now()}-${file.name}`;

      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setDraftAttachments((prev) =>
            prev.map((att) => (att.id === localId ? { ...att, progress } : att))
          );
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setDraftAttachments((prev) =>
            prev.map((att) => (att.id === localId ? { ...att, status: "failed" } : att))
          );
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setDraftAttachments((prev) =>
            prev.map((att) =>
              att.id === localId
                ? {
                    ...att,
                    status: "uploaded",
                    url: downloadURL,
                    storagePath,
                  }
                : att
            )
          );
        }
      );
    });
  };

  const removeDraftAttachment = (id: string) => {
    setDraftAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // Google Drive Manual Link Attachment Fallback
  const handleAddGoogleDriveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdLinkInput.trim()) return;

    const { fileId, parsedUrl } = parseGoogleDriveLink(gdLinkInput);
    if (!fileId) {
      toast.error("Invalid Google Drive Link format. Please paste a valid sharing link.");
      return;
    }

    const gdAttachment: DraftAttachment = {
      id: `gd-${Date.now()}`,
      name: gdNameInput.trim() || "Google Drive File",
      type: "file",
      size: 0,
      progress: 100,
      status: "uploaded",
      url: parsedUrl,
      provider: "google-drive",
      fileId,
    };

    setDraftAttachments((prev) => [...prev, gdAttachment]);
    setGdLinkInput("");
    setGdNameInput("");
    setGdModalOpen(false);
    toast.success("Google Drive file attached!");
  };

  // Triggers official Google Picker OAuth flow if env credentials exist
  const handleGooglePickerOpen = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const developerKey = import.meta.env.VITE_GOOGLE_DEVELOPER_KEY;

    if (!clientId || !developerKey) {
      toast.info("Google OAuth Picker credentials not configured. Please use the Manual Link tab instead.");
      return;
    }

    try {
      toast.loading("Connecting Google Drive...");
      await loadGoogleScripts();
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      if (!authInstance) {
        (window as any).gapi.load("auth2", {
          callback: () => {
            (window as any).gapi.auth2
              .init({
                client_id: clientId,
                scope: "https://www.googleapis.com/auth/drive.readonly",
              })
              .then(() => triggerPicker(developerKey));
          },
        });
      } else {
        triggerPicker(developerKey);
      }
    } catch (err: any) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to load Google SDK Picker: " + err.message);
    }
  };

  const triggerPicker = (developerKey: string) => {
    toast.dismiss();
    const token = (window as any).gapi.auth.getToken();
    if (token) {
      createPicker(token.access_token, developerKey);
    } else {
      const auth = (window as any).gapi.auth2.getAuthInstance();
      auth.signIn().then((userObj: any) => {
        const token = userObj.getAuthResponse().access_token;
        createPicker(token, developerKey);
      });
    }
  };

  const createPicker = (accessToken: string, developerKey: string) => {
    const view = new (window as any).google.picker.View((window as any).google.picker.ViewId.DOCS);
    const picker = new (window as any).google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(developerKey)
      .setCallback((data: any) => {
        if (data.action === (window as any).google.picker.Action.PICKED) {
          const doc = data.docs[0];
          const newGdAtt: DraftAttachment = {
            id: `gd-${Date.now()}`,
            name: doc.name,
            type: "file",
            size: doc.sizeBytes || 0,
            progress: 100,
            status: "uploaded",
            url: doc.url,
            provider: "google-drive",
            fileId: doc.id,
          };
          setDraftAttachments((prev) => [...prev, newGdAtt]);
          setGdModalOpen(false);
          toast.success(`Picked: ${doc.name}`);
        }
      })
      .build();
    picker.setVisible(true);
  };

  const handleSend = () => {
    const hasText = draft.trim();
    const hasAttachments = draftAttachments.length > 0;
    if (!hasText && !hasAttachments) return;

    // Check if any attachments are still uploading
    const stillUploading = draftAttachments.some((att) => att.status === "uploading");
    if (stillUploading) {
      toast.error("Wait for files to finish uploading before sending.");
      return;
    }

    const payloadAttachments = draftAttachments.map((att) => ({
      url: att.url || "",
      name: att.name,
      type: att.type,
      size: att.size,
      storageProvider: att.provider,
      storagePath: att.storagePath || "",
    }));

    // Determine message primary type
    let messageType: "text" | "image" | "video" | "file" = "text";
    if (payloadAttachments.length === 1) {
      const type = payloadAttachments[0].type;
      if (type === "image" || type === "video" || type === "file") {
        messageType = type;
      }
    } else if (payloadAttachments.length > 1) {
      messageType = "file";
    }

    const payload: any = {
      content: draft.trim(),
      text: draft.trim(),
      messageType,
      attachments: payloadAttachments,
    };

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      sender: {
        _id: currentUserId,
        id: currentUserId,
        name: user?.name || "Me",
        avatar: user?.avatar,
      },
      senderId: currentUserId,
      content: draft.trim(),
      text: draft.trim(),
      messageType,
      attachments: payloadAttachments,
      createdAt: new Date().toISOString(),
      status: "sending",
      recipientUserId: activeChat.recipientUserId,
      channel: activeChat.id,
    };

    // Append to local pending list
    setPendingMessages((prev) => [...prev, tempMsg]);

    const activeDraft = draft;
    const activeAtts = [...draftAttachments];

    setDraft("");
    setDraftAttachments([]);

    if (activeChat.type === "dm" && activeChat.recipientUserId) {
      sendDirectMessage.mutate(payload, {
        onError: (err: any) => {
          setDraft(activeDraft);
          setDraftAttachments(activeAtts);
          setPendingMessages((prev) =>
            prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
          );
          toast.error(err.response?.data?.message || "Failed to send direct message");
        },
      });
    } else {
      sendChannelMessage.mutate(
        {
          ...payload,
          channel: activeChat.id,
        },
        {
          onError: (err: any) => {
            setDraft(activeDraft);
            setDraftAttachments(activeAtts);
            setPendingMessages((prev) =>
              prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
            );
            toast.error(err.response?.data?.message || "Failed to send channel message");
          },
        }
      );
    }
  };

  const handleRetry = (failedMsg: any) => {
    // Remove from pending messages list
    setPendingMessages((prev) => prev.filter((m) => m._id !== failedMsg._id));

    // Reload into composer
    setDraft(failedMsg.content || failedMsg.text || "");
    const restoredAtts = failedMsg.attachments.map((att: any) => ({
      id: `restore-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: att.name,
      type: att.type,
      size: att.size,
      progress: 100,
      status: "uploaded" as const,
      url: att.url,
      provider: att.storageProvider,
      storagePath: att.storagePath,
    }));
    setDraftAttachments(restoredAtts);
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

  // Filtering user list by search bar
  const filteredUsers = (directUsers || [])
    .filter((u: any) => u._id !== currentUserId)
    .filter((u: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        (u.designation || u.role || "")?.toLowerCase().includes(term) ||
        u.employeeId?.toLowerCase().includes(term)
      );
    });

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            <div className="space-y-2">
              {/* Search Bar */}
              <div className="relative mb-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search people..."
                  className="pl-9 h-9 text-xs rounded-xl border-border bg-card/50"
                />
              </div>

              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {isUsersLoading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No team members found</p>
                ) : (
                  filteredUsers.map((emp: any) => {
                    const isSelected = activeChat.type === "dm" && activeChat.recipientUserId === emp._id;
                    const hasUnread = emp.unreadCount > 0;
                    
                    // Simple online indicator check based on whether they have a lastMessage preview (active user)
                    const isOnline = !!emp.lastMessageAt && (new Date().getTime() - new Date(emp.lastMessageAt).getTime() < 30 * 60 * 1000);

                    return (
                      <button
                        key={emp._id}
                        onClick={() =>
                          setActiveChat({
                            type: "dm",
                            id: emp._id,
                            recipientUserId: emp._id,
                            name: emp.name,
                            avatar: emp.avatar,
                            designation: emp.designation || emp.role,
                          })
                        }
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors border border-transparent ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold border-primary/10"
                            : "text-foreground hover:bg-card/80 hover:border-border"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={emp.avatar || ""} />
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                              {emp.name?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online Indicator */}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                          )}
                        </div>
                        <div className="text-left truncate flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-1">
                            <p className={`truncate ${hasUnread ? "font-bold text-foreground" : "font-medium"}`}>
                              {emp.name}
                            </p>
                            {emp.lastMessageAt && (
                              <span className="text-[9px] text-muted-foreground shrink-0 font-normal">
                                {new Date(emp.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <p className="text-[9px] text-muted-foreground truncate max-w-[75%]">
                              {emp.lastMessage || emp.designation || emp.role || "Team Member"}
                            </p>
                            {hasUnread && (
                              <Badge className="bg-primary text-primary-foreground text-[9px] h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full shrink-0 font-bold">
                                {emp.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Middle Column: Chat Window */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative"
        >
          <SectionCard
            title={
              activeChat.type === "channel" ? (
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span>#{activeChat.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeChat.avatar || ""} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {activeChat.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{activeChat.name}</p>
                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
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
            className={`flex flex-col h-[580px] relative transition-colors ${
              isDragOver ? "bg-primary/5 border-primary" : ""
            }`}
          >
            {/* Drag & Drop Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 z-50 pointer-events-none rounded-2xl border-2 border-dashed border-primary m-1">
                <Globe className="h-10 w-10 text-primary animate-bounce" />
                <p className="font-semibold text-sm">Drop your files here</p>
                <p className="text-xs text-muted-foreground">Send images, videos, or documents directly</p>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
              {isMessagesLoading ? (
                <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                  <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
                  <p className="text-xs text-muted-foreground opacity-70">
                    {activeChat.type === "channel"
                      ? "Start the conversation with everyone in #general"
                      : `Send a direct message to ${activeChat.name}.`}
                  </p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.sender?._id === currentUserId || msg.sender?.id === currentUserId || msg.senderId === currentUserId;
                  const isSending = msg.status === "sending";
                  const isFailed = msg.status === "failed";

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
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                          <span className="font-semibold text-foreground">{isMe ? "You" : msg.sender?.name || "Member"}</span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {isSending && <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />}
                          {isFailed && <Badge variant="destructive" className="text-[8px] h-4.5 px-1.5 flex items-center gap-1 select-none">
                            <AlertCircle className="h-2.5 w-2.5" /> Failed
                          </Badge>}
                        </div>

                        <div className="space-y-2">
                          {/* Text content bubble */}
                          {(msg.content || msg.text) && (
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                                  : "bg-card border border-border text-foreground rounded-tl-none shadow-sm"
                              }`}
                            >
                              {msg.content || msg.text}
                            </div>
                          )}

                          {/* Attachments rendering */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-1.5 mt-1">
                              {msg.attachments.map((att: any, idx: number) => {
                                const isImg = att.type === "image" || att.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                                const isVid = att.type === "video" || att.name.match(/\.(mp4|webm|mov)$/i);
                                const isGd = att.storageProvider === "google-drive";

                                if (isImg) {
                                  return (
                                    <div key={idx} className="relative group max-w-sm rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                                      <img src={att.url} alt={att.name} className="max-h-48 object-cover w-full" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                                          <Eye className="h-4 w-4" />
                                        </a>
                                        <a href={att.url} download={att.name} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </div>
                                    </div>
                                  );
                                }

                                if (isVid) {
                                  return (
                                    <div key={idx} className="max-w-md rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                                      <video controls src={att.url} className="w-full max-h-56 object-contain bg-black" />
                                    </div>
                                  );
                                }

                                // Document or Google Drive card
                                return (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs shadow-sm max-w-sm transition-all text-left ${
                                      isMe
                                        ? "bg-primary/5 hover:bg-primary/10 border-primary/20 text-foreground"
                                        : "bg-card hover:bg-card/80 border-border"
                                    }`}
                                  >
                                    <div className={`p-2 rounded-lg ${isGd ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"}`}>
                                      {isGd ? <Globe className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                    </div>
                                    <div className="truncate flex-1 min-w-0">
                                      <p className="font-semibold truncate">{att.name}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {isGd ? "Google Drive Document" : formatBytes(att.size)}
                                      </p>
                                    </div>
                                    {isGd ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Retry action for failed messages */}
                        {isFailed && (
                          <button
                            onClick={() => handleRetry(msg)}
                            className="flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold mt-1"
                          >
                            <RefreshCw className="h-3 w-3" /> Retry Message
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Previews of draft attachments */}
            {draftAttachments.length > 0 && (
              <div className="p-2 border-t border-border bg-card/60 backdrop-blur-sm rounded-xl mb-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {draftAttachments.map((att) => {
                  const isUploading = att.status === "uploading";
                  const isFailed = att.status === "failed";
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-border bg-card text-[11px] shadow-sm relative group max-w-[200px]"
                    >
                      <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
                        {att.provider === "google-drive" ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : att.type === "image" ? (
                          <Image className="h-3.5 w-3.5" />
                        ) : att.type === "video" ? (
                          <Video className="h-3.5 w-3.5" />
                        ) : (
                          <Paperclip className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="truncate flex-1 min-w-0 pr-2">
                        <p className="font-medium truncate">{att.name}</p>
                        {isUploading ? (
                          <div className="w-full bg-secondary h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${att.progress}%` }}
                            />
                          </div>
                        ) : isFailed ? (
                          <span className="text-[9px] text-destructive font-semibold">Upload failed</span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">Ready</span>
                        )}
                      </div>

                      <button
                        onClick={() => removeDraftAttachment(att.id)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-muted hover:bg-destructive rounded-full border border-border text-foreground hover:text-white flex items-center justify-center transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input Area */}
            <div className="pt-3 border-t border-border flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesUpload(Array.from(e.target.files));
                  }
                }}
              />

              {/* Attachment Plus Options Button */}
              <div className="flex shrink-0">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl h-11 w-11 border-border text-muted-foreground hover:text-foreground shrink-0 relative group"
                >
                  <Plus className="h-5 w-5" />
                  <div className="absolute bottom-12 left-0 hidden group-hover:flex flex-col bg-card border border-border rounded-xl shadow-lg p-1.5 w-44 z-50 text-left space-y-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-primary/10 rounded-lg text-xs font-semibold text-foreground text-left w-full"
                    >
                      <Paperclip className="h-4 w-4 text-primary" /> Upload from Computer
                    </button>
                    <button
                      onClick={() => setGdModalOpen(true)}
                      className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-primary/10 rounded-lg text-xs font-semibold text-foreground text-left w-full"
                    >
                      <Globe className="h-4 w-4 text-emerald-500" /> Google Drive Link
                    </button>
                  </div>
                </Button>
              </div>

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
                className="rounded-xl h-11 border-border focus-visible:ring-primary flex-1 min-w-0"
              />
              <Button
                onClick={handleSend}
                disabled={!draft.trim() && draftAttachments.length === 0}
                className="rounded-xl gradient-royal text-white gap-1.5 px-4 h-11 shrink-0"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </Button>
            </div>
          </SectionCard>
        </div>

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
                        onClick={() => markNotifRead.mutate(n._id)}
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

      {/* Dialog for Google Drive File Attachments (Includes OAuth Picker trigger + URL input fallback) */}
      <Dialog open={gdModalOpen} onOpenChange={setGdModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span>Attach Google Drive File</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 bg-secondary/30 rounded-xl space-y-2">
              <p className="text-xs text-muted-foreground leading-normal">
                Attach documents from Google Drive. If OAuth picker credentials are set, you can connect directly. Otherwise, paste a shared folder or document link below.
              </p>
              
              <Button
                type="button"
                onClick={handleGooglePickerOpen}
                variant="outline"
                className="w-full text-xs gap-2 rounded-xl mt-1 h-9 border-border"
              >
                <Globe className="h-4 w-4 text-emerald-500" /> Connect Google Account & Pick File
              </Button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or paste link manually</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <form onSubmit={handleAddGoogleDriveLink} className="space-y-4">
              <div>
                <label htmlFor="gdLink" className="text-xs font-semibold text-foreground">
                  Google Drive Sharing URL
                </label>
                <Input
                  id="gdLink"
                  value={gdLinkInput}
                  onChange={(e) => setGdLinkInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="mt-1 rounded-xl text-xs h-10 border-border"
                  required
                />
              </div>

              <div>
                <label htmlFor="gdName" className="text-xs font-semibold text-foreground">
                  File Name / Description (Optional)
                </label>
                <Input
                  id="gdName"
                  value={gdNameInput}
                  onChange={(e) => setGdNameInput(e.target.value)}
                  placeholder="e.g. Sales Presentation Q3.pdf"
                  className="mt-1 rounded-xl text-xs h-10 border-border"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl text-xs"
                  onClick={() => setGdModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl gradient-royal text-white text-xs gap-1.5 px-4 h-10"
                >
                  <Plus className="h-4 w-4" /> Attach File
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Posting Announcements */}
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
                className="mt-1 rounded-xl h-10 border-border"
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
                className="mt-1 rounded-xl text-xs border-border"
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
                className="rounded-xl gradient-royal text-white text-xs gap-1 px-4 h-10"
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
