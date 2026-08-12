import { NextRequest, NextResponse } from "next/server";
import { authHeaders } from "../../../../lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const propertyId = String(form.get("propertyId") ?? "");
  const date = String(form.get("date") ?? "");
  const description = String(form.get("description") ?? "");
  const debitAccountId = String(form.get("debitAccountId") ?? "");
  const creditAccountId = String(form.get("creditAccountId") ?? "");
  const amount = Number(form.get("amount") ?? 0);

  const url = new URL("/accounting/general-ledger", request.url);

  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  const res = await fetch(`${apiUrl}/accounting/journal-entries`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      propertyId,
      date,
      description,
      lines: [
        { accountId: debitAccountId, debit: amount, credit: 0 },
        { accountId: creditAccountId, debit: 0, credit: amount },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    url.searchParams.set("error", body.message ?? `Request failed (${res.status})`);
  }
  return NextResponse.redirect(url, 303);
}
