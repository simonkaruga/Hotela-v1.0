import { getSession } from "../../../lib/auth";
import { Card } from "../../../components/Card";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { PageHeader } from "../../../components/PageHeader";
import { ReportsIcon } from "../../../components/icons";

type NightAuditResult = {
  date: string;
  noShows: { reservationId: string; guest: string }[];
  roomChargesPosted: { reservationId: string; guest: string; room: string; amount: number }[];
  skipped: { reservationId: string; reason: string }[];
};

function decodeResult(encoded?: string): NightAuditResult | null {
  if (!encoded) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export default async function NightAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; result?: string }>;
}) {
  const { error, result: encodedResult } = await searchParams;
  const session = await getSession();
  const propertyId = session?.propertyId ?? "";
  const result = decodeResult(encodedResult);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader icon={ReportsIcon} group="back-office" title="Night Audit" description="Mark no-shows and post nightly room charges." />
      <ErrorBanner message={error} />

      <form action="/api/night-audit/run" method="POST" className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>
          Business date
          <input type="date" name="date" defaultValue={today} required />
        </label>
        <button type="submit" className="secondary">Run night audit</button>
      </form>

      {result && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">No-shows marked</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{result.noShows.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Room charges posted</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{result.roomChargesPosted.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Skipped</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{result.skipped.length}</p>
            </Card>
          </div>

          {result.noShows.length > 0 && (
            <div>
              <h2>No-shows</h2>
              <Card className="mt-3">
                <table>
                  <thead><tr><th>Guest</th></tr></thead>
                  <tbody>
                    {result.noShows.map((n) => (
                      <tr key={n.reservationId}><td className="font-medium">{n.guest}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {result.roomChargesPosted.length > 0 && (
            <div>
              <h2>Room charges posted</h2>
              <Card className="mt-3">
                <table>
                  <thead><tr><th>Guest</th><th>Room</th><th>Amount</th></tr></thead>
                  <tbody>
                    {result.roomChargesPosted.map((c) => (
                      <tr key={c.reservationId}>
                        <td className="font-medium">{c.guest}</td>
                        <td className="text-slate-600">{c.room}</td>
                        <td className="text-slate-600">{c.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div>
              <h2>Skipped</h2>
              <Card className="mt-3">
                <table>
                  <thead><tr><th>Reservation</th><th>Reason</th></tr></thead>
                  <tbody>
                    {result.skipped.map((s) => (
                      <tr key={s.reservationId}>
                        <td className="text-slate-500">{s.reservationId}</td>
                        <td className="text-slate-600">{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}
