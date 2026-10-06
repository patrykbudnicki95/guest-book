"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MediaImage } from "@/components/media-image";
import { EntryViewer } from "@/components/entry-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteEntry } from "@/app/actions/upload-actions";
import { toast } from "sonner";
import { MoreVertical, Trash2, Eye, Lock, MessageSquare } from "lucide-react";
import type { DashboardEntry } from "@/app/actions/dashboard-actions";
import type { EntryMedia } from "@/lib/schemas/database";

interface GalleryTabProps {
  entries: DashboardEntry[];
  /**
   * Whether each event is still inside its plan's download window. Files sit on
   * a public R2 domain, so this only hides the button — a private bucket with
   * signed GETs is what would make the deadline real.
   */
  downloadOpenByEvent: Record<string, boolean>;
  onDelete?: (entryId: string) => Promise<{ success: boolean }>;
}

export function GalleryTab({
  entries: initialEntries,
  downloadOpenByEvent,
  onDelete,
}: GalleryTabProps) {
  const t = useTranslations("dashboard.gallery");
  const tCommon = useTranslations("common");
  const [entries, setEntries] = useState(initialEntries);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openEntry, setOpenEntry] = useState<DashboardEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const removeEntry = async (entryId: string) => {
    if (onDelete) {
      await onDelete(entryId);
      return;
    }

    await deleteEntry(entryId);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectEntry = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (entryId: string) => {
    startTransition(async () => {
      try {
        await removeEntry(entryId);
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(entryId);
          return newSet;
        });
        toast.success(t("deleteSuccess"));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("deleteError")
        );
        console.error(error);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    startTransition(async () => {
      const ids = Array.from(selectedIds);
      try {
        await Promise.all(ids.map((id) => removeEntry(id)));
        setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
        setSelectedIds(new Set());
        toast.success(t("deleteSuccess"));
      } catch (error) {
        toast.error(t("bulkDeleteError"));
        console.error(error);
      }
    });
  };

  const handleDownload = (media: EntryMedia) => {
    window.open(media.file_url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isPending}
            className="rounded-full"
          >
            {t("deleteSelected")} ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border-0 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === entries.length && entries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{t("columns.preview")}</TableHead>
              <TableHead>{t("columns.event")}</TableHead>
              <TableHead>{t("columns.guest")}</TableHead>
              <TableHead>{t("columns.message")}</TableHead>
              <TableHead>{t("columns.files")}</TableHead>
              <TableHead>{t("columns.date")}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {t("noUploads")}
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(entry.id)}
                      onCheckedChange={(checked) =>
                        handleSelectEntry(entry.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setOpenEntry(entry)}
                      className="flex items-center"
                      aria-label={t("open")}
                    >
                      {entry.uploads.length === 0 ? (
                        <div
                          className="flex size-16 items-center justify-center rounded-lg bg-primary/10"
                          title={t("textOnly")}
                        >
                          <MessageSquare className="size-5 text-primary" />
                        </div>
                      ) : (
                        <>
                          {entry.uploads.slice(0, 3).map((media, index) => (
                            <div
                              key={media.id}
                              className="relative size-16 overflow-hidden rounded-lg border-2 border-white not-first:-ml-10"
                              style={{ zIndex: 3 - index }}
                            >
                              {media.thumbnail_url ? (
                                <MediaImage
                                  src={media.thumbnail_url}
                                  alt={entry.message || "Upload"}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                  {media.media_type === "video" ? tCommon("video") : tCommon("image")}
                                </div>
                              )}
                            </div>
                          ))}
                          {entry.uploads.length > 3 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              +{entry.uploads.length - 3}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.event_names || tCommon("unknownEvent")}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col items-start gap-1">
                      {entry.guest_name || tCommon("anonymous")}
                      {entry.is_private && (
                        <Badge variant="secondary">
                          <Lock />
                          {t("private")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.message || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.uploads.length}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOpenEntry(entry)}>
                          <Eye className="mr-2 size-4" />
                          {t("open")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          {tCommon("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EntryViewer
        entry={openEntry}
        onOpenChange={(open) => !open && setOpenEntry(null)}
        onDownload={
          openEntry && downloadOpenByEvent[openEntry.event_id] !== false
            ? handleDownload
            : undefined
        }
      />
    </div>
  );
}

