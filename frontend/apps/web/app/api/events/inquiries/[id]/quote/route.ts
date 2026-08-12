import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../../../lib/proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFormPost(request, `/events/inquiries/${id}/quote`, "/events/inquiries", (form) => ({
    amount: Number(form.get("amount") ?? 0),
    depositAmount: Number(form.get("depositAmount") ?? 0),
  }));
}
