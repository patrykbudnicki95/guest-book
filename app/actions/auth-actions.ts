"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

/**
 * Root params (and so `getLocale()`) aren't available in Server Actions, so the
 * client passes its locale. Anything unexpected falls back to the default.
 */
function toLocale(value: string): AppLocale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

export async function login(email: string, password: string, localeInput: string) {
  const supabase = await createClient();
  const locale = toLocale(localeInput);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale });
}

export async function signup(email: string, password: string, localeInput: string) {
  const supabase = await createClient();
  const locale = toLocale(localeInput);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const dashboardPath = locale === "pl" ? "/dashboard" : "/en/dashboard";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}${dashboardPath}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale });
}

export async function signOut(localeInput: string) {
  const supabase = await createClient();
  const locale = toLocale(localeInput);
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}
