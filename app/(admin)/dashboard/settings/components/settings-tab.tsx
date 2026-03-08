"use client";

import { useEffect, useState } from "react";
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
import { updateEventSettings } from "@/app/actions/settings-actions";
import type { EventSettings } from "@/app/actions/settings-actions";
import {
  eventSettingsFormSchema,
  type EventSettingsFormValues,
} from "../schemas/settings-schema";
import { toast } from "sonner";

interface SettingsTabProps {
  events: EventSettings[];
}

export function SettingsTab({ events }: SettingsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const effectiveEventId = selectedEventId ?? events[0]?.id ?? null;
  const selectedEvent =
    events.find((e) => e.id === effectiveEventId) ?? events[0] ?? null;

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
        toast.success("Ustawienia zostały zapisane");
      } else {
        toast.error(result.error ?? "Nie udało się zapisać");
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

        toast.error("Failed to sign out");
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
              Nie znaleziono aktywnych wydarzeń. Utwórz wydarzenie, aby edytować
              ustawienia.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia wydarzenia</CardTitle>
          <CardDescription>
            Edytuj informacje o swoim weselu
          </CardDescription>
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
                  <SelectValue placeholder="Wybierz wydarzenie" />
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
                    <FormLabel>Nazwa wydarzenia</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="np. Anna i Jan"
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
                    <FormLabel>Data wydarzenia</FormLabel>
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
                    <FormLabel>Miejsce</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nazwa lub adres miejsca"
                        disabled={!selectedEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="theme_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kolor motywu</FormLabel>
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
              <Button type="submit" disabled={isPending || !selectedEvent}>
                {isPending ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prywatność</CardTitle>
          <CardDescription>
            Kontroluj kto może przeglądać i dodawać do wydarzenia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-viewing">Publiczne przeglądanie</Label>
              <p className="text-sm text-muted-foreground">
                Zezwól każdemu z linkiem na przeglądanie zdjęć
              </p>
            </div>
            <Switch id="public-viewing" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="moderation">Wymagana moderacja</Label>
              <p className="text-sm text-muted-foreground">
                Sprawdzaj uploady przed publikacją
              </p>
            </div>
            <Switch id="moderation" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>Zarządzaj ustawieniami konta</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? "Wylogowywanie..." : "Wyloguj"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strefa niebezpieczna</CardTitle>
          <CardDescription>Nieodwracalne działania</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Usuń wydarzenie</Button>
        </CardContent>
      </Card>
    </div>
  );
}
