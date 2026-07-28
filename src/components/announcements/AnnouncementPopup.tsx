import { useState, useEffect } from "react";
import { useAnnouncements } from "@/lib/api-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin, Calendar, UserCheck } from "lucide-react";

export function AnnouncementPopup() {
  const { data: announcements, isLoading } = useAnnouncements();
  const [open, setOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<any>(null);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const latest = announcements[0]; // Sorted by pinned & date
      const todayStr = new Date().toISOString().split("T")[0];
      const seenKey = `announcement_seen_${todayStr}_${latest._id}`;

      const alreadySeen = localStorage.getItem(seenKey);
      if (!alreadySeen) {
        setActiveAnnouncement(latest);
        setOpen(true);
      }
    }
  }, [announcements]);

  const handleDismiss = () => {
    if (activeAnnouncement) {
      const todayStr = new Date().toISOString().split("T")[0];
      const seenKey = `announcement_seen_${todayStr}_${activeAnnouncement._id}`;
      localStorage.setItem(seenKey, "true");
    }
    setOpen(false);
  };

  if (!activeAnnouncement) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDismiss()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Megaphone className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold border-amber-500/30 text-amber-500">
                Leadership Broadcast
              </Badge>
            </div>
            {activeAnnouncement.pinned && (
              <Badge className="bg-amber-500/20 text-amber-400 text-[10px] gap-1 border-0">
                <Pin className="h-3 w-3 fill-amber-400" /> Pinned
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg font-bold text-foreground leading-snug pt-1">
            {activeAnnouncement.title}
          </DialogTitle>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              {activeAnnouncement.author?.name || "Leadership"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(activeAnnouncement.createdAt).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </DialogHeader>

        <div className="py-4 border-y border-border/60 my-2">
          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto pr-1">
            {activeAnnouncement.content}
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={handleDismiss}
            className="w-full sm:w-auto rounded-xl gradient-royal text-white px-6 h-10 text-xs font-semibold"
          >
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
