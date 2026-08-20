import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/maintenance/tickets", "/maintenance", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    roomId: String(form.get("roomId") ?? "") || undefined,
    description: String(form.get("description") ?? ""),
    priority: String(form.get("priority") ?? "ROUTINE"),
  }));
}
