"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserEventForPdf } from "@/app/actions/dashboard-actions";
import type { PdfTheme } from "./qr-code-pdf";

interface QRCodeTabProps {
  events: UserEventForPdf[];
}

const THEMES: { id: PdfTheme; previewClass: string; accentClass: string }[] = [
  {
    id: "elegant",
    previewClass: "bg-[#FFFEF9] border-[#C9A84C]",
    accentClass: "text-[#C9A84C]",
  },
  {
    id: "floral",
    previewClass: "bg-[#FFF5F7] border-[#F8BBD0]",
    accentClass: "text-[#C2185B]",
  },
  {
    id: "bold",
    previewClass: "bg-[#1A1A2E] border-[#E91E63]",
    accentClass: "text-[#E91E63]",
  },
];

export function QRCodeTab({ events }: QRCodeTabProps) {
  const t = useTranslations("dashboard.qrCode");
  const tPdf = useTranslations("qrPdf");
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loadingQRCodes, setLoadingQRCodes] = useState<Set<string>>(new Set());
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<PdfTheme>("elegant");

  useEffect(() => {
    const generateQRCodes = async () => {
      if (events.length === 0) return;

      const newQRCodes: Record<string, string> = {};
      const loadingSet = new Set<string>();

      for (const event of events) {
        loadingSet.add(event.id);
        try {
          const eventUrl = `${window.location.origin}/e/${event.id}`;
          const dataUrl = await QRCode.toDataURL(eventUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          newQRCodes[event.id] = dataUrl;
        } catch (error) {
          console.error(`[QRCodeTab] Failed to generate QR code for event ${event.id}:`, error);
          toast.error(t("failed"));
        } finally {
          loadingSet.delete(event.id);
        }
      }

      setQrCodes(newQRCodes);
      setLoadingQRCodes(loadingSet);
    };

    generateQRCodes();
  }, [events, t]);

  const handleGeneratePDF = async (event: UserEventForPdf) => {
    const qrCodeDataUrl = qrCodes[event.id];
    if (!qrCodeDataUrl) return;

    setGeneratingPDF(event.id);
    try {
      const { generateQRCodePDF } = await import("./qr-code-pdf");
      const eventUrl = `${window.location.origin}/e/${event.id}`;
      await generateQRCodePDF(
        event.names,
        qrCodeDataUrl,
        eventUrl,
        tPdf("instruction"),
        selectedTheme,
        event.date,
        event.location,
      );
      toast.success(t("pdfSuccess"));
    } catch (error) {
      console.error("[handleGeneratePDF] Failed to generate PDF:", error);
      toast.error(t("pdfError"));
    } finally {
      setGeneratingPDF(null);
    }
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
      {/* Theme selector */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("theme.title")}</CardTitle>
          <CardDescription>{t("theme.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    theme.previewClass,
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  {isSelected && (
                    <div className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="size-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-lg text-lg font-bold",
                      theme.id === "bold" ? "text-white" : theme.accentClass,
                    )}
                  >
                    Aa
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      theme.id === "bold" ? "text-white" : "text-foreground",
                    )}
                  >
                    {t(`theme.${theme.id}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event QR cards */}
      {events.map((event) => {
        const qrCodeDataUrl = qrCodes[event.id];
        const isLoading = loadingQRCodes.has(event.id);
        const isGeneratingPDF = generatingPDF === event.id;

        return (
          <Card key={event.id} className="rounded-xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle>{event.names}</CardTitle>
              <CardDescription>{t("shareDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="size-64 animate-pulse rounded-lg bg-muted" />
                    <p className="text-sm text-muted-foreground">{t("generating")}</p>
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-lg border bg-white p-4">
                      <Image
                        src={qrCodeDataUrl}
                        alt={`QR Code for ${event.names}`}
                        width={300}
                        height={300}
                        className="size-auto"
                      />
                    </div>
                    <p className="max-w-sm text-center text-xs text-muted-foreground">
                      {`${window.location.origin}/e/${event.id}`}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-sm text-muted-foreground">{t("failed")}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => handleGeneratePDF(event)}
                  disabled={isGeneratingPDF || isLoading || !qrCodeDataUrl}
                  size="lg"
                  className="rounded-full shadow-md shadow-primary/20"
                >
                  <Download className="mr-2 size-4" />
                  {isGeneratingPDF ? t("generatingPdf") : t("generatePdf")}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
