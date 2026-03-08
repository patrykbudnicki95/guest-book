"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
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
import { deleteUpload } from "@/app/actions/upload-actions";
import { toast } from "sonner";
import { MoreVertical, Trash2, Download } from "lucide-react";
import type { DashboardUpload } from "@/app/actions/dashboard-actions";

interface GalleryTabProps {
  uploads: DashboardUpload[];
}

export function GalleryTab({ uploads: initialUploads }: GalleryTabProps) {
  const t = useTranslations("dashboard.gallery");
  const tCommon = useTranslations("common");
  const [uploads, setUploads] = useState(initialUploads);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(uploads.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectUpload = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (uploadId: string) => {
    startTransition(async () => {
      try {
        await deleteUpload(uploadId);
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(uploadId);
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
        await Promise.all(ids.map((id) => deleteUpload(id)));
        setUploads((prev) => prev.filter((u) => !selectedIds.has(u.id)));
        setSelectedIds(new Set());
        toast.success(t("deleteSuccess"));
      } catch (error) {
        toast.error(t("bulkDeleteError"));
        console.error(error);
      }
    });
  };

  const handleDownload = (uploadId: string) => {
    const upload = uploads.find((u) => u.id === uploadId);
    if (upload) {
      // Open file in new tab for download
      window.open(upload.file_url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            {t("deleteSelected")} ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === uploads.length && uploads.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("noUploads")}
                </TableCell>
              </TableRow>
            ) : (
              uploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(upload.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUpload(upload.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative size-16 overflow-hidden rounded-md">
                      {upload.thumbnail_url ? (
                        <Image
                          src={upload.thumbnail_url}
                          alt={upload.caption || "Upload"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                          {upload.media_type === "video" ? tCommon("video") : tCommon("image")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {upload.event_names || tCommon("unknownEvent")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {upload.guest_name || tCommon("anonymous")}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {upload.caption || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(upload.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(upload.id)}>
                          <Download className="mr-2 size-4" />
                          {tCommon("download")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(upload.id)}
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
    </div>
  );
}

