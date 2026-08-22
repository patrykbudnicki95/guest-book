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
import {
  getPresignedUrl,
  saveUploadToDb,
  type UploadFailureReason,
} from "@/app/actions/upload-actions";
import { formatBytes, getLimits, hasFeature } from "@/lib/permissions";
import type { PlanId } from "@/lib/pricing";
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

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export type LocalUploadInput = {
  file: File;
  guestName?: string;
  caption?: string;
};

export type LocalUploadResult =
  | { ok: true; upload: Upload }
  | { ok: false; reason: UploadFailureReason };

interface UploadDrawerProps {
  eventId: string;
  plan: PlanId;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (upload: Upload) => void;
  onUpload?: (input: LocalUploadInput) => Promise<LocalUploadResult>;
  maxFileBytes?: number;
}

export function UploadDrawer({
  eventId,
  plan,
  isOpen,
  onOpenChange,
  onUploadSuccess,
  onUpload,
  maxFileBytes,
}: UploadDrawerProps) {
  const t = useTranslations("guestView.upload");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [guestName, setGuestName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const limits = getLimits(plan);
  const videoAllowed = hasFeature({ plan, feature: "videoUploads" });
  const acceptedTypes = videoAllowed
    ? [...IMAGE_TYPES, ...VIDEO_TYPES]
    : IMAGE_TYPES;
  const fileSizeLimit = maxFileBytes ?? limits.maxFileBytes;
  const maxFileLabel = formatBytes(fileSizeLimit);

  const messageForReason = (reason: UploadFailureReason) => {
    switch (reason) {
      case "fileTooLarge":
        return t("fileTooLarge", { size: maxFileLabel });
      case "mediaTypeNotAllowed":
        return t("imagesOnly");
      case "invalidFileType":
        return t("invalidFileType");
      case "quotaExceeded":
        return t("quotaExceeded");
      case "windowClosed":
        return t("windowClosed");
      case "eventInactive":
        return t("eventInactive");
      default:
        return t("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!acceptedTypes.includes(selectedFile.type)) {
      toast.error(videoAllowed ? t("invalidFileType") : t("imagesOnly"));
      return;
    }

    if (selectedFile.size > fileSizeLimit) {
      toast.error(t("fileTooLarge", { size: maxFileLabel }));
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
        if (onUpload) {
          setUploadProgress(40);
          const result = await onUpload({
            file,
            guestName: guestName || undefined,
            caption: caption || undefined,
          });

          if (!result.ok) {
            toast.error(messageForReason(result.reason));
            setUploadProgress(0);
            return;
          }

          setUploadProgress(100);
          toast.success(t("success"));
          onUploadSuccess(result.upload);
          setFile(null);
          setCaption("");
          setGuestName("");
          setUploadProgress(0);
          return;
        }

        const presigned = await getPresignedUrl({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          eventId,
        });

        if (!presigned.ok) {
          toast.error(messageForReason(presigned.reason));
          setUploadProgress(0);
          return;
        }

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

          xhr.open("PUT", presigned.uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setUploadProgress(100);

        const result = await saveUploadToDb({
          eventId,
          fileKey: presigned.fileKey,
          guestName: guestName || undefined,
          caption: caption || undefined,
        });

        if (!result.ok) {
          toast.error(messageForReason(result.reason));
          setUploadProgress(0);
          return;
        }

        toast.success(t("success"));

        onUploadSuccess({
          id: result.id,
          file_url: result.file_url,
          thumbnail_url: result.thumbnail_url,
          media_type: result.media_type,
          guest_name: guestName || null,
          caption: caption || null,
          created_at: new Date().toISOString(),
        });

        setFile(null);
        setCaption("");
        setGuestName("");
        setUploadProgress(0);
      } catch (error) {
        toast.error(t("error"));
        console.error("[UploadDrawer] Upload failed:", error);
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
            <Label htmlFor="file">
              {videoAllowed ? t("photoOrVideo") : t("photoOnly")}
            </Label>
            <Input
              id="file"
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleFileChange}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              {t("maxFileSize", { size: maxFileLabel })}
            </p>
            {file && (
              <p className="text-sm text-muted-foreground">
                {t("selected")}: {file.name} ({formatBytes(file.size)})
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
            className="w-full rounded-full shadow-md shadow-primary/20"
            size="lg"
          >
            {isPending ? t("uploading") : t("uploadButton")}
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              disabled={isPending}
              className="rounded-full"
            >
              {t("cancel")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
