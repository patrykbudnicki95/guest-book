import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
} from "@/lib/schemas/database";
import type { DashboardUpload } from "@/app/actions/dashboard-actions";
import type { LocalUploadResult } from "@/app/[locale]/e/[eventId]/upload-drawer";

export type DemoUploadResult = LocalUploadResult;

export type DemoWorkspace = {
  event: EventFull;
  uploads: DashboardUpload[];
  isReady: boolean;
  updateSettings: (
    data: EventSettingsUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePageContent: (
    data: EventPageContentUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  uploadCover: (file: File) => Promise<{ publicUrl: string }>;
  addUpload: (input: {
    file: File;
    guestName?: string;
    caption?: string;
  }) => Promise<DemoUploadResult>;
  deleteUpload: (uploadId: string) => Promise<{ success: boolean }>;
  reset: () => Promise<void>;
};
