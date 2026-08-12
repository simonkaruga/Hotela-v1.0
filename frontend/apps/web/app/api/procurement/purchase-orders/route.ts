import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/procurement/purchase-orders", "/procurement/purchase-orders", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    supplierId: String(form.get("supplierId") ?? ""),
    items: [
      {
        inventoryItemId: String(form.get("inventoryItemId") ?? ""),
        quantity: Number(form.get("quantity") ?? 0),
        unitCost: Number(form.get("unitCost") ?? 0),
      },
    ],
  }));
}
