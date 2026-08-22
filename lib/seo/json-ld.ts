import type { AppLocale } from "@/i18n/routing";
import { CURRENCY, type Plan } from "@/lib/pricing";
import { absoluteUrl, siteConfig } from "./config";

export type JsonLdNode = Record<string, unknown>;

export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/opengraph-image"),
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
  };
}

export function webSiteNode(locale: AppLocale): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

type SoftwareApplicationOptions = {
  description: string;
  url: string;
  locale: AppLocale;
  offers: { plan: Plan; name: string; url: string }[];
};

export function softwareApplicationNode({
  description,
  url,
  locale,
  offers,
}: SoftwareApplicationOptions): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description,
    url,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web browser",
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
    offers: offers.map(({ plan, name, url: offerUrl }) => ({
      "@type": "Offer",
      name,
      url: offerUrl,
      price: String(plan.price),
      priceCurrency: CURRENCY,
      availability: "https://schema.org/InStock",
    })),
  };
}

type ProductOptions = {
  plan: Plan;
  name: string;
  description: string;
  url: string;
  offerUrl: string;
};

export function productNode({
  plan,
  name,
  description,
  url,
  offerUrl,
}: ProductOptions): JsonLdNode {
  return {
    "@type": "Product",
    name,
    description,
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    category: "Wedding guestbook software",
    offers: {
      "@type": "Offer",
      url: offerUrl,
      price: String(plan.price),
      priceCurrency: CURRENCY,
      availability: "https://schema.org/InStock",
      seller: { "@id": ORGANIZATION_ID },
    },
  };
}

export type FaqEntry = { question: string; answer: string };

export function faqPageNode(items: FaqEntry[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export type BreadcrumbEntry = { name: string; url: string };

export function breadcrumbListNode(items: BreadcrumbEntry[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url,
    })),
  };
}

type ArticleOptions = {
  headline: string;
  description: string;
  url: string;
  locale: AppLocale;
  datePublished: string;
  dateModified?: string;
};

export function articleNode({
  headline,
  description,
  url,
  locale,
  datePublished,
  dateModified,
}: ArticleOptions): JsonLdNode {
  return {
    "@type": "Article",
    headline,
    description,
    url,
    inLanguage: locale,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

type ItemListOptions = {
  name: string;
  items: { name: string; url: string }[];
};

export function itemListNode({ name, items }: ItemListOptions): JsonLdNode {
  return {
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
