import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { Avatar } from "../../../components/Avatar";
import { ReservationsIcon } from "../../../components/icons";

type Reservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guest: { firstName: string; lastName: string };
  room: { number: string } | null;
};

async function getReservations(): Promise<Reservation[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/reservations`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reservations: ${res.status}`);
  }
  return res.json();
}

function ActionForm({ action, id, label, variant }: { action: string; id: string; label: string; variant?: "secondary" }) {
  return (
    <form action={action} method="POST" className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={variant}>{label}</button>
    </form>
  );
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [reservations, { error }] = await Promise.all([getReservations(), searchParams]);

  return (
    <>
      <PageHeader icon={ReservationsIcon} group="front-office" title="Reservations" description="Check in, check out, and manage bookings." />
      <ErrorBanner message={error} />
      {reservations.length === 0 ? (
        <EmptyState icon={ReservationsIcon} title="No reservations yet" description="New bookings will show up here." />
      ) : (
        <Card className="mt-4">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${r.guest.firstName} ${r.guest.lastName}`} />
                      <span className="font-medium">{r.guest.firstName} {r.guest.lastName}</span>
                    </div>
                  </td>
                  <td>{r.room?.number ?? "—"}</td>
                  <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                  <td><Badge status={r.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      {r.status === "CONFIRMED" && (
                        <>
                          <ActionForm action={`/api/reservations/${r.id}/check-in`} id={r.id} label="Check in" />
                          <ActionForm action={`/api/reservations/${r.id}/cancel`} id={r.id} label="Cancel" variant="secondary" />
                        </>
                      )}
                      {r.status === "CHECKED_IN" && (
                        <ActionForm action={`/api/reservations/${r.id}/check-out`} id={r.id} label="Check out" />
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
