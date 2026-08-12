import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/events/inquiries", "/events/inquiries", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    contactName: String(form.get("contactName") ?? ""),
    contactEmail: String(form.get("contactEmail") ?? ""),
    eventDate: String(form.get("eventDate") ?? ""),
    expectedGuests: Number(form.get("expectedGuests") ?? 0),
  }));
}
