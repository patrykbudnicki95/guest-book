import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
  SaveTheDateUpdate,
  SeatingUpdate,
} from "@/lib/schemas/database";
import type { SaveTheDateAssetKind } from "@/lib/save-the-date";
import type { ProductId } from "@/lib/pricing";
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
  saveTheDate: SaveTheDateUpdate;
  isReady: boolean;
  /** What the demo event "owns"; switching it is how the demo shows a single app or Gold. */
  setProducts: (products: ProductId[]) => Promise<void>;
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
  updateSaveTheDate: (
    data: SaveTheDateUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  uploadSaveTheDateAsset: (
    kind: SaveTheDateAssetKind,
    file: File,
  ) => Promise<{ url: string }>;
  addEntry: (input: LocalEntryInput) => Promise<LocalEntryResult>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean }>;
  getExport: () => Promise<EventExportResult>;
  reset: () => Promise<void>;
};
