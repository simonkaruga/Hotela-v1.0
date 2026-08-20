import { NextRequest, NextResponse } from "next/server";
import { authHeaders } from "../../../../lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const body: Record<string, string> = {};
  for (const key of ["name", "timezone", "currency", "tagline", "heroImageUrl", "logoUrl"]) {
    const value = String(form.get(key) ?? "").trim();
    if (value) body[key] = value;
  }

  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  const res = await fetch(`${apiUrl}/properties/${id}`, { method: "PATCH", headers, body: JSON.stringify(body) });

  const url = new URL("/admin/properties", request.url);
  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    url.searchParams.set("error", responseBody.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
