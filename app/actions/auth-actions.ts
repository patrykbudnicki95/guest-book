"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale: locale as "pl" | "en" });
}

export async function signup(email: string, password: string) {
  const supabase = await createClient();
  const locale = await getLocale();
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
  redirect({ href: "/dashboard", locale: locale as "pl" | "en" });
}

export async function signOut() {
  const supabase = await createClient();
  const locale = await getLocale();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale: locale as "pl" | "en" });
}
