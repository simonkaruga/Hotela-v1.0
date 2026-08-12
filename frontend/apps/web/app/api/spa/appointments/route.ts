import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const reservationId = String(form.get("reservationId") ?? "");
  const treatmentId = String(form.get("treatmentId") ?? "");
  const therapistName = String(form.get("therapistName") ?? "");
  const scheduledAt = String(form.get("scheduledAt") ?? "");

  const url = new URL("/pos/spa", request.url);
  if (!reservationId || !treatmentId || !therapistName || !scheduledAt) {
    url.searchParams.set("error", "All fields are required");
    return NextResponse.redirect(url, 303);
  }

  const res = await fetch(`${apiUrl}/spa/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservationId, treatmentId, therapistName, scheduledAt }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
