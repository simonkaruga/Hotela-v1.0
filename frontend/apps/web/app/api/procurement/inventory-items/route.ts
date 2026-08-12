import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/procurement/inventory-items", "/procurement/purchase-orders", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    name: String(form.get("name") ?? ""),
    unit: String(form.get("unit") ?? ""),
    reorderLevel: Number(form.get("reorderLevel") ?? 0),
  }));
}
