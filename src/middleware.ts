import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // A bemutató környezet véletlenül se írjon az éles adatbázisba.
  if (process.env.VERCEL_ENV === "preview" && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return NextResponse.json({ error: "A preview csak bemutató; itt nem menthető adat és nem adható le rendelés." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
