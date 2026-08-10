import { NextResponse, type NextRequest } from "next/server";

/**
 * Open CRM: no auth gate. /login always redirects to the app.
 */
export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/pipeline";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
