"use client";

import { useState, type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SeatingTableDiagram } from "@/components/seating-table";
import type { SeatingTable } from "@/lib/schemas/database";
import { cn } from "@/lib/utils";

const MIN_QUERY_LENGTH = 2;

/** Guests type on phones without Polish keys, so "lukasz" must find "Łukasz". */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function matchingSeats(table: SeatingTable, tokens: string[]): number[] {
  return table.seats.flatMap((name, seat) => {
    const normalized = normalize(name);
    return normalized && tokens.every((token) => normalized.includes(token))
      ? [seat]
      : [];
  });
}

function TableCard({
  table,
  highlightedSeats,
}: {
  table: SeatingTable;
  highlightedSeats: number[];
}) {
  return (
    <li className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-center text-lg font-bold">{table.name}</h2>
      <SeatingTableDiagram
        table={table}
        highlightedSeats={highlightedSeats}
        className="mx-auto max-w-sm"
      />
      <ol className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {table.seats.map((name, seat) =>
          name ? (
            <li
              key={seat}
              className={cn(
                "flex gap-2",
                highlightedSeats.includes(seat)
                  ? "font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              <span className="w-6 shrink-0 text-right font-medium text-foreground">
                {seat + 1}.
              </span>
              {name}
            </li>
          ) : null,
        )}
      </ol>
    </li>
  );
}

export function SeatingBrowser({
  eventNames,
  tables,
  backHref,
  headerClassName,
}: {
  eventNames: string;
  /** Published tables, or null when the plan is unpublished or not on Gold. */
  tables: SeatingTable[] | null;
  backHref: ComponentProps<typeof Link>["href"];
  headerClassName?: string;
}) {
  const t = useTranslations("guestView.seating");
  const [query, setQuery] = useState("");

  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const isSearching = tokens.join("").length >= MIN_QUERY_LENGTH;
  const results = (tables ?? [])
    .map((table) => ({
      table,
      seats: isSearching ? matchingSeats(table, tokens) : [],
    }))
    .filter(({ seats }) => !isSearching || seats.length > 0);
  const matchCount = results.reduce((sum, { seats }) => sum + seats.length, 0);

  return (
    <>
      <header
        className={cn(
          "sticky z-20 border-b bg-white/90 backdrop-blur-lg",
          headerClassName ?? "top-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex min-w-0 items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link href={backHref} aria-label={t("back")}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <p className="truncate text-sm font-semibold">{eventNames}</p>
          </div>
          <LanguageSwitcher />
        </div>
        {tables && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                autoComplete="off"
                className="h-11 rounded-full bg-white pl-9 text-base"
              />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {!tables
              ? t("unavailable")
              : isSearching
                ? t("matches", { count: matchCount })
                : t("description")}
          </p>
        </div>

        {isSearching && matchCount === 0 && (
          <p className="rounded-2xl border bg-white p-4 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </p>
        )}

        <ul className="space-y-4">
          {results.map(({ table, seats }) => (
            <TableCard key={table.id} table={table} highlightedSeats={seats} />
          ))}
        </ul>
      </main>
    </>
  );
}
