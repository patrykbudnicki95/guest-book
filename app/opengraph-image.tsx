import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, siteConfig } from "@/lib/seo/config";

export const alt = siteConfig.name;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 55%, #fbcfe8 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            color: "#be185d",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              background: "#ec4899",
            }}
          />
          wirtualna księga gości
        </div>

        <div
          style={{
            marginTop: "28px",
            fontSize: 78,
            lineHeight: 1.05,
            fontWeight: 700,
            color: "#500724",
            letterSpacing: "-0.02em",
          }}
        >
          Zdjęcia od gości
          <br />
          przez kod QR
        </div>

        <div
          style={{
            marginTop: "32px",
            fontSize: 34,
            color: "#9d174d",
            maxWidth: "820px",
          }}
        >
          Bez instalowania aplikacji. Wszystkie wspomnienia z wesela w jednej
          galerii.
        </div>
      </div>
    ),
    size,
  );
}
