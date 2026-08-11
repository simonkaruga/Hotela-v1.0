import { NextRequest, NextResponse } from "next/server";
import { authHeaders } from "./auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function proxyPost(request: NextRequest, backendPath: string, redirectPath: string) {
  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  const res = await fetch(`${apiUrl}${backendPath}`, { method: "POST", headers, body: "{}" });

  const url = new URL(redirectPath, request.url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
