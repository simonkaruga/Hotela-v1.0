import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";

type CorporateAccount = { id: string; name: string; creditLimit: string; outstandingBalance: number };
type ArInvoice = {
  id: string;
  amount: string;
  description: string;
  dueDate: string;
  status: string;
  corporateAccount: { name: string };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function authedGet<T>(path: string): Promise<T | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export default async function AccountsReceivablePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const guests = await getGuests();
  const propertyId = guests[0]?.propertyId ?? "";

  const [accounts, invoices] = await Promise.all([
    authedGet<CorporateAccount[]>(`/ar/corporate-accounts?propertyId=${propertyId}`),
    authedGet<ArInvoice[]>(`/ar/invoices`),
  ]);

  if (accounts === "forbidden") {
    return (
      <>
        <h1>Accounts Receivable</h1>
        <p className="mt-4 text-sm text-slate-500">Sign in to view AR.</p>
      </>
    );
  }

  return (
    <>
      <h1>Accounts Receivable</h1>
      <ErrorBanner message={error} />

      <h2>Corporate accounts</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Name</th><th className="text-right">Credit limit</th><th className="text-right">Outstanding</th></tr></thead>
          <tbody>
            {(accounts as CorporateAccount[]).map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td className="text-right">{Number(a.creditLimit).toLocaleString()}</td>
                <td className={`text-right ${a.outstandingBalance > 0 ? "font-medium text-amber-700" : "text-slate-500"}`}>
                  {a.outstandingBalance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <form action="/api/ar/corporate-accounts" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>Company name<input name="name" required /></label>
        <label>Credit limit<input type="number" name="creditLimit" min="1" required /></label>
        <button type="submit" className="secondary">Add account</button>
      </form>

      <h2>Invoices</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Company</th><th>Description</th><th className="text-right">Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(invoices as ArInvoice[]).map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.corporateAccount.name}</td>
                <td className="text-slate-600">{inv.description}</td>
                <td className="text-right">{Number(inv.amount).toLocaleString()}</td>
                <td className="text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td><Badge status={inv.status} /></td>
                <td>
                  {inv.status === "UNPAID" && (
                    <form action={`/api/ar/invoices/${inv.id}/pay`} method="POST">
                      <button type="submit" className="secondary">Pay</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <form action="/api/ar/invoices" method="POST" className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label>
          Corporate account
          <select name="corporateAccountId" required className="block w-full">
            {(accounts as CorporateAccount[]).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label>Amount <input type="number" name="amount" min="1" required className="block w-full" /></label>
        <label>Description <input name="description" required className="block w-full" /></label>
        <label>Due date <input type="date" name="dueDate" required className="block w-full" /></label>
        <button type="submit" className="mt-1 w-fit">Create invoice</button>
      </form>
    </>
  );
}
