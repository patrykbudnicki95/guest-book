import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
  Font,
  pdf,
  Svg,
  Path,
  Circle,
  Rect,
} from "@react-pdf/renderer";

export type PdfTheme = "elegant" | "floral" | "bold";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Playfair",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
  ],
});

interface QRCodePDFProps {
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  qrCodeDataUrl: string;
  eventUrl: string;
  instruction: string;
  theme: PdfTheme;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ─── Elegant / Minimal ─── */

const elegantStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    fontFamily: "Playfair",
    backgroundColor: "#FFFEF9",
  },
  border: {
    position: "absolute",
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    borderWidth: 1,
    borderColor: "#C9A84C",
  },
  innerBorder: {
    position: "absolute",
    top: 34,
    left: 34,
    right: 34,
    bottom: 34,
    borderWidth: 0.5,
    borderColor: "#E8D5A3",
  },
  names: {
    fontSize: 28,
    fontWeight: 700,
    textAlign: "center",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "#C9A84C",
    marginVertical: 14,
  },
  date: {
    fontSize: 12,
    fontWeight: 400,
    fontStyle: "italic",
    textAlign: "center",
    color: "#6B6B6B",
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    fontWeight: 400,
    textAlign: "center",
    color: "#8B8B8B",
    marginBottom: 28,
  },
  qrContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8D5A3",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  instruction: {
    fontSize: 10,
    fontWeight: 400,
    textAlign: "center",
    color: "#6B6B6B",
    maxWidth: 280,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  url: {
    fontSize: 7,
    color: "#AAAAAA",
    textAlign: "center",
  },
});

function ElegantTheme({
  eventName,
  eventDate,
  eventLocation,
  qrCodeDataUrl,
  eventUrl,
  instruction,
}: Omit<QRCodePDFProps, "theme">) {
  return (
    <Page size="A5" style={elegantStyles.page}>
      <View style={elegantStyles.border} />
      <View style={elegantStyles.innerBorder} />
      <Text style={elegantStyles.names}>{eventName}</Text>
      <View style={elegantStyles.divider} />
      <Text style={elegantStyles.date}>{formatDate(eventDate)}</Text>
      {eventLocation && (
        <Text style={elegantStyles.location}>{eventLocation}</Text>
      )}
      {!eventLocation && <View style={{ marginBottom: 28 }} />}
      <View style={elegantStyles.qrContainer}>
        <PdfImage src={qrCodeDataUrl} style={elegantStyles.qrImage} />
      </View>
      <Text style={elegantStyles.instruction}>{instruction}</Text>
      <Text style={elegantStyles.url}>{eventUrl}</Text>
    </Page>
  );
}

/* ─── Romantic / Floral ─── */

const floralStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    fontFamily: "Playfair",
    backgroundColor: "#FFF5F7",
  },
  names: {
    fontSize: 30,
    fontWeight: 400,
    fontStyle: "italic",
    textAlign: "center",
    color: "#C2185B",
    marginBottom: 6,
  },
  heart: {
    fontSize: 14,
    textAlign: "center",
    color: "#F48FB1",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: 400,
    textAlign: "center",
    color: "#AD1457",
    marginBottom: 4,
  },
  location: {
    fontSize: 10,
    fontWeight: 400,
    textAlign: "center",
    color: "#880E4F",
    opacity: 0.7,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 14,
    borderWidth: 2,
    borderColor: "#F8BBD0",
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  instruction: {
    fontSize: 10,
    fontWeight: 400,
    fontStyle: "italic",
    textAlign: "center",
    color: "#880E4F",
    maxWidth: 260,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  url: {
    fontSize: 7,
    color: "#F48FB1",
    textAlign: "center",
  },
});

function FloralCornerDecorations() {
  return (
    <>
      {/* Top-left */}
      <Svg width={70} height={70} style={{ position: "absolute", top: 16, left: 16 }}>
        <Path d="M10,60 Q10,30 40,30 Q20,30 20,10" stroke="#F8BBD0" strokeWidth={1.5} fill="none" />
        <Circle cx={18} cy={18} r={4} fill="#F8BBD0" />
        <Circle cx={38} cy={32} r={3} fill="#F48FB1" />
      </Svg>
      {/* Top-right */}
      <Svg width={70} height={70} style={{ position: "absolute", top: 16, right: 16 }}>
        <Path d="M60,60 Q60,30 30,30 Q50,30 50,10" stroke="#F8BBD0" strokeWidth={1.5} fill="none" />
        <Circle cx={52} cy={18} r={4} fill="#F8BBD0" />
        <Circle cx={32} cy={32} r={3} fill="#F48FB1" />
      </Svg>
      {/* Bottom-left */}
      <Svg width={70} height={70} style={{ position: "absolute", bottom: 16, left: 16 }}>
        <Path d="M10,10 Q10,40 40,40 Q20,40 20,60" stroke="#F8BBD0" strokeWidth={1.5} fill="none" />
        <Circle cx={18} cy={52} r={4} fill="#F8BBD0" />
        <Circle cx={38} cy={38} r={3} fill="#F48FB1" />
      </Svg>
      {/* Bottom-right */}
      <Svg width={70} height={70} style={{ position: "absolute", bottom: 16, right: 16 }}>
        <Path d="M60,10 Q60,40 30,40 Q50,40 50,60" stroke="#F8BBD0" strokeWidth={1.5} fill="none" />
        <Circle cx={52} cy={52} r={4} fill="#F8BBD0" />
        <Circle cx={32} cy={38} r={3} fill="#F48FB1" />
      </Svg>
    </>
  );
}

