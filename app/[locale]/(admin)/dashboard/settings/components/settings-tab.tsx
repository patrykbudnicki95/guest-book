"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signOut } from "@/app/actions/auth-actions";
import {
  setEventPlan,
  updateEventSettings,
} from "@/app/actions/settings-actions";
import type { EventSettings } from "@/app/actions/settings-actions";
import { hasFeature } from "@/lib/permissions";
import { PLAN_IDS, PLAN_LABELS } from "@/lib/pricing";
import { PlanLock } from "../../components/plan-lock";
import {
  eventSettingsFormSchema,
  type EventSettingsFormValues,
} from "../schemas/settings-schema";
import { toast } from "sonner";

interface SettingsTabProps {
  events: EventSettings[];
}

const planSwitcherEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PLAN_SWITCHER === "true";

export function SettingsTab({ events }: SettingsTabProps) {
  const t = useTranslations("dashboard.settings");
  const tAccount = useTranslations("dashboard.settings.account");
  const tPrivacy = useTranslations("dashboard.settings.privacy");
  const tDanger = useTranslations("dashboard.settings.dangerZone");
  const tPlan = useTranslations("dashboard.settings.planSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const effectiveEventId = selectedEventId ?? events[0]?.id ?? null;
  const selectedEvent =
    events.find((e) => e.id === effectiveEventId) ?? events[0] ?? null;
  const canBrand = hasFeature({
    plan: selectedEvent?.plan_id ?? "basic",
    feature: "customBranding",
  });

  const form = useForm<EventSettingsFormValues>({
    resolver: zodResolver(eventSettingsFormSchema),
    defaultValues: {
      names: "",
      date: "",
      location: "",
      theme_color: "",
    },
  });

  useEffect(() => {
    const event =
      events.find((e) => e.id === effectiveEventId) ?? events[0];
    if (event) {
      form.reset({
        names: event.names,
        date: event.date ? event.date.split("T")[0] : "",
        location: event.location ?? "",
        theme_color: event.theme_color ?? "",
      });
    }
  }, [effectiveEventId, events, form]);

  const handleSave = (values: EventSettingsFormValues) => {
    if (!effectiveEventId) return;

    startTransition(async () => {
      const result = await updateEventSettings(effectiveEventId, values);

      if (result.success) {
        toast.success(t("saveSuccess"));
      } else {
        toast.error(result.error ?? t("saveError"));
      }
    });
  };

  const handlePlanChange = (planId: string) => {
    if (!effectiveEventId) return;

    startTransition(async () => {
      const result = await setEventPlan(effectiveEventId, planId);

      if (result.success) {
        toast.success(tPlan("updated", { plan: planId }));
        router.refresh();
      } else {
        toast.error(result.error ?? t("saveError"));
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
      } catch (error: unknown) {
        const err = error as { message?: string; name?: string; digest?: string };

        if (err?.digest?.includes("NEXT_REDIRECT")) {
          return;
        }

        toast.error(t("saveError"));
        console.error(error);
      }
    });
  };

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia</CardTitle>
            <CardDescription>Zarządzaj ustawieniami wydarzenia</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("noEvents")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.length > 1 && (
            <div className="space-y-2">
              <Label>Wydarzenie</Label>
              <Select
                value={effectiveEventId ?? ""}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="w-full">
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("eventName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("eventNamePlaceholder")}
                        disabled={!selectedEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("eventDate")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        disabled={!selectedEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("location")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("locationPlaceholder")}
                        disabled={!selectedEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canBrand ? (
                <FormField
                  control={form.control}
                  name="theme_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("themeColor")}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="h-10 w-14 p-1 cursor-pointer"
                            value={field.value || "#000000"}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={!selectedEvent}
                          />
                          <Input
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                            disabled={!selectedEvent}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <Label>{t("themeColor")}</Label>
                  <PlanLock feature="customBranding" />
                </div>
              )}
              <Button type="submit" disabled={isPending || !selectedEvent} className="rounded-full">
                {isPending ? t("saving") : t("save")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {planSwitcherEnabled && effectiveEventId && (
        <Card className="rounded-xl border-0 border-dashed shadow-sm ring-1 ring-amber-200">
          <CardHeader>
            <CardTitle>{tPlan("title")}</CardTitle>
            <CardDescription>{tPlan("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>{tPlan("label")}</Label>
            <Select
              value={selectedEvent?.plan_id ?? "basic"}
              onValueChange={handlePlanChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_IDS.map((planId) => (
                  <SelectItem key={planId} value={planId}>
                    {PLAN_LABELS[planId]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{tPrivacy("title")}</CardTitle>
          <CardDescription>{tPrivacy("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-viewing">{tPrivacy("publicViewing")}</Label>
              <p className="text-sm text-muted-foreground">{tPrivacy("publicViewingDesc")}</p>
            </div>
            <Switch id="public-viewing" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="moderation">{tPrivacy("moderation")}</Label>
              <p className="text-sm text-muted-foreground">{tPrivacy("moderationDesc")}</p>
            </div>
            <Switch id="moderation" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{tAccount("title")}</CardTitle>
          <CardDescription>{tAccount("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? tAccount("signingOut") : tAccount("signOut")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{tDanger("title")}</CardTitle>
          <CardDescription>{tDanger("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">{tDanger("deleteEvent")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
