import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { MaintenanceIcon } from "../../../components/icons";

type Room = { id: string; number: string };
type Ticket = {
  id: string;
  description: string;
  priority: string;
  status: string;
  room: { number: string } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${apiUrl}/rooms`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load rooms: ${res.status}`);
  return res.json();
}

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function getTickets(propertyId: string): Promise<Ticket[]> {
  const res = await fetch(`${apiUrl}/maintenance/tickets?propertyId=${propertyId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load tickets: ${res.status}`);
  return res.json();
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [rooms, guests] = await Promise.all([getRooms(), getGuests()]);
  const propertyId = guests[0]?.propertyId ?? "";
  const tickets = await getTickets(propertyId);

  return (
    <>
      <PageHeader icon={MaintenanceIcon} group="front-office" title="Maintenance" description="Repair tickets, from routine to emergency." />
      <ErrorBanner message={error} />

      <h2>New ticket</h2>
      <form action="/api/maintenance/tickets" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>
          Room (optional)
          <select name="roomId">
            <option value="">— General —</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}
          </select>
        </label>
        <label>Description<input name="description" required /></label>
        <label>
          Priority
          <select name="priority" defaultValue="ROUTINE">
            <option value="EMERGENCY">Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
            <option value="PREVENTIVE">Preventive</option>
          </select>
        </label>
        <button type="submit" className="secondary">Log ticket</button>
      </form>

      <h2>Tickets</h2>
      {tickets.length === 0 ? (
        <EmptyState icon={MaintenanceIcon} title="No tickets yet" description="Reported issues will show up here." />
      ) : (
        <Card className="mt-3">
          <table>
            <thead><tr><th>Room</th><th>Description</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.room?.number ?? "—"}</td>
                  <td className="text-slate-600">{t.description}</td>
                  <td><Badge status={t.priority} /></td>
                  <td><Badge status={t.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      {t.status === "OPEN" && (
                        <form action={`/api/maintenance/tickets/${t.id}/start`} method="POST">
                          <button type="submit" className="secondary">Start</button>
                        </form>
                      )}
                      {t.status !== "RESOLVED" && (
                        <form action={`/api/maintenance/tickets/${t.id}/resolve`} method="POST">
                          <button type="submit">Resolve</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
