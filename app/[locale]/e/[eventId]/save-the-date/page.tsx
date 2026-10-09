import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { noindexMetadata } from "@/lib/seo/metadata";
import { getPublishedSaveTheDate } from "@/app/actions/save-the-date-actions";
import type { AppLocale } from "@/i18n/routing";
import { SaveTheDateView } from "@/components/save-the-date/save-the-date-view";
import { Skeleton } from "@/components/ui/skeleton";

interface SaveTheDatePageProps {
  params: Promise<{ locale: AppLocale; eventId: string }>;
}

/** Names and the date are personal, so like the rest of /e/ this is never indexed. */
export async function generateMetadata({
  params,
}: SaveTheDatePageProps): Promise<Metadata> {
  const { locale, eventId } = await params;
  const t = await getTranslations({ locale, namespace: "saveTheDate.guest" });
  const result = await getPublishedSaveTheDate(eventId);
  const names = result?.saveTheDate?.content.names || result?.event.names;

  return noindexMetadata(names ? t("metaTitle", { names }) : t("title"));
}

async function SaveTheDateContent({ params }: SaveTheDatePageProps) {
  const { eventId } = await params;
  const result = await getPublishedSaveTheDate(eventId);

  if (!result?.saveTheDate) {
    const t = await getTranslations("saveTheDate.guest");
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold">{t("notReadyTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("notReadyDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <SaveTheDateView
      template={result.saveTheDate.template}
      content={result.saveTheDate.content}
      date={result.event.date}
    />
  );
}

export default function SaveTheDatePage({ params }: SaveTheDatePageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Skeleton className="h-64 w-72 rounded-2xl" />
        </div>
      }
    >
      <SaveTheDateContent params={params} />
    </Suspense>
  );
}
