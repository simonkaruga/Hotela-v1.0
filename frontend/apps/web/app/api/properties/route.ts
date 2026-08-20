import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/properties", "/admin/properties", (form) => ({
    name: String(form.get("name") ?? ""),
    slug: String(form.get("slug") ?? ""),
    timezone: String(form.get("timezone") ?? "") || undefined,
    currency: String(form.get("currency") ?? "") || undefined,
  }));
}
