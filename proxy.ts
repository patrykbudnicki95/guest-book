import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// export default createMiddleware(routing);
// NOTE: REMOVE WHOLE CODE BELOW WHEN GOING TO PRODUCTION
const handleI18n = createMiddleware(routing);

const BASIC_USER = "michal";
const BASIC_PASS = "patryk";

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return false;
  }

  const decoded = atob(header.slice("Basic ".length));
  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return false;
  }

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return user === BASIC_USER && password === BASIC_PASS;
}

export default function proxy(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Preview"',
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  return handleI18n(request);
}
//
export const config = {
  // Extensionless metadata routes (opengraph-image, twitter-image) must bypass
  // the locale rewrite; everything with a file extension already does.
  matcher: ["/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)"],
};
