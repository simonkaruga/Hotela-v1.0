import { NextRequest } from "next/server";
import { proxyPost } from "../../../../../../lib/proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyPost(request, `/maintenance/tickets/${id}/start`, "/maintenance");
}
