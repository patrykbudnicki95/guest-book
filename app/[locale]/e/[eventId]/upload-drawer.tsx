"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Play, X } from "lucide-react";
import { MediaImage } from "@/components/media-image";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getPresignedUrls,
  saveEntry,
  type SaveEntryResult,
  type UploadFailureReason,
} from "@/app/actions/upload-actions";
import {
  MAX_FILES_PER_ENTRY,
  formatBytes,
  getLimits,
  hasFeature,
} from "@/lib/permissions";
import type { PlanId } from "@/lib/pricing";
import type { Entry } from "@/lib/schemas/database";
import { toast } from "sonner";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime"];
/** Parallel PUTs to R2; more than this mostly fights over venue Wi-Fi. */
const PARALLEL_UPLOADS = 3;

export type LocalEntryInput = {
  files: File[];
  guestName?: string;
  message?: string;
  isPrivate: boolean;
};

export type LocalEntryResult = SaveEntryResult;

interface UploadDrawerProps {
  eventId: string;
  plan: PlanId;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (entry: Entry) => void;
  onUpload?: (input: LocalEntryInput) => Promise<LocalEntryResult>;
  maxFileBytes?: number;
}

function putFile(
  url: string,
  file: File,
  onProgress: (loadedBytes: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded);
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

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * PUTs every file to its presigned URL, a few at a time, and returns the keys
 * that made it. A failed file doesn't stop the others.
 */
async function uploadFiles(
  files: File[],
  items: { uploadUrl: string; fileKey: string }[],
  onProgress: (percent: number) => void,
): Promise<string[]> {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const loaded = files.map(() => 0);
  const succeeded = files.map(() => false);
  let next = 0;

  const worker = async () => {
    while (next < files.length) {
      const index = next++;

      try {
        await putFile(items[index].uploadUrl, files[index], (bytes) => {
          loaded[index] = bytes;
          const sum = loaded.reduce((a, b) => a + b, 0);
          onProgress(Math.round((sum / totalBytes) * 100));
        });
        succeeded[index] = true;
      } catch (error) {
        console.error("[UploadDrawer] File upload failed:", error);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(PARALLEL_UPLOADS, files.length) }, worker),
  );

  return items.filter((_, index) => succeeded[index]).map((item) => item.fileKey);
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
  // Each preview URL is created once, when the file is picked, so removing
  // one file doesn't re-create (and reload) the others.
  const [selected, setSelected] = useState<{ file: File; previewUrl: string }[]>(
    [],
  );
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const files = selected.map((item) => item.file);

  const limits = getLimits(plan);
  const videoAllowed = hasFeature({ plan, feature: "videoUploads" });
  const acceptedTypes = videoAllowed
    ? [...IMAGE_TYPES, ...VIDEO_TYPES]
    : IMAGE_TYPES;
  const fileSizeLimit = maxFileBytes ?? limits.maxFileBytes;
  const maxFileLabel = formatBytes(fileSizeLimit);
  const canSubmit = files.length > 0 || message.trim().length > 0;

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
      case "tooManyFiles":
        return t("tooManyFiles", { count: MAX_FILES_PER_ENTRY });
      case "emptyEntry":
        return t("emptyEntry");
      default:
        return t("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    // Let the guest pick the same file again after removing it.
    e.target.value = "";

    const ofAcceptedType = picked.filter((file) =>
      acceptedTypes.includes(file.type),
    );
    const valid = ofAcceptedType.filter((file) => file.size <= fileSizeLimit);

    if (ofAcceptedType.length < picked.length) {
      toast.error(videoAllowed ? t("invalidFileType") : t("imagesOnly"));
    }

    if (valid.length < ofAcceptedType.length) {
      toast.error(t("fileTooLarge", { size: maxFileLabel }));
    }

    const room = MAX_FILES_PER_ENTRY - files.length;

    if (valid.length > room) {
      toast.error(t("tooManyFiles", { count: MAX_FILES_PER_ENTRY }));
    }

    if (valid.length > 0 && room > 0) {
      const added = valid.slice(0, room).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setSelected((prev) => [...prev, ...added]);
    }
  };

  const removeFile = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setSelected((prev) => prev.filter((item) => item.previewUrl !== previewUrl));
  };

  const reset = () => {
    selected.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setSelected([]);
    setMessage("");
    setGuestName("");
    setIsPrivate(false);
    setUploadProgress(0);
  };

  const finish = (result: SaveEntryResult, failedUploads: number) => {
    if (!result.ok) {
      toast.error(messageForReason(result.reason));
      setUploadProgress(0);
      return;
    }

    const missing = failedUploads + result.skipped;

    if (missing > 0) {
      toast.warning(t("someFilesFailed", { failed: missing, total: files.length }));
    } else {
      toast.success(isPrivate ? t("successPrivate") : t("success"));
    }

    onUploadSuccess(result.entry);
    reset();
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error(t("emptyEntry"));
      return;
    }

    setUploadProgress(0);

    startTransition(async () => {
      try {
        if (onUpload) {
          setUploadProgress(40);
          const result = await onUpload({
            files,
            guestName: guestName || undefined,
            message: message || undefined,
            isPrivate,
          });
          setUploadProgress(100);
          finish(result, 0);
          return;
        }

        let fileKeys: string[] = [];

        if (files.length > 0) {
          const presigned = await getPresignedUrls({
            eventId,
            files: files.map((file) => ({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            })),
          });

          if (!presigned.ok) {
            toast.error(messageForReason(presigned.reason));
            setUploadProgress(0);
            return;
          }

          fileKeys = await uploadFiles(files, presigned.items, setUploadProgress);

          if (fileKeys.length === 0 && !message.trim()) {
            toast.error(t("error"));
            setUploadProgress(0);
            return;
          }
        }

        setUploadProgress(100);

        const result = await saveEntry({
          eventId,
          fileKeys,
          guestName: guestName || undefined,
          message: message || undefined,
          isPrivate,
        });

        finish(result, files.length - fileKeys.length);
      } catch (error) {
        toast.error(t("error"));
        console.error("[UploadDrawer] Upload failed:", error);
        setUploadProgress(0);
      }
    });
  };

  return (
    // vaul's keyboard handling guesses whether the iOS keyboard is open from
    // visualViewport resizes and gets it wrong, leaving the drawer pushed off
    // screen. Safari scrolls a focused input into view well enough on its own.
    <Drawer open={isOpen} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto p-4">
          {/* Files */}
          <div className="space-y-2">
            <Label htmlFor="files">
              {videoAllowed ? t("photoOrVideo") : t("photoOnly")}
            </Label>
            <Input
              id="files"
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileChange}
              disabled={isPending || files.length >= MAX_FILES_PER_ENTRY}
              className="sr-only"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selected.map(({ file, previewUrl }) => (
                <div
                  key={previewUrl}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {file.type.startsWith("image/") ? (
                    <MediaImage
                      src={previewUrl}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Play className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(previewUrl)}
                    disabled={isPending}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1"
                    aria-label={t("removeFile")}
                  >
                    <X className="size-3 text-white" />
                  </button>
                </div>
              ))}
              {files.length < MAX_FILES_PER_ENTRY && (
                <label
                  htmlFor="files"
                  className="flex size-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground"
                >
                  <ImagePlus className="size-5" />
                  {t("addFiles")}
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("filesHint", {
                count: MAX_FILES_PER_ENTRY,
                size: maxFileLabel,
              })}
            </p>
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

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t("message")}</Label>
            <Textarea
              id="message"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
            <div className="space-y-1">
              <Label htmlFor="isPrivate">{t("privateLabel")}</Label>
              <p className="text-xs text-muted-foreground">
                {isPrivate ? t("privateOnHint") : t("privateOffHint")}
              </p>
            </div>
            <Switch
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isPending}
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
            disabled={!canSubmit || isPending}
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
