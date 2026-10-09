import type { SaveTheDateContent } from "@/lib/schemas/database";

export type SaveTheDateTemplateProps = {
  content: SaveTheDateContent;
  /** The event date, `YYYY-MM-DD`. */
  date: string;
  /** Called from the guest's tap, so the background music may start. */
  onOpen: () => void;
};
