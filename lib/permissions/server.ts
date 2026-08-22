import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  EventPlanContextSchema,
  type EventPlanContext,
} from "@/lib/schemas/database";
import { hasFeature, type PlanFeature } from "./index";

/**
 * Reads everything the permission layer needs about an event in one query.
 * Returns `null` when the event does not exist, so callers can reject without a
 * second round trip.
 */
export async function getEventPlanContext(
  eventId: string,
): Promise<EventPlanContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, plan_id, date, is_active, storage_used_bytes")
    .eq("id", eventId)
    .single();

  if (error || !data) {
    console.error("[getEventPlanContext] Error fetching event:", error);
    return null;
  }

  const parsed = EventPlanContextSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEventPlanContext] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error(
      "[getEventPlanContext] Raw data:",
      JSON.stringify(data, null, 2),
    );
    return null;
  }

  return parsed.data;
}

/**
 * Verifies the caller owns the event and that the event's plan includes the
 * feature. Throws so server actions can guard in a single line.
 */
export async function requireOwnedEventFeature({
  eventId,
  feature,
}: {
  eventId: string;
  feature: PlanFeature;
}): Promise<EventPlanContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: owned } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!owned) {
    throw new Error("Event not found or unauthorized");
  }

  const context = await getEventPlanContext(eventId);

  if (!context) {
    throw new Error("Event not found");
  }

  if (!hasFeature({ plan: context.plan_id, feature })) {
    throw new Error(`Plan ${context.plan_id} does not include ${feature}`);
  }

  return context;
}

/**
 * Non-throwing variant for actions that already resolved ownership and return
 * `{ success: false, error }` instead of throwing.
 */
export async function checkOwnedEventFeature({
  eventId,
  feature,
}: {
  eventId: string;
  feature: PlanFeature;
}): Promise<{ allowed: boolean; context: EventPlanContext | null }> {
  const context = await getEventPlanContext(eventId);

  if (!context) {
    return { allowed: false, context: null };
  }

  return {
    allowed: hasFeature({ plan: context.plan_id, feature }),
    context,
  };
}
