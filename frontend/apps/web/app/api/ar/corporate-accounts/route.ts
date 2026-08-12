import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/ar/corporate-accounts", "/accounting/accounts-receivable", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    name: String(form.get("name") ?? ""),
    creditLimit: Number(form.get("creditLimit") ?? 0),
  }));
}
