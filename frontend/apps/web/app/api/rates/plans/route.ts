import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/rates/plans", "/rates/plans", (form) => ({
    roomTypeId: String(form.get("roomTypeId") ?? ""),
    name: String(form.get("name") ?? ""),
    type: String(form.get("type") ?? "BAR"),
    adjustmentPct: Number(form.get("adjustmentPct") ?? 0),
    minStay: form.get("minStay") ? Number(form.get("minStay")) : undefined,
  }));
}
