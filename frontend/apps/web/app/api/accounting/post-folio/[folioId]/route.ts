import { NextRequest } from "next/server";
import { proxyPost } from "../../../../../lib/proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ folioId: string }> }) {
  const { folioId } = await params;
  return proxyPost(request, `/accounting/post-folio/${folioId}`, "/billing/folios");
}
