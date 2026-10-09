import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
  SeatingUpdate,
} from "@/lib/schemas/database";
import type {
  DashboardEntry,
  EventExportResult,
} from "@/app/actions/dashboard-actions";
import type {
  LocalEntryInput,
  LocalEntryResult,
} from "@/app/[locale]/e/[eventId]/upload-drawer";

export type DemoWorkspace = {
  event: EventFull;
  entries: DashboardEntry[];
  seating: SeatingUpdate;
  isReady: boolean;
  updateSettings: (
    data: EventSettingsUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePageContent: (
    data: EventPageContentUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  uploadCover: (file: File) => Promise<{ publicUrl: string }>;
  updateSeating: (
    data: SeatingUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  addEntry: (input: LocalEntryInput) => Promise<LocalEntryResult>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean }>;
  getExport: () => Promise<EventExportResult>;
  reset: () => Promise<void>;
};
