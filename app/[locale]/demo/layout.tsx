import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { noindexMetadata } from "@/lib/seo/metadata";
import { DemoProvider } from "@/lib/demo/provider";
import { DemoBanner } from "./components/demo-banner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("demo");

  return noindexMetadata(t("metaTitle"));
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <DemoBanner />
      {children}
    </DemoProvider>
  );
}
