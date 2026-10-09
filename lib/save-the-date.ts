import type {
  SaveTheDateContent,
  SaveTheDateFont,
  SaveTheDateTemplate,
} from "@/lib/schemas/database";

const MB = 1024 ** 2;

/** What the couple may upload for the page. The presign action enforces it. */
export const SAVE_THE_DATE_ASSETS = {
  photo: {
    types: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 10 * MB,
  },
  music: {
    types: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/aac"],
    maxBytes: 15 * MB,
  },
} as const;

export type SaveTheDateAssetKind = keyof typeof SAVE_THE_DATE_ASSETS;

export function isSaveTheDateAssetKind(value: string): value is SaveTheDateAssetKind {
  return Object.hasOwn(SAVE_THE_DATE_ASSETS, value);
}

export type SaveTheDatePalette = SaveTheDateContent["colors"];

export const SAVE_THE_DATE_PALETTES = {
  burgundy: { background: "#f6efe6", text: "#3a1720", accent: "#7d2236" },
  sage: { background: "#eef0e7", text: "#283326", accent: "#6f8262" },
  blush: { background: "#fbf2ee", text: "#4a2a29", accent: "#c4786f" },
  midnight: { background: "#0f1626", text: "#f4efe4", accent: "#c8a86b" },
  terracotta: { background: "#f4eadf", text: "#3b2a1f", accent: "#b45f38" },
  ivory: { background: "#fbfaf6", text: "#151515", accent: "#151515" },
} as const satisfies Record<string, SaveTheDatePalette>;

export type SaveTheDatePaletteId = keyof typeof SAVE_THE_DATE_PALETTES;

/** Each template opens with the palette and fonts it was designed around. */
export const SAVE_THE_DATE_TEMPLATE_DEFAULTS: Record<
  SaveTheDateTemplate,
  { palette: SaveTheDatePaletteId; font: SaveTheDateFont }
> = {
  envelope: { palette: "burgundy", font: "romantic" },
  editorial: { palette: "midnight", font: "modern" },
  polaroid: { palette: "blush", font: "timeless" },
  botanical: { palette: "sage", font: "classic" },
};

export function createSaveTheDateContent({
  template,
  names,
  location,
  eyebrow,
  message,
  photoUrl = null,
}: {
  template: SaveTheDateTemplate;
  names: string;
  location: string;
  eyebrow: string;
  message: string;
  photoUrl?: string | null;
}): SaveTheDateContent {
  const defaults = SAVE_THE_DATE_TEMPLATE_DEFAULTS[template];

  return {
    names,
    eyebrow,
    message,
    location,
    photo_url: photoUrl,
    music_url: null,
    font: defaults.font,
    colors: { ...SAVE_THE_DATE_PALETTES[defaults.palette] },
    show_countdown: true,
    show_calendar: true,
  };
}

/** "Anna & Jan", "Anna i Jan" or "Anna and Jan" → ["A", "J"]. */
export function initialsOf(names: string): string[] {
  return names
    .split(/\s*(?:&|\+|\bi\b|\band\b)\s*/i)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
}

/** "Anna & Jan" → { first: "Anna", joiner: "&", second: "Jan" }, or null for one name. */
export function splitNames(
  names: string,
): { first: string; joiner: string; second: string } | null {
  const match = names.match(/^(.+?)\s*(&|\+|\si\s|\sand\s)\s*(.+)$/i);

  if (!match) {
    return null;
  }

  return { first: match[1].trim(), joiner: match[2].trim(), second: match[3].trim() };
}
