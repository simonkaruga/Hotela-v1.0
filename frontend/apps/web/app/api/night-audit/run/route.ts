import { NextRequest, NextResponse } from "next/server";
import { authHeaders } from "../../../../lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const propertyId = String(form.get("propertyId") ?? "");
  const date = String(form.get("date") ?? "");

  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  const res = await fetch(`${apiUrl}/night-audit/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ propertyId, date }),
  });

  const url = new URL("/night-audit", request.url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  } else {
    url.searchParams.set("result", Buffer.from(JSON.stringify(body)).toString("base64url"));
  }
  return NextResponse.redirect(url, 303);
}
