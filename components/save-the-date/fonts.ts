import {
  Bodoni_Moda,
  Cormorant_Garamond,
  Great_Vibes,
  Jost,
  Playfair_Display,
} from "next/font/google";
import type { SaveTheDateFont } from "@/lib/schemas/database";

// latin-ext everywhere: Polish names (Michał, Wojciech, Zośka) must not fall back.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

const jost = Jost({
  subsets: ["latin", "latin-ext"],
});

type FontRoles = {
  /** The couple's names. */
  display: string;
  /** Dates, headings and the message. */
  serif: string;
  /** Small caps labels, buttons. */
  sans: string;
};

const PAIRS: Record<SaveTheDateFont, FontRoles> = {
  classic: {
    display: cormorant.style.fontFamily,
    serif: cormorant.style.fontFamily,
    sans: jost.style.fontFamily,
  },
  romantic: {
    display: greatVibes.style.fontFamily,
    serif: cormorant.style.fontFamily,
    sans: jost.style.fontFamily,
  },
  modern: {
    display: bodoni.style.fontFamily,
    serif: bodoni.style.fontFamily,
    sans: jost.style.fontFamily,
  },
  timeless: {
    display: playfair.style.fontFamily,
    serif: playfair.style.fontFamily,
    sans: jost.style.fontFamily,
  },
};

/** CSS variables read by the `font-(family-name:--std-…)` utilities in the templates. */
export function fontVariables(font: SaveTheDateFont): Record<string, string> {
  const pair = PAIRS[font];

  return {
    "--std-display": pair.display,
    "--std-serif": pair.serif,
    "--std-sans": pair.sans,
  };
}

/** Script faces sit smaller and need no tracking; the templates adjust for them. */
export function isScriptFont(font: SaveTheDateFont): boolean {
  return font === "romantic";
}