function FloralTheme({
  eventName,
  eventDate,
  eventLocation,
  qrCodeDataUrl,
  eventUrl,
  instruction,
}: Omit<QRCodePDFProps, "theme">) {
  return (
    <Page size="A5" style={floralStyles.page}>
      <FloralCornerDecorations />
      <Text style={floralStyles.names}>{eventName}</Text>
      <Text style={floralStyles.heart}>♥</Text>
      <Text style={floralStyles.date}>{formatDate(eventDate)}</Text>
      {eventLocation && (
        <Text style={floralStyles.location}>{eventLocation}</Text>
      )}
      {!eventLocation && <View style={{ marginBottom: 24 }} />}
      <View style={floralStyles.qrContainer}>
        <PdfImage src={qrCodeDataUrl} style={floralStyles.qrImage} />
      </View>
      <Text style={floralStyles.instruction}>{instruction}</Text>
      <Text style={floralStyles.url}>{eventUrl}</Text>
    </Page>
  );
}

/* ─── Modern / Bold ─── */

const boldStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    fontFamily: "Roboto",
    backgroundColor: "#1A1A2E",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#E91E63",
  },
  accentBarBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#E91E63",
  },
  names: {
    fontSize: 26,
    fontWeight: 700,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  date: {
    fontSize: 11,
    fontWeight: 300,
    textAlign: "center",
    color: "#E91E63",
    marginBottom: 4,
    letterSpacing: 1,
  },
  location: {
    fontSize: 10,
    fontWeight: 300,
    textAlign: "center",
    color: "#AAAAAA",
    marginBottom: 28,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  instruction: {
    fontSize: 10,
    fontWeight: 300,
    textAlign: "center",
    color: "#CCCCCC",
    maxWidth: 260,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  url: {
    fontSize: 7,
    color: "#666666",
    textAlign: "center",
  },
});

function BoldTheme({
  eventName,
  eventDate,
  eventLocation,
  qrCodeDataUrl,
  eventUrl,
  instruction,
}: Omit<QRCodePDFProps, "theme">) {
  return (
    <Page size="A5" style={boldStyles.page}>
      <View style={boldStyles.accentBar} />
      <View style={boldStyles.accentBarBottom} />
      <Svg
        width={60}
        height={60}
        style={{ position: "absolute", top: 20, left: 20 }}
      >
        <Rect x={0} y={0} width={40} height={2} fill="#E91E63" />
        <Rect x={0} y={0} width={2} height={40} fill="#E91E63" />
      </Svg>
      <Svg
        width={60}
        height={60}
        style={{ position: "absolute", top: 20, right: 20 }}
      >
        <Rect x={20} y={0} width={40} height={2} fill="#E91E63" />
        <Rect x={58} y={0} width={2} height={40} fill="#E91E63" />
      </Svg>
      <Svg
        width={60}
        height={60}
        style={{ position: "absolute", bottom: 20, left: 20 }}
      >
        <Rect x={0} y={58} width={40} height={2} fill="#E91E63" />
        <Rect x={0} y={20} width={2} height={40} fill="#E91E63" />
      </Svg>
      <Svg
        width={60}
        height={60}
        style={{ position: "absolute", bottom: 20, right: 20 }}
      >
        <Rect x={20} y={58} width={40} height={2} fill="#E91E63" />
        <Rect x={58} y={20} width={2} height={40} fill="#E91E63" />
      </Svg>
      <Text style={boldStyles.names}>{eventName}</Text>
      <Text style={boldStyles.date}>{formatDate(eventDate)}</Text>
      {eventLocation && (
        <Text style={boldStyles.location}>{eventLocation}</Text>
      )}
      {!eventLocation && <View style={{ marginBottom: 28 }} />}
      <View style={boldStyles.qrContainer}>
        <PdfImage src={qrCodeDataUrl} style={boldStyles.qrImage} />
      </View>
      <Text style={boldStyles.instruction}>{instruction}</Text>
      <Text style={boldStyles.url}>{eventUrl}</Text>
    </Page>
  );
}

/* ─── Document & Export ─── */

function QRCodePDFDocument(props: QRCodePDFProps) {
  const { theme, ...rest } = props;
  return (
    <Document>
      {theme === "elegant" && <ElegantTheme {...rest} />}
      {theme === "floral" && <FloralTheme {...rest} />}
      {theme === "bold" && <BoldTheme {...rest} />}
    </Document>
  );
}

export async function generateQRCodePDF(
  eventName: string,
  qrCodeDataUrl: string,
  eventUrl: string,
  instruction: string,
  theme: PdfTheme = "elegant",
  eventDate?: string,
  eventLocation?: string | null,
) {
  const blob = await pdf(
    <QRCodePDFDocument
      eventName={eventName}
      eventDate={eventDate || ""}
      eventLocation={eventLocation || null}
      qrCodeDataUrl={qrCodeDataUrl}
      eventUrl={eventUrl}
      instruction={instruction}
      theme={theme}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-qr-${theme}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
