import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
} from "@/lib/schemas/database";
import type { DashboardEntry } from "@/app/actions/dashboard-actions";
import type {
  LocalEntryInput,
  LocalEntryResult,
} from "@/app/[locale]/e/[eventId]/upload-drawer";

export type DemoWorkspace = {
  event: EventFull;
  entries: DashboardEntry[];
  isReady: boolean;
  updateSettings: (
    data: EventSettingsUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePageContent: (
    data: EventPageContentUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  uploadCover: (file: File) => Promise<{ publicUrl: string }>;
  addEntry: (input: LocalEntryInput) => Promise<LocalEntryResult>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean }>;
  reset: () => Promise<void>;
};
