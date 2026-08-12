import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../../../lib/proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFormPost(request, `/events/inquiries/${id}/room-block`, "/events/inquiries", (form) => ({
    startDate: String(form.get("startDate") ?? ""),
    endDate: String(form.get("endDate") ?? ""),
    roomsBlocked: Number(form.get("roomsBlocked") ?? 0),
    notes: String(form.get("notes") ?? "") || undefined,
  }));
}
