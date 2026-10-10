"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Camera,
  Copy,
  ExternalLink,
  Eye,
  Leaf,
  Loader2,
  Mail,
  Music,
  Newspaper,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { formatBytes, hasFeature } from "@/lib/permissions";
import {
  SAVE_THE_DATE_ASSETS,
  SAVE_THE_DATE_PALETTES,
  SAVE_THE_DATE_TEMPLATE_DEFAULTS,
  createSaveTheDateContent,
  type SaveTheDateAssetKind,
  type SaveTheDatePaletteId,
} from "@/lib/save-the-date";
import {
  SAVE_THE_DATE_FONTS,
  SAVE_THE_DATE_TEMPLATES,
  type SaveTheDateContent,
  type SaveTheDateTemplate,
  type SaveTheDateUpdate,
} from "@/lib/schemas/database";
import {
  getPresignedUrlForSaveTheDateAsset,
  updateSaveTheDate,
  type SaveTheDateEvent,
} from "@/app/actions/save-the-date-actions";
import { SaveTheDateView } from "@/components/save-the-date/save-the-date-view";
import { PhoneFrame } from "@/components/save-the-date/device-frame";
import { fontVariables } from "@/components/save-the-date/fonts";
import { PlanLock } from "../../components/plan-lock";

const TEMPLATE_ICONS: Record<SaveTheDateTemplate, typeof Mail> = {
  envelope: Mail,
  editorial: Newspaper,
  polaroid: Camera,
  botanical: Leaf,
};

const PALETTE_IDS = Object.keys(SAVE_THE_DATE_PALETTES) as SaveTheDatePaletteId[];

const COLOR_FIELDS = ["background", "text", "accent"] as const;

const KNOWN_ERRORS = ["planUpgradeRequired", "invalidFileType", "fileTooLarge"] as const;

type Draft = SaveTheDateUpdate;

interface SaveTheDateTabProps {
  events: SaveTheDateEvent[];
  /** The demo links to its own settings and guest pages. */
  variant?: "app" | "demo";
  onSave?: (
    eventId: string,
    data: SaveTheDateUpdate,
  ) => Promise<{ success: boolean; error?: string }>;
  /** The demo keeps files in the browser and returns an object URL. */
  onUploadAsset?: (kind: SaveTheDateAssetKind, file: File) => Promise<{ url: string }>;
}

