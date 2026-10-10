import { useTranslations } from "next-intl";

/** The event exists but doesn't own the guestbook app (e.g. only save the date). */
export function GuestbookUnavailable() {
  const t = useTranslations("guestView");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-semibold">{t("guestbookUnavailable")}</h1>
        <p className="mt-2 text-muted-foreground">{t("guestbookUnavailableDesc")}</p>
      </div>
    </div>
  );
}
