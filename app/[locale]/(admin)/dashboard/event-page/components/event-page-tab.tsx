"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Plus, Trash2, Upload, Save } from "lucide-react";
import {
  updateEventPageContent,
  getPresignedUrlForCoverPhoto,
} from "@/app/actions/event-page-actions";
import { hasFeature } from "@/lib/permissions";
import { PlanLock } from "../../components/plan-lock";
import type {
  EventFull,
  ScheduleItem,
  MenuSection,
} from "@/lib/schemas/database";

interface EventPageTabProps {
  events: EventFull[];
}

export function EventPageTab({ events }: EventPageTabProps) {
  const t = useTranslations("dashboard.eventPage");
  const [isPending, startTransition] = useTransition();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [menu, setMenu] = useState<MenuSection[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);

  const effectiveEventId = selectedEventId ?? events[0]?.id ?? null;
  const selectedEvent =
    events.find((e) => e.id === effectiveEventId) ?? events[0] ?? null;

  const plan = selectedEvent?.plan_id ?? "basic";
  const canBrand = hasFeature({ plan, feature: "customBranding" });
  const canEditSchedule = hasFeature({ plan, feature: "schedule" });
  const canEditMenu = hasFeature({ plan, feature: "menu" });

  useEffect(() => {
    if (selectedEvent) {
      setWelcomeMessage(selectedEvent.welcome_message ?? "");
      setCoverPhotoUrl(selectedEvent.cover_photo_url);
      setSchedule(selectedEvent.schedule ?? []);
      setMenu(selectedEvent.menu ?? []);
    }
  }, [selectedEvent]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveEventId) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("cover.invalidType"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("cover.tooLarge"));
      return;
    }

    setUploadingCover(true);
    try {
      const { uploadUrl, publicUrl } = await getPresignedUrlForCoverPhoto(
        file.name,
        file.type,
        effectiveEventId,
      );

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
          if (xhr.status === 200 || xhr.status === 204) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setCoverPhotoUrl(publicUrl);
      toast.success(t("cover.uploadSuccess"));
    } catch (error) {
      console.error("[handleCoverUpload]", error);
      toast.error(t("cover.uploadError"));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = () => {
    if (!effectiveEventId) return;

    startTransition(async () => {
      // Locked fields are left out entirely so the action does not reject the
      // whole save over a surface the couple cannot even see.
      const result = await updateEventPageContent(effectiveEventId, {
        welcome_message: welcomeMessage || null,
        ...(canBrand ? { cover_photo_url: coverPhotoUrl } : {}),
        ...(canEditSchedule
          ? { schedule: schedule.length > 0 ? schedule : null }
          : {}),
        ...(canEditMenu ? { menu: menu.length > 0 ? menu : null } : {}),
      });

      if (result.success) {
        toast.success(t("saveSuccess"));
      } else {
        toast.error(result.error ?? t("saveError"));
      }
    });
  };

  const addScheduleItem = () => {
    setSchedule((prev) => [...prev, { time: "", title: "", description: "" }]);
  };

  const updateScheduleItem = (
    index: number,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeScheduleItem = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const addMenuSection = () => {
    setMenu((prev) => [...prev, { title: "", items: [{ name: "" }] }]);
  };

  const updateMenuSectionTitle = (index: number, title: string) => {
    setMenu((prev) =>
      prev.map((section, i) => (i === index ? { ...section, title } : section)),
    );
  };

  const addMenuItem = (sectionIndex: number) => {
    setMenu((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, items: [...section.items, { name: "" }] }
          : section,
      ),
    );
  };

  const updateMenuItem = (
    sectionIndex: number,
    itemIndex: number,
    name: string,
  ) => {
    setMenu((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, ii) =>
                ii === itemIndex ? { ...item, name } : item,
              ),
            }
          : section,
      ),
    );
  };

  const removeMenuItem = (sectionIndex: number, itemIndex: number) => {
    setMenu((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              items: section.items.filter((_, ii) => ii !== itemIndex),
            }
          : section,
      ),
    );
  };

  const removeMenuSection = (index: number) => {
    setMenu((prev) => prev.filter((_, i) => i !== index));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending || !effectiveEventId}
          className="rounded-full shadow-md shadow-primary/20"
        >
          <Save className="mr-2 size-4" />
          {isPending ? t("saving") : t("save")}
        </Button>
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

      {/* Cover Photo */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("cover.title")}</CardTitle>
          <CardDescription>{t("cover.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canBrand ? (
            <PlanLock feature="customBranding" />
          ) : coverPhotoUrl ? (
            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl">
              <Image
                src={coverPhotoUrl}
                alt="Cover"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full max-w-lg items-center justify-center rounded-xl border-2 border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {t("cover.empty")}
              </p>
            </div>
          )}
          <div className={canBrand ? "flex gap-2" : "hidden"}>
            <Label
              htmlFor="cover-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
            >
              <Upload className="size-4" />
              {uploadingCover ? t("cover.uploading") : t("cover.upload")}
            </Label>
            <Input
              id="cover-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
            {coverPhotoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setCoverPhotoUrl(null)}
              >
                <Trash2 className="mr-1 size-3.5" />
                {t("cover.remove")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("welcome.title")}</CardTitle>
          <CardDescription>{t("welcome.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder={t("welcome.placeholder")}
            rows={4}
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("schedule.title")}</CardTitle>
              <CardDescription>{t("schedule.description")}</CardDescription>
            </div>
            {canEditSchedule && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={addScheduleItem}
              >
                <Plus className="mr-1 size-3.5" />
                {t("schedule.add")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!canEditSchedule && <PlanLock feature="schedule" />}
          {canEditSchedule && schedule.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("schedule.empty")}
            </p>
          )}
          {canEditSchedule &&
            schedule.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start"
              >
                <Input
                  value={item.time}
                  onChange={(e) =>
                    updateScheduleItem(index, "time", e.target.value)
                  }
                  placeholder={t("schedule.timePlaceholder")}
                  className="rounded-lg sm:w-28"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateScheduleItem(index, "title", e.target.value)
                    }
                    placeholder={t("schedule.titlePlaceholder")}
                    className="rounded-lg"
                  />
                  <Input
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateScheduleItem(index, "description", e.target.value)
                    }
                    placeholder={t("schedule.descPlaceholder")}
                    className="rounded-lg"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeScheduleItem(index)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Menu */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("menu.title")}</CardTitle>
              <CardDescription>{t("menu.description")}</CardDescription>
            </div>
            {canEditMenu && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={addMenuSection}
              >
                <Plus className="mr-1 size-3.5" />
                {t("menu.addSection")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canEditMenu && <PlanLock feature="menu" />}
          {canEditMenu && menu.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("menu.empty")}
            </p>
          )}
          {canEditMenu &&
            menu.map((section, sIndex) => (
              <div key={sIndex} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateMenuSectionTitle(sIndex, e.target.value)
                    }
                    placeholder={t("menu.sectionPlaceholder")}
                    className="rounded-lg font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMenuSection(sIndex)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2 pl-2">
                  {section.items.map((item, iIndex) => (
                    <div key={iIndex} className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateMenuItem(sIndex, iIndex, e.target.value)
                        }
                        placeholder={t("menu.itemPlaceholder")}
                        className="rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMenuItem(sIndex, iIndex)}
                        className="shrink-0 text-muted-foreground"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addMenuItem(sIndex)}
                    className="text-primary"
                  >
                    <Plus className="mr-1 size-3.5" />
                    {t("menu.addItem")}
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button
          onClick={handleSave}
          disabled={isPending || !effectiveEventId}
          size="lg"
          className="rounded-full shadow-md shadow-primary/20"
        >
          <Save className="mr-2 size-4" />
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
