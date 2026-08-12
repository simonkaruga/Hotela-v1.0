import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/ar/invoices", "/accounting/accounts-receivable", (form) => ({
    corporateAccountId: String(form.get("corporateAccountId") ?? ""),
    amount: Number(form.get("amount") ?? 0),
    description: String(form.get("description") ?? ""),
    dueDate: String(form.get("dueDate") ?? ""),
  }));
}