export function SaveTheDateTab({
  events,
  variant = "app",
  onSave,
  onUploadAsset,
}: SaveTheDateTabProps) {
  const t = useTranslations("dashboard.saveTheDate");
  const tTemplates = useTranslations("saveTheDate.templates");
  const tPalettes = useTranslations("saveTheDate.palettes");
  const tFonts = useTranslations("saveTheDate.fonts");
  const tDefaults = useTranslations("saveTheDate.defaults");
  const locale = useLocale() as AppLocale;
  const [isPending, startTransition] = useTransition();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<SaveTheDateAssetKind | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const effectiveEventId = selectedEventId ?? events[0]?.id ?? null;
  const selectedEvent =
    events.find((e) => e.id === effectiveEventId) ?? events[0] ?? null;

  const initialDraft = (event: SaveTheDateEvent | null): Draft | null =>
    event
      ? (event.saveTheDate ?? {
          template: "envelope",
          is_published: false,
          content: createSaveTheDateContent({
            template: "envelope",
            names: event.names,
            location: event.location ?? "",
            eyebrow: tDefaults("eyebrow"),
            message: tDefaults("message"),
          }),
        })
      : null;

  const [draft, setDraft] = useState<Draft | null>(() => initialDraft(selectedEvent));
  // Reload the draft when another event is picked or fresh data arrives.
  const [loadedEvent, setLoadedEvent] = useState(selectedEvent);
  if (selectedEvent !== loadedEvent) {
    setLoadedEvent(selectedEvent);
    setDraft(initialDraft(selectedEvent));
  }

  const canEdit = selectedEvent
    ? hasFeature({ products: selectedEvent.products, feature: "saveTheDate" })
    : false;

  const guestHref =
    variant === "demo"
      ? ("/demo/save-the-date" as const)
      : {
          pathname: "/e/[eventId]/save-the-date" as const,
          params: { eventId: effectiveEventId ?? "" },
        };
  const settingsHref =
    variant === "demo" ? "/demo/dashboard/settings" : "/dashboard/settings";

  if (events.length === 0 || !selectedEvent || !draft) {
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

  const content = draft.content;

  const updateContent = (patch: Partial<SaveTheDateContent>) => {
    setDraft((prev) => (prev ? { ...prev, content: { ...prev.content, ...patch } } : prev));
  };

  const chooseTemplate = (template: SaveTheDateTemplate) => {
    const defaults = SAVE_THE_DATE_TEMPLATE_DEFAULTS[template];
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            template,
            content: {
              ...prev.content,
              font: defaults.font,
              colors: { ...SAVE_THE_DATE_PALETTES[defaults.palette] },
            },
          }
        : prev,
    );
  };

  const errorMessage = (error?: string) => {
    const known = KNOWN_ERRORS.find((code) => code === error);
    return known ? t(`errors.${known}`) : (error ?? t("saveError"));
  };

  const handleUpload = async (kind: SaveTheDateAssetKind, file: File | undefined) => {
    if (!file) return;
    const rules = SAVE_THE_DATE_ASSETS[kind];

    if (!(rules.types as readonly string[]).includes(file.type)) {
      toast.error(t(`${kind}.invalidType`));
      return;
    }
    if (file.size > rules.maxBytes) {
      toast.error(t("upload.tooLarge", { size: formatBytes(rules.maxBytes) }));
      return;
    }

    setUploading(kind);
    try {
      let url: string;
      if (onUploadAsset) {
        ({ url } = await onUploadAsset(kind, file));
      } else {
        const presign = await getPresignedUrlForSaveTheDateAsset({
          eventId: selectedEvent.id,
          kind,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        if (!presign.success) {
          toast.error(errorMessage(presign.error));
          return;
        }
        const response = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        url = presign.publicUrl;
      }

      updateContent(kind === "photo" ? { photo_url: url } : { music_url: url });
      toast.success(t("upload.success"));
    } catch (error) {
      console.error("[SaveTheDateTab.handleUpload]", error);
      toast.error(t("upload.error"));
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    const payload: SaveTheDateUpdate = {
      ...draft,
      content: { ...content, names: content.names.trim() || selectedEvent.names },
    };

    startTransition(async () => {
      const result = onSave
        ? await onSave(selectedEvent.id, payload)
        : await updateSaveTheDate(selectedEvent.id, payload);

      if (result.success) {
        toast.success(t("saveSuccess"));
      } else {
        toast.error(errorMessage(result.error));
      }
    });
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${getPathname({ href: guestHref, locale })}`;
    await navigator.clipboard.writeText(url);
    toast.success(t("share.copied"));
  };

  const preview = (
    <div className="space-y-3">
      <PhoneFrame>
        <SaveTheDateView
          key={`${draft.template}-${replayKey}`}
          template={draft.template}
          content={content}
          date={selectedEvent.date}
        />
      </PhoneFrame>
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setReplayKey((key) => key + 1)}
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          {t("preview.replay")}
        </Button>
      </div>
    </div>
  );

  const saveButton = (size?: "lg") => (
    <Button
      onClick={handleSave}
      disabled={isPending || uploading !== null}
      size={size}
      className="rounded-full shadow-md shadow-primary/20"
    >
      <Save className="mr-2 size-4" />
      {isPending ? t("saving") : t("save")}
    </Button>
  );

  const assetField = (kind: SaveTheDateAssetKind) => {
    const url = kind === "photo" ? content.photo_url : content.music_url;
    const Icon = kind === "photo" ? Camera : Music;
    return (
      <div className="space-y-3">
        {url && kind === "music" && (
          <audio src={url} controls className="w-full" preload="none" />
        )}
        {url && kind === "photo" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-40 w-full rounded-lg object-cover" />
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full" disabled={uploading !== null}>
            <label className="cursor-pointer">
              {uploading === kind ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : url ? (
                <Upload className="mr-1.5 size-3.5" />
              ) : (
                <Icon className="mr-1.5 size-3.5" />
              )}
              {url ? t(`${kind}.replace`) : t(`${kind}.add`)}
              <input
                type="file"
                accept={SAVE_THE_DATE_ASSETS[kind].types.join(",")}
                className="sr-only"
                disabled={uploading !== null}
                onChange={(e) => {
                  void handleUpload(kind, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-destructive hover:text-destructive"
              onClick={() => updateContent(kind === "photo" ? { photo_url: null } : { music_url: null })}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              {t(`${kind}.remove`)}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t(`${kind}.hint`, { size: formatBytes(SAVE_THE_DATE_ASSETS[kind].maxBytes) })}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {canEdit && <div className="hidden sm:block">{saveButton()}</div>}
      </div>

      {events.length > 1 && (
        <div className="space-y-2">
          <Label>{t("selectEvent")}</Label>
          <Select value={effectiveEventId ?? ""} onValueChange={setSelectedEventId}>
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
            <PlanLock feature="saveTheDate" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="space-y-6">
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="std-published" className="text-base">
                      {t("publish.label")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {draft.is_published ? t("publish.on") : t("publish.off")}
                    </p>
                  </div>
                  <Switch
                    id="std-published"
                    checked={draft.is_published}
                    onCheckedChange={(is_published) =>
                      setDraft((prev) => (prev ? { ...prev, is_published } : prev))
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={copyLink}>
                    <Copy className="mr-1.5 size-3.5" />
                    {t("share.copy")}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={guestHref} target="_blank">
                      <ExternalLink className="mr-1.5 size-3.5" />
                      {t("share.open")}
                    </Link>
                  </Button>
                </div>
                <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  {t("share.hint")}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("template.title")}</CardTitle>
                <CardDescription>{t("template.description")}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {SAVE_THE_DATE_TEMPLATES.map((template) => {
                  const Icon = TEMPLATE_ICONS[template];
                  const palette =
                    SAVE_THE_DATE_PALETTES[SAVE_THE_DATE_TEMPLATE_DEFAULTS[template].palette];
                  const active = draft.template === template;
                  return (
                    <button
                      key={template}
                      type="button"
                      onClick={() => chooseTemplate(template)}
                      aria-pressed={active}
                      className={cn(
                        "overflow-hidden rounded-xl border text-left transition-all",
                        active ? "border-primary ring-2 ring-primary/30" : "hover:border-foreground/30",
                      )}
                    >
                      <div
                        className="flex h-20 items-center justify-center"
                        style={{ background: palette.background, color: palette.accent }}
                      >
                        <Icon className="size-7" strokeWidth={1.25} />
                      </div>
                      <div className="space-y-0.5 p-3">
                        <p className="text-sm font-semibold">{tTemplates(`${template}.name`)}</p>
                        <p className="text-xs leading-snug text-muted-foreground">
                          {tTemplates(`${template}.description`)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("text.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="std-names">{t("text.names")}</Label>
                    <Input
                      id="std-names"
                      value={content.names}
                      maxLength={80}
                      onChange={(e) => updateContent({ names: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="std-eyebrow">{t("text.eyebrow")}</Label>
                    <Input
                      id="std-eyebrow"
                      value={content.eyebrow}
                      maxLength={60}
                      onChange={(e) => updateContent({ eyebrow: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="std-location">{t("text.location")}</Label>
                  <Input
                    id="std-location"
                    value={content.location}
                    maxLength={120}
                    placeholder={t("text.locationPlaceholder")}
                    onChange={(e) => updateContent({ location: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="std-message">{t("text.message")}</Label>
                  <Textarea
                    id="std-message"
                    value={content.message}
                    maxLength={600}
                    rows={4}
                    onChange={(e) => updateContent({ message: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.rich("text.dateNote", {
                    link: (chunks) => (
                      <Link href={settingsHref} className="font-medium text-primary underline-offset-4 hover:underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("style.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("style.palette")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE_IDS.map((id) => {
                      const palette = SAVE_THE_DATE_PALETTES[id];
                      const active = COLOR_FIELDS.every(
                        (field) => content.colors[field].toLowerCase() === palette[field],
                      );
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => updateContent({ colors: { ...palette } })}
                          aria-pressed={active}
                          className={cn(
                            "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-all",
                            active ? "border-primary ring-2 ring-primary/30" : "hover:border-foreground/30",
                          )}
                        >
                          <span
                            className="relative size-6 overflow-hidden rounded-full border"
                            style={{ background: palette.background }}
                          >
                            <span
                              className="absolute inset-y-0 right-0 w-1/2"
                              style={{ background: palette.accent }}
                            />
                          </span>
                          {tPalettes(id)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {COLOR_FIELDS.map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Label htmlFor={`std-color-${field}`} className="text-xs text-muted-foreground">
                        {t(`style.colors.${field}`)}
                      </Label>
                      <Input
                        id={`std-color-${field}`}
                        type="color"
                        value={content.colors[field]}
                        onChange={(e) =>
                          updateContent({ colors: { ...content.colors, [field]: e.target.value } })
                        }
                        className="h-10 cursor-pointer rounded-lg p-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>{t("style.font")}</Label>
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                    {SAVE_THE_DATE_FONTS.map((font) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => updateContent({ font })}
                        aria-pressed={content.font === font}
                        style={fontVariables(font) as React.CSSProperties}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left transition-all",
                          content.font === font
                            ? "border-primary ring-2 ring-primary/30"
                            : "hover:border-foreground/30",
                        )}
                      >
                        <span className="block truncate font-(family-name:--std-display) text-2xl leading-tight">
                          {content.names || selectedEvent.names}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{tFonts(font)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("media.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("photo.label")}</Label>
                  {assetField("photo")}
                </div>
                <div className="space-y-2">
                  <Label>{t("music.label")}</Label>
                  {assetField("music")}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["show_countdown", "show_calendar"] as const).map((field) => (
                  <div key={field} className="flex items-center justify-between gap-4">
                    <Label htmlFor={`std-${field}`} className="font-normal">
                      {t(`sections.${field}`)}
                    </Label>
                    <Switch
                      id={`std-${field}`}
                      checked={content[field]}
                      onCheckedChange={(checked) => updateContent({ [field]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pb-8">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="lg" className="rounded-full lg:hidden">
                    <Eye className="mr-2 size-4" />
                    {t("preview.open")}
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[96dvh]">
                  <DrawerHeader>
                    <DrawerTitle>{t("preview.title")}</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-y-auto px-4 pb-6">{preview}</div>
                </DrawerContent>
              </Drawer>
              {saveButton("lg")}
            </div>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">{preview}</aside>
        </div>
      )}
    </div>
  );
}
