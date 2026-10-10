"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeatingTableDiagram } from "@/components/seating-table";
import { updateSeating, type SeatingEvent } from "@/app/actions/seating-actions";
import { MAX_SEATS_PER_TABLE, getLimits, hasFeature } from "@/lib/permissions";
import {
  SEATING_SHAPES,
  type SeatingShape,
  type SeatingTable,
  type SeatingUpdate,
} from "@/lib/schemas/database";
import { PlanLock } from "../../components/plan-lock";

const DEFAULT_SEATS = 10;
const SEAT_COUNTS = Array.from({ length: MAX_SEATS_PER_TABLE }, (_, i) => i + 1);

/** Names are edited as one textarea per table: one line is one seat. */
type DraftTable = {
  id: string;
  name: string;
  shape: SeatingShape;
  seatCount: number;
  names: string;
};

/** Seats up to and including the last named one; trailing blanks are free seats. */
function namedSeatCount(names: string): number {
  const lines = names.split("\n");
  let count = lines.length;
  while (count > 0 && lines[count - 1].trim() === "") count--;
  return count;
}

function toDraft(table: SeatingTable): DraftTable {
  return {
    id: table.id,
    name: table.name,
    shape: table.shape,
    seatCount: table.seats.length,
    names: table.seats.slice(0, namedSeatCount(table.seats.join("\n"))).join("\n"),
  };
}

function toTable(draft: DraftTable): SeatingTable {
  const lines = draft.names.split("\n").slice(0, draft.seatCount);
  return {
    id: draft.id,
    name: draft.name,
    shape: draft.shape,
    seats: Array.from({ length: draft.seatCount }, (_, i) => lines[i] ?? ""),
  };
}

const KNOWN_ERRORS = ["planUpgradeRequired", "tooManyTables"] as const;

