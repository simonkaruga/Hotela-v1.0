import { NextRequest, NextResponse } from "next/server";
import { authHeaders } from "../../../../lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const guestId = String(form.get("guestId") ?? "");
  const points = Number(form.get("points") ?? 0);
  const description = String(form.get("description") ?? "");

  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  const res = await fetch(`${apiUrl}/loyalty/redeem`, {
    method: "POST",
    headers,
    body: JSON.stringify({ guestId, points, description }),
  });

  const url = new URL("/loyalty", request.url);
  url.searchParams.set("guestId", guestId);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
