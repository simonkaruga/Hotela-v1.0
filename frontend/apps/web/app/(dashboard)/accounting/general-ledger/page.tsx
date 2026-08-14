import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { GeneralLedgerIcon } from "../../../../components/icons";

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
    <>
      <PageHeader icon={GeneralLedgerIcon} group="back-office" title="General Ledger" description="Chart of accounts and trial balance." />
      <ErrorBanner message={error} />

      <h2>Post journal entry</h2>
      <form action="/api/accounting/journal-entries" method="POST" className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <input type="hidden" name="propertyId" value={accounts[0]?.propertyId ?? ""} />
        <label>
          Date
          <input type="date" name="date" required className="block w-full" />
        </label>
        <label>
          Description
          <input name="description" required className="block w-full" />
        </label>
        <label>
          Debit account
          <select name="debitAccountId" required className="block w-full">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </label>
        <label>
          Credit account
          <select name="creditAccountId" required className="block w-full">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input type="number" name="amount" min="0.01" step="0.01" required className="block w-full" />
        </label>
        <button type="submit" className="mt-1 w-fit">Post entry</button>
      </form>

      <h2>Trial balance</h2>
      {trialBalance === "forbidden" ? (
        <p className="mt-2 text-sm text-slate-500">Your role cannot view the trial balance (General Manager or Night Audit only).</p>
      ) : (
        <Card className="mt-3">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Account</th>
                <th>Type</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.rows.map((r) => (
                <tr key={r.code}>
                  <td className="text-slate-500">{r.code}</td>
                  <td className="font-medium">{r.name}</td>
                  <td className="text-slate-500">{r.type}</td>
                  <td className="text-right">{r.debit.toLocaleString()}</td>
                  <td className="text-right">{r.credit.toLocaleString()}</td>
                  <td className="text-right">{r.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                <td colSpan={3}>Total</td>
                <td className="text-right">{trialBalance.totalDebits.toLocaleString()}</td>
                <td className="text-right">{trialBalance.totalCredits.toLocaleString()}</td>
                <td className={`text-right ${trialBalance.balanced ? "text-emerald-700" : "text-red-700"}`}>
                  {trialBalance.balanced ? "Balanced" : "OUT OF BALANCE"}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </>
  );
}
