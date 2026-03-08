import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

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

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    fontFamily: "Roboto",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 12,
    textAlign: "center",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 300,
    marginBottom: 40,
    textAlign: "center",
    color: "#555555",
    maxWidth: 360,
    lineHeight: 1.7,
  },
  qrContainer: {
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    marginBottom: 28,
    backgroundColor: "#FFFFFF",
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  url: {
    fontSize: 9,
    color: "#999999",
    textAlign: "center",
  },
});

interface QRCodePDFDocumentProps {
  eventName: string;
  qrCodeDataUrl: string;
  eventUrl: string;
  instruction: string;
}

function QRCodePDFDocument({
  eventName,
  qrCodeDataUrl,
  eventUrl,
  instruction,
}: QRCodePDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{eventName}</Text>
        <Text style={styles.subtitle}>{instruction}</Text>
        <View style={styles.qrContainer}>
          <PdfImage src={qrCodeDataUrl} style={styles.qrImage} />
        </View>
        <Text style={styles.url}>{eventUrl}</Text>
      </Page>
    </Document>
  );
}

export async function generateQRCodePDF(
  eventName: string,
  qrCodeDataUrl: string,
  eventUrl: string,
  instruction: string,
) {
  const blob = await pdf(
    <QRCodePDFDocument
      eventName={eventName}
      qrCodeDataUrl={qrCodeDataUrl}
      eventUrl={eventUrl}
      instruction={instruction}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-qr-code.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
