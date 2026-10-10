"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EventSettingsSchema,
  EventSettingsUpdateSchema,
  ProductIdsSchema,
} from "@/lib/schemas/database";
import { hasFeature } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";
import type { Database } from "@/types/supabase";

export type EventSettings = z.infer<typeof EventSettingsSchema>;

export async function getEventSettingsList(userId: string): Promise<EventSettings[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, names, date, location, theme_color, products")
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
    .select("id, names, date, location, theme_color, products")
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

  // The colour picker is part of custom branding (the guestbook app), so other
  // events keep whatever colour they have rather than having it cleared.
  if (hasFeature({ products: planContext.products, feature: "customBranding" })) {
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
 * Development-only stand-in for checkout: sets what the event owns, so the
 * dashboard can be tried as Gold or as any single app. Owners can't write
 * `products` themselves, hence the service-role client. The flag is re-read on
 * the server, so flipping it in the client bundle is not enough.
 */
export async function setEventProducts(
  eventId: string,
  products: string[],
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NEXT_PUBLIC_ENABLE_PLAN_SWITCHER !== "true") {
    return { success: false, error: "Product switching is disabled" };
  }

  const parsed = ProductIdsSchema.safeParse([...new Set(products)]);
  if (!parsed.success) {
    return { success: false, error: "Unknown product" };
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

  const { error } = await createAdminClient()
    .from("events")
    // @ts-expect-error Supabase update() infers 'never' - types/supabase.ts events.Update is correct
    .update({ products: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    console.error("[setEventProducts] Error updating products:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
