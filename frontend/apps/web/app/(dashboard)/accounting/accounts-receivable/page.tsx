import { authHeaders } from "../../../../lib/auth";

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
    return <main><h1>Accounts Receivable</h1><p>Sign in to view AR.</p></main>;
  }

  return (
    <main>
      <h1>Accounts Receivable</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Corporate accounts</h2>
      <table>
        <thead><tr><th>Name</th><th>Credit limit</th><th>Outstanding</th></tr></thead>
        <tbody>
          {(accounts as CorporateAccount[]).map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{Number(a.creditLimit).toLocaleString()}</td>
              <td>{a.outstandingBalance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action="/api/ar/corporate-accounts" method="POST" style={{ display: "flex", gap: "0.5rem", maxWidth: "400px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="name" placeholder="Company name" required />
        <input type="number" name="creditLimit" placeholder="Credit limit" min="1" required />
        <button type="submit">Add account</button>
      </form>

      <h2>Invoices</h2>
      <table>
        <thead><tr><th>Company</th><th>Description</th><th>Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(invoices as ArInvoice[]).map((inv) => (
            <tr key={inv.id}>
              <td>{inv.corporateAccount.name}</td>
              <td>{inv.description}</td>
              <td>{Number(inv.amount).toLocaleString()}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td>{inv.status}</td>
              <td>
                {inv.status === "UNPAID" && (
                  <form action={`/api/ar/invoices/${inv.id}/pay`} method="POST">
                    <button type="submit">Pay</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action="/api/ar/invoices" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
        <label>
          Corporate account
          <select name="corporateAccountId" required style={{ display: "block", width: "100%" }}>
            {(accounts as CorporateAccount[]).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label>Amount <input type="number" name="amount" min="1" required style={{ display: "block", width: "100%" }} /></label>
        <label>Description <input name="description" required style={{ display: "block", width: "100%" }} /></label>
        <label>Due date <input type="date" name="dueDate" required style={{ display: "block", width: "100%" }} /></label>
        <button type="submit">Create invoice</button>
      </form>
    </main>
  );
}
