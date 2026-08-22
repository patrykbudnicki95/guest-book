import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/en/dashboard",
          "/e/",
          "/en/e/",
          "/login",
          "/en/login",
          "/signup",
          "/en/signup",
          "/demo",
          "/en/demo",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
