import { authHeaders } from "../../../../lib/auth";

type Account = { id: string; propertyId: string; code: string; name: string; type: string };
type TrialBalanceRow = { code: string; name: string; type: string; debit: number; credit: number; balance: number };
type TrialBalance = { rows: TrialBalanceRow[]; totalDebits: number; totalCredits: number; balanced: boolean };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getAccounts(): Promise<Account[]> {
  const res = await fetch(`${apiUrl}/accounting/accounts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load accounts: ${res.status}`);
  return res.json();
}

async function getTrialBalance(): Promise<TrialBalance | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/accounting/trial-balance`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load trial balance: ${res.status}`);
  return res.json();
}

export default async function GeneralLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [accounts, trialBalance, { error }] = await Promise.all([getAccounts(), getTrialBalance(), searchParams]);

  return (
    <main>
      <h1>General Ledger</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Post journal entry</h2>
      <form action="/api/accounting/journal-entries" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
        <input type="hidden" name="propertyId" value={accounts[0]?.propertyId ?? ""} />
        <label>
          Date
          <input type="date" name="date" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Description
          <input name="description" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Debit account
          <select name="debitAccountId" required style={{ display: "block", width: "100%" }}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </label>
        <label>
          Credit account
          <select name="creditAccountId" required style={{ display: "block", width: "100%" }}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input type="number" name="amount" min="0.01" step="0.01" required style={{ display: "block", width: "100%" }} />
        </label>
        <button type="submit">Post entry</button>
      </form>

      <h2>Trial balance</h2>
      {trialBalance === "forbidden" ? (
        <p>Your role cannot view the trial balance (General Manager or Night Audit only).</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th>Type</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.rows.map((r) => (
              <tr key={r.code}>
                <td>{r.code}</td>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.debit.toLocaleString()}</td>
                <td>{r.credit.toLocaleString()}</td>
                <td>{r.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>Total</strong></td>
              <td><strong>{trialBalance.totalDebits.toLocaleString()}</strong></td>
              <td><strong>{trialBalance.totalCredits.toLocaleString()}</strong></td>
              <td><strong>{trialBalance.balanced ? "Balanced" : "OUT OF BALANCE"}</strong></td>
            </tr>
          </tfoot>
        </table>
      )}
    </main>
  );
}
