"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getPresignedUrl, saveUploadToDb } from "@/app/actions/upload-actions";
import { toast } from "sonner";

export interface Upload {
  id: string;
  file_url: string;
  thumbnail_url: string | null;
  media_type: "image" | "video";
  guest_name: string | null;
  caption: string | null;
  created_at: string;
}

interface UploadDrawerProps {
  eventId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (upload: Upload) => void;
}

export function UploadDrawer({
  eventId,
  isOpen,
  onOpenChange,
  onUploadSuccess,
}: UploadDrawerProps) {
  const t = useTranslations("guestView.upload");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [guestName, setGuestName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error(t("invalidFileType"));
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast.error(t("fileTooLarge"));
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error(t("selectFile"));
      return;
    }

    setUploadProgress(0);

    startTransition(async () => {
      try {
        // Step 1: Get presigned URL
        const { uploadUrl, fileKey } = await getPresignedUrl(
          file.name,
          file.type,
          eventId
        );

        // Step 2: Upload file to R2 using XMLHttpRequest for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200 || xhr.status === 204) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setUploadProgress(100);

        // Step 3: Determine media type
        const mediaType = file.type.startsWith("image/") ? "image" : "video";

        // Step 4: Save upload metadata to database
        const uploadData = await saveUploadToDb({
          eventId,
          fileKey,
          mediaType,
          guestName: guestName || undefined,
          caption: caption || undefined,
        });

        toast.success(t("success"));

        // Step 5: Create upload object for callback
        const newUpload: Upload = {
          id: uploadData.id,
          file_url: uploadData.file_url,
          thumbnail_url: uploadData.thumbnail_url,
          media_type: mediaType,
          guest_name: guestName || null,
          caption: caption || null,
          created_at: new Date().toISOString(),
        };

        onUploadSuccess(newUpload);

        // Reset form
        setFile(null);
        setCaption("");
        setGuestName("");
        setUploadProgress(0);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("error")
        );
        console.error(error);
        setUploadProgress(0);
      }
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 p-4">
          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="file">{t("photoOrVideo")}</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={isPending}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                {t("selected")}: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Guest name */}
          <div className="space-y-2">
            <Label htmlFor="guestName">{t("yourName")}</Label>
            <Input
              id="guestName"
              placeholder={t("yourNamePlaceholder")}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">{t("message")}</Label>
            <Textarea
              id="caption"
              placeholder={t("messagePlaceholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>

          {/* Progress bar */}
          {isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("uploading")}</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={!file || isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? t("uploading") : t("uploadButton")}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isPending}>
              {t("cancel")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