interface SeatingTabProps {
  events: SeatingEvent[];
  onSave?: (
    eventId: string,
    data: SeatingUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function SeatingTab({ events, onSave }: SeatingTabProps) {
  const t = useTranslations("dashboard.seating");
  const [isPending, startTransition] = useTransition();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const effectiveEventId = selectedEventId ?? events[0]?.id ?? null;
  const selectedEvent =
    events.find((e) => e.id === effectiveEventId) ?? events[0] ?? null;

  const [tables, setTables] = useState<DraftTable[]>(
    () => selectedEvent?.seating.tables.map(toDraft) ?? [],
  );
  const [isPublished, setIsPublished] = useState(
    selectedEvent?.seating.is_published ?? false,
  );
  // Reload the draft when another event is picked or fresh data arrives.
  const [loadedEvent, setLoadedEvent] = useState(selectedEvent);
  if (selectedEvent !== loadedEvent) {
    setLoadedEvent(selectedEvent);
    setTables(selectedEvent?.seating.tables.map(toDraft) ?? []);
    setIsPublished(selectedEvent?.seating.is_published ?? false);
  }

  const products = selectedEvent?.products ?? [];
  const canEdit = hasFeature({ products, feature: "findYourTable" });
  const maxTables = getLimits(products).seatingTables;
  const guestCount = tables.reduce(
    (sum, table) =>
      sum +
      toTable(table).seats.filter((seat) => seat.trim() !== "").length,
    0,
  );

  const updateTable = (id: string, patch: Partial<DraftTable>) => {
    setTables((prev) =>
      prev.map((table) => (table.id === id ? { ...table, ...patch } : table)),
    );
  };

  const updateNames = (table: DraftTable, names: string) => {
    // Pasting a longer list grows the table instead of dropping guests.
    const needed = Math.min(MAX_SEATS_PER_TABLE, namedSeatCount(names));
    updateTable(table.id, {
      names,
      seatCount: Math.max(table.seatCount, needed),
    });
  };

  const addTable = () => {
    setTables((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: t("defaultTableName", { number: prev.length + 1 }),
        shape: "round",
        seatCount: DEFAULT_SEATS,
        names: "",
      },
    ]);
  };

  const removeTable = (id: string) => {
    setTables((prev) => prev.filter((table) => table.id !== id));
  };

  const handleSave = () => {
    if (!effectiveEventId) return;

    const overflowing = tables.find(
      (table) => namedSeatCount(table.names) > table.seatCount,
    );
    if (overflowing) {
      toast.error(t("tooManyNames", { table: overflowing.name }));
      return;
    }

    const payload: SeatingUpdate = {
      is_published: isPublished,
      tables: tables.map((table, index) =>
        toTable({
          ...table,
          name:
            table.name.trim() ||
            t("defaultTableName", { number: index + 1 }),
        }),
      ),
    };

    startTransition(async () => {
      const result = onSave
        ? await onSave(effectiveEventId, payload)
        : await updateSeating(effectiveEventId, payload);

      if (result.success) {
        toast.success(t("saveSuccess"));
      } else {
        const known = KNOWN_ERRORS.find((code) => code === result.error);
        toast.error(
          known
            ? t(`errors.${known}`, { max: maxTables })
            : (result.error ?? t("saveError")),
        );
      }
    });
  };

  if (events.length === 0) {
    return (
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("noEvents")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const saveButton = (size?: "lg") => (
    <Button
      onClick={handleSave}
      disabled={isPending || !effectiveEventId}
      size={size}
      className="rounded-full shadow-md shadow-primary/20"
    >
      <Save className="mr-2 size-4" />
      {isPending ? t("saving") : t("save")}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {canEdit && saveButton()}
      </div>

      {events.length > 1 && (
        <div className="space-y-2">
          <Label>{t("selectEvent")}</Label>
          <Select
            value={effectiveEventId ?? ""}
            onValueChange={setSelectedEventId}
          >
            <SelectTrigger className="w-full max-w-sm rounded-lg">
              <SelectValue placeholder={t("selectEvent")} />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.names}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!canEdit ? (
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="pt-6">
            <PlanLock feature="findYourTable" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="seating-published" className="text-base">
                    {t("publish.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublished ? t("publish.on") : t("publish.off")}
                  </p>
                </div>
                <Switch
                  id="seating-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                {t("privacyNote")}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{t("tables.title")}</CardTitle>
                  <CardDescription>
                    {t("tables.summary", {
                      tables: tables.length,
                      max: maxTables,
                      guests: guestCount,
                    })}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  onClick={addTable}
                  disabled={tables.length >= maxTables}
                >
                  <Plus className="mr-1 size-3.5" />
                  {t("tables.add")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tables.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("tables.empty")}
                </p>
              )}
              {tables.map((table) => {
                const overflow = namedSeatCount(table.names) - table.seatCount;
                return (
                  <div
                    key={table.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={table.name}
                        onChange={(e) =>
                          updateTable(table.id, { name: e.target.value })
                        }
                        placeholder={t("tables.namePlaceholder")}
                        aria-label={t("tables.name")}
                        maxLength={60}
                        className="rounded-lg font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTable(table.id)}
                        aria-label={t("tables.remove")}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t("tables.shape")}
                        </Label>
                        <Select
                          value={table.shape}
                          onValueChange={(shape) =>
                            updateTable(table.id, {
                              shape: shape as SeatingShape,
                            })
                          }
                        >
                          <SelectTrigger className="w-full rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEATING_SHAPES.map((shape) => (
                              <SelectItem key={shape} value={shape}>
                                {t(`shapes.${shape}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t("tables.seats")}
                        </Label>
                        <Select
                          value={String(table.seatCount)}
                          onValueChange={(value) =>
                            updateTable(table.id, { seatCount: Number(value) })
                          }
                        >
                          <SelectTrigger className="w-full rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEAT_COUNTS.map((count) => (
                              <SelectItem key={count} value={String(count)}>
                                {count}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                      <SeatingTableDiagram
                        table={toTable(table)}
                        className="mx-auto max-w-xs"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor={`seats-${table.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          {t("tables.guests")}
                        </Label>
                        <Textarea
                          id={`seats-${table.id}`}
                          value={table.names}
                          onChange={(e) => updateNames(table, e.target.value)}
                          placeholder={t("tables.guestsPlaceholder")}
                          rows={Math.min(table.seatCount, 12)}
                          className="rounded-lg text-sm leading-6"
                        />
                        {overflow > 0 && (
                          <p className="text-xs text-destructive">
                            {t("tables.overflow", { count: overflow })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end pb-8">{saveButton("lg")}</div>
        </>
      )}
    </div>
  );
}
