import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/procurement/suppliers", "/procurement/purchase-orders", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    name: String(form.get("name") ?? ""),
    contact: String(form.get("contact") ?? "") || undefined,
  }));
}
