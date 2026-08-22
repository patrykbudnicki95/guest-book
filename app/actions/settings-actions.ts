"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  EventSettingsSchema,
  EventSettingsUpdateSchema,
  PlanIdSchema,
} from "@/lib/schemas/database";
import { hasFeature } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";
import type { Database } from "@/types/supabase";

export type EventSettings = z.infer<typeof EventSettingsSchema>;

export async function getEventSettingsList(userId: string): Promise<EventSettings[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, names, date, location, theme_color, plan_id")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getEventSettingsList] Error fetching events:", error);
    return [];
  }

  const parsed = z.array(EventSettingsSchema).safeParse(data);
  if (!parsed.success) {
    console.error("[getEventSettingsList] Zod validation failed:", z.prettifyError(parsed.error));
    console.error("[getEventSettingsList] Raw data:", JSON.stringify(data, null, 2));
    return [];
  }

  return parsed.data;
}

export async function getEventSettings(
  eventId: string,
  userId: string,
): Promise<EventSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, names, date, location, theme_color, plan_id")
    .eq("id", eventId)
    .eq("owner_id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("[getEventSettings] Error fetching event:", error);
    return null;
  }

  const parsed = EventSettingsSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[getEventSettings] Zod validation failed:", z.prettifyError(parsed.error));
    console.error("[getEventSettings] Raw data:", JSON.stringify(data, null, 2));
    return null;
  }

  return parsed.data;
}

export async function updateEventSettings(
  eventId: string,
  data: z.infer<typeof EventSettingsUpdateSchema>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = EventSettingsUpdateSchema.safeParse(data);
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
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const planContext = await getEventPlanContext(eventId);
  if (!planContext) {
    return { success: false, error: "Nie znaleziono wydarzenia" };
  }

  const updateData: Database["public"]["Tables"]["events"]["Update"] = {
    names: parsed.data.names,
    date: parsed.data.date,
    location: parsed.data.location ?? null,
    updated_at: new Date().toISOString(),
  };

  // The colour picker is part of custom branding, so lower plans keep whatever
  // colour they already have rather than silently having it cleared.
  if (hasFeature({ plan: planContext.plan_id, feature: "customBranding" })) {
    updateData.theme_color = parsed.data.theme_color ?? null;
  }

  const { error } = await supabase
    .from("events")
    // @ts-expect-error Supabase update() infers 'never' - types/supabase.ts events.Update is correct
    .update(updateData)
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[updateEventSettings] Error updating event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Development-only escape hatch for exercising all three tiers without a
 * checkout flow. The flag is re-read from the server environment so flipping the
 * client bundle is not enough to call this.
 */
export async function setEventPlan(
  eventId: string,
  planId: string,
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NEXT_PUBLIC_ENABLE_PLAN_SWITCHER !== "true") {
    return { success: false, error: "Plan switching is disabled" };
  }

  const parsedPlan = PlanIdSchema.safeParse(planId);
  if (!parsedPlan.success) {
    return { success: false, error: "Nieznany pakiet" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const { error } = await supabase
    .from("events")
    // @ts-expect-error Supabase update() infers 'never' - types/supabase.ts events.Update is correct
    .update({ plan_id: parsedPlan.data, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[setEventPlan] Error updating plan:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
