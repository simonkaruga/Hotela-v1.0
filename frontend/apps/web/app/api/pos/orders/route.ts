import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const reservationId = String(form.get("reservationId") ?? "");

  const items: { menuItemId: string; quantity: number }[] = [];
  for (const [key, value] of form.entries()) {
    if (key.startsWith("qty_")) {
      const quantity = Number(value);
      if (quantity > 0) {
        items.push({ menuItemId: key.slice(4), quantity });
      }
    }
  }

  const url = new URL("/pos/restaurant", request.url);
  if (!reservationId || items.length === 0) {
    url.searchParams.set("error", "Select a guest and at least one item");
    return NextResponse.redirect(url, 303);
  }

  const res = await fetch(`${apiUrl}/pos/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservationId, items }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
