import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  const form = await request.clone().formData();
  const propertyId = String(form.get("propertyId") ?? "");
  return proxyFormPost(request, `/notifications/read-all?propertyId=${propertyId}`, "/notifications", () => ({}));
}
