import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/housekeeping/tasks", "/housekeeping", (form) => ({
    roomId: String(form.get("roomId") ?? ""),
    assignedToId: String(form.get("assignedToId") ?? "") || undefined,
    notes: String(form.get("notes") ?? "") || undefined,
  }));
}
