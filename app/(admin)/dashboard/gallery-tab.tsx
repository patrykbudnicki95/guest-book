"use client";

import { useState, useTransition } from "react";
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
        toast.success("Upload deleted successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete upload"
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
        toast.success(`Deleted ${ids.length} upload(s)`);
      } catch (error) {
        toast.error("An error occurred during bulk delete");
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
          <h2 className="text-2xl font-semibold">Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Manage and moderate guest uploads
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            Delete Selected ({selectedIds.size})
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
                  No uploads yet
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
                          {upload.media_type === "video" ? "Video" : "Image"}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {upload.event_names || "Unknown Event"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {upload.guest_name || "Anonymous"}
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
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(upload.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
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

