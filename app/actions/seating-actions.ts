"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  EventForSeatingSchema,
  EventSeatingSchema,
  GuestSeatingSchema,
  SeatingUpdateSchema,
  type EventForSeating,
  type SeatingTable,
  type SeatingUpdate,
} from "@/lib/schemas/database";
import { getLimits, hasFeature } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";
import type { Json } from "@/types/supabase";

export type SeatingEvent = EventForSeating & { seating: SeatingUpdate };

const EMPTY_SEATING: SeatingUpdate = { tables: [], is_published: false };

/** The owner's events with their seating plan, draft or published. */
export async function getSeatingList(userId: string): Promise<SeatingEvent[]> {
  const supabase = await createClient();

  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("id, names, products")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (eventsError || !eventsData) {
    console.error("[getSeatingList] Error fetching events:", eventsError);
    return [];
  }

  const events = z.array(EventForSeatingSchema).safeParse(eventsData);
  if (!events.success) {
    console.error(
      "[getSeatingList] Zod validation failed:",
      z.prettifyError(events.error),
    );
    console.error("[getSeatingList] Raw data:", JSON.stringify(eventsData, null, 2));
    return [];
  }

  if (events.data.length === 0) {
    return [];
  }

  const { data: seatingData, error: seatingError } = await supabase
    .from("event_seating")
    .select("event_id, tables, is_published")
    .in(
      "event_id",
      events.data.map((event) => event.id),
    );

  if (seatingError || !seatingData) {
    console.error("[getSeatingList] Error fetching seating:", seatingError);
    return [];
  }

  const seating = z.array(EventSeatingSchema).safeParse(seatingData);
  if (!seating.success) {
    console.error(
      "[getSeatingList] Zod validation failed:",
      z.prettifyError(seating.error),
    );
    console.error("[getSeatingList] Raw data:", JSON.stringify(seatingData, null, 2));
    return [];
  }

  return events.data.map((event) => {
    const row = seating.data.find((item) => item.event_id === event.id);
    return {
      ...event,
      seating: row
        ? { tables: row.tables, is_published: row.is_published }
        : EMPTY_SEATING,
    };
  });
}

/**
 * Tables for the guest page. RLS only returns published plans to guests; the
 * explicit filter keeps the owner's own preview identical to what guests see.
 */
export async function getPublishedSeating(
  eventId: string,
): Promise<SeatingTable[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_seating")
    .select("tables")
    .eq("event_id", eventId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("[getPublishedSeating] Supabase error:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const parsed = GuestSeatingSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getPublishedSeating] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getPublishedSeating] Raw data:", JSON.stringify(data, null, 2));
    return null;
  }

  return parsed.data.tables.length > 0 ? parsed.data.tables : null;
}

export async function updateSeating(
  eventId: string,
  data: SeatingUpdate,
): Promise<{ success: boolean; error?: string }> {
  const parsed = SeatingUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: owned } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!owned) {
    return { success: false, error: "Event not found" };
  }

  const planContext = await getEventPlanContext(eventId);
  if (!planContext) {
    return { success: false, error: "Event not found" };
  }

  const { products } = planContext;
  if (!hasFeature({ products, feature: "findYourTable" })) {
    return { success: false, error: "planUpgradeRequired" };
  }
  if (parsed.data.tables.length > getLimits(products).seatingTables) {
    return { success: false, error: "tooManyTables" };
  }

  const tables = parsed.data.tables.map((table) => ({
    ...table,
    name: table.name.trim(),
    seats: table.seats.map((seat) => seat.trim()),
  }));

  const { error } = await supabase
    .from("event_seating")
    // @ts-expect-error Supabase upsert() infers 'never' - types/supabase.ts event_seating.Insert is correct
    .upsert({
      event_id: eventId,
      tables: tables as Json,
      is_published: parsed.data.is_published,
    });

  if (error) {
    console.error("[updateSeating] Error saving seating:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
