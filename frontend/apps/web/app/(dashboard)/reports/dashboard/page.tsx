import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { PageHeader } from "../../../../components/PageHeader";
import { Avatar } from "../../../../components/Avatar";
import { ReportsIcon } from "../../../../components/icons";

type Reservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  guest: { firstName: string; lastName: string };
  room: { number: string } | null;
};
type DailyReport = {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyPct: number;
  roomRevenue: number;
  adr: number;
  revPar: number;
  arrivals: Reservation[];
  departures: Reservation[];
  inHouseCount: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function getDailyReport(propertyId: string, date: string): Promise<DailyReport | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/reports/daily?propertyId=${propertyId}&date=${date}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load daily report: ${res.status}`);
  return res.json();
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? new Date().toISOString().slice(0, 10);
  const guests = await getGuests();
  const propertyId = guests[0]?.propertyId ?? "";
  const report = await getDailyReport(propertyId, date);

  return (
    <>
      <PageHeader icon={ReportsIcon} group="back-office" title="Daily Report" description="Occupancy, ADR, RevPAR, arrivals & departures." />

      <form method="GET" className="mt-4 flex items-end gap-3">
        <label>
          Date
          <input type="date" name="date" defaultValue={date} className="block" />
        </label>
        <button type="submit" className="secondary">View</button>
      </form>

      {report === "forbidden" ? (
        <p className="mt-4 text-sm text-slate-500">Your role cannot view daily reports (General Manager or Night Audit only).</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Occupancy" value={`${report.occupancyPct}%`} />
            <StatTile label="Rooms occupied" value={`${report.occupiedRooms} / ${report.totalRooms}`} />
            <StatTile label="ADR" value={report.adr.toLocaleString()} />
            <StatTile label="RevPAR" value={report.revPar.toLocaleString()} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile label="Room revenue" value={report.roomRevenue.toLocaleString()} />
            <StatTile label="In-house guests" value={report.inHouseCount} />
          </div>

          <h2>Arrivals</h2>
          {report.arrivals.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No arrivals on {date}.</p>
          ) : (
            <Card className="mt-3">
              <table>
                <thead><tr><th>Guest</th><th>Room</th><th>Check-in</th></tr></thead>
                <tbody>
                  {report.arrivals.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={`${r.guest.firstName} ${r.guest.lastName}`} />
                          <span className="font-medium">{r.guest.firstName} {r.guest.lastName}</span>
                        </div>
                      </td>
                      <td>{r.room?.number ?? "—"}</td>
                      <td className="text-slate-500">{new Date(r.checkIn).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <h2>Departures</h2>
          {report.departures.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No departures on {date}.</p>
          ) : (
            <Card className="mt-3">
              <table>
                <thead><tr><th>Guest</th><th>Room</th><th>Check-out</th></tr></thead>
                <tbody>
                  {report.departures.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={`${r.guest.firstName} ${r.guest.lastName}`} />
                          <span className="font-medium">{r.guest.firstName} {r.guest.lastName}</span>
                        </div>
                      </td>
                      <td>{r.room?.number ?? "—"}</td>
                      <td className="text-slate-500">{new Date(r.checkOut).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </>
  );
}
