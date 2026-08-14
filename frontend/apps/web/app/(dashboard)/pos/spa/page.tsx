import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { EmptyState } from "../../../../components/EmptyState";
import { Avatar } from "../../../../components/Avatar";
import { SpaIcon } from "../../../../components/icons";

type Treatment = { id: string; name: string; price: string; durationMinutes: number };
type Reservation = {
  id: string;
  guest: { firstName: string; lastName: string };
  room: { number: string } | null;
};
type Appointment = {
  id: string;
  status: string;
  therapistName: string;
  scheduledAt: string;
  reservation: { guest: { firstName: string; lastName: string } };
  treatment: { name: string; price: string };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getTreatments(): Promise<Treatment[]> {
  const res = await fetch(`${apiUrl}/spa/treatments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load treatments: ${res.status}`);
  return res.json();
}

async function getCheckedInReservations(): Promise<Reservation[]> {
  const res = await fetch(`${apiUrl}/reservations?status=CHECKED_IN`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load reservations: ${res.status}`);
  return res.json();
}

async function getAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${apiUrl}/spa/appointments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load appointments: ${res.status}`);
  return res.json();
}

export default async function SpaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [treatments, reservations, appointments, { error }] = await Promise.all([
    getTreatments(),
    getCheckedInReservations(),
    getAppointments(),
    searchParams,
  ]);

  return (
    <>
      <PageHeader icon={SpaIcon} group="guest-spend" title="Spa" description="Appointments posted straight to room folios." />
      <ErrorBanner message={error} />

      <h2>Book appointment</h2>
      {reservations.length === 0 ? (
        <EmptyState icon={SpaIcon} title="No checked-in guests" description="Appointments can be booked once a guest is checked in." />
      ) : (
        <form action="/api/spa/appointments" method="POST" className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label>
            Guest / room
            <select name="reservationId" required className="block w-full">
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.guest.firstName} {r.guest.lastName} — Room {r.room?.number ?? "?"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Treatment
            <select name="treatmentId" required className="block w-full">
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.durationMinutes}min, {Number(t.price).toLocaleString()})
                </option>
              ))}
            </select>
          </label>
          <label>
            Therapist
            <input name="therapistName" required className="block w-full" />
          </label>
          <label>
            Scheduled at
            <input type="datetime-local" name="scheduledAt" required className="block w-full" />
          </label>
          <button type="submit" className="mt-1 w-fit">Book</button>
        </form>
      )}

      <h2>Appointments</h2>
      {appointments.length === 0 ? (
        <EmptyState icon={SpaIcon} title="No appointments yet" description="Booked treatments will show up here." />
      ) : (
        <Card className="mt-3">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Treatment</th>
                <th>Therapist</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${a.reservation.guest.firstName} ${a.reservation.guest.lastName}`} />
                      <span className="font-medium">{a.reservation.guest.firstName} {a.reservation.guest.lastName}</span>
                    </div>
                  </td>
                  <td className="text-slate-600">{a.treatment.name} ({Number(a.treatment.price).toLocaleString()})</td>
                  <td>{a.therapistName}</td>
                  <td className="text-slate-500">{new Date(a.scheduledAt).toLocaleString()}</td>
                  <td><Badge status={a.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      {a.status === "BOOKED" && (
                        <>
                          <form action={`/api/spa/appointments/${a.id}/post-to-folio`} method="POST">
                            <button type="submit" className="secondary">Post to folio</button>
                          </form>
                          <form action={`/api/spa/appointments/${a.id}/cancel`} method="POST">
                            <button type="submit" className="danger">Cancel</button>
                          </form>
                        </>
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
