import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Extensionless metadata routes (opengraph-image, twitter-image) must bypass
  // the locale rewrite; everything with a file extension already does.
  matcher: [
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
