"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockGenerateQRCode } from "@/app/actions/mock-actions";
import { toast } from "sonner";
import { QrCode, Download } from "lucide-react";

export function QRCodeTab() {
  const [isPending, startTransition] = useTransition();

  const handleGenerateQRCode = () => {
    startTransition(async () => {
      try {
        console.log("[MOCK] Generating QR Code PDF...");
        const result = await mockGenerateQRCode("mock-event-123");
        
        if (result.success) {
          toast.success("QR Code PDF generated successfully!");
          // In a real app, this would trigger a download
          console.log("[MOCK] PDF URL:", result.pdfUrl);
        } else {
          toast.error("Failed to generate QR Code");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Generate a downloadable QR code PDF for your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
            <QrCode className="mb-4 size-16 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium">Event QR Code</p>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Click the button below to generate a QR code PDF that guests can scan
              to access your event page.
            </p>
            <Button
              onClick={handleGenerateQRCode}
              disabled={isPending}
              size="lg"
            >
              <Download className="mr-2 size-4" />
              {isPending ? "Generating..." : "Generate QR Code PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

