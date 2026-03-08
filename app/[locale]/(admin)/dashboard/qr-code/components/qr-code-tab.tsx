"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download } from "lucide-react";
import type { UserEvent } from "@/app/actions/dashboard-actions";

interface QRCodeTabProps {
  events: UserEvent[];
}

export function QRCodeTab({ events }: QRCodeTabProps) {
  const t = useTranslations("dashboard.qrCode");
  const tPdf = useTranslations("qrPdf");
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loadingQRCodes, setLoadingQRCodes] = useState<Set<string>>(new Set());
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

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
  }, [events]);

  const handleGeneratePDF = async (eventId: string, eventName: string) => {
    const qrCodeDataUrl = qrCodes[eventId];
    if (!qrCodeDataUrl) return;

    setGeneratingPDF(eventId);
    try {
      const { generateQRCodePDF } = await import("./qr-code-pdf");
      const eventUrl = `${window.location.origin}/e/${eventId}`;
      await generateQRCodePDF(eventName, qrCodeDataUrl, eventUrl, tPdf("instruction"));
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
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noEvents")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const qrCodeDataUrl = qrCodes[event.id];
        const isLoading = loadingQRCodes.has(event.id);
        const isGeneratingPDF = generatingPDF === event.id;

        return (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.names}</CardTitle>
            <CardDescription>
              {t("shareDescription")}
            </CardDescription>
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
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
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
                  onClick={() => handleGeneratePDF(event.id, event.names)}
                  disabled={isGeneratingPDF || isLoading || !qrCodeDataUrl}
                  size="lg"
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

