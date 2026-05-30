import { NextResponse } from "next/server";

export async function GET() {
  // API key auth does not use OAuth callbacks.
  // Redirect to dashboard or login.
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
