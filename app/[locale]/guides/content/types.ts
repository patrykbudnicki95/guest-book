import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";

export type GuideFaqEntry = {
  question: string;
  answer: string;
};

export type GuideContent = {
  /** Slug is per locale so translations can use their own keywords. */
  slug: string;
  title: string;
  /** Shorter variant used in the `<title>` tag. */
  metaTitle: string;
  description: string;
  excerpt: string;
  datePublished: string;
  dateModified?: string;
  readingMinutes: number;
  faq?: GuideFaqEntry[];
  Body: () => ReactNode;
};

export type GuideArticle = {
  /** Stable identifier shared by every translation of the article. */
  id: string;
  translations: Partial<Record<AppLocale, GuideContent>>;
};
