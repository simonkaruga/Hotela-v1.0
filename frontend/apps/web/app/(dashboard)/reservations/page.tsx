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

function ActionForm({ action, id, label }: { action: string; id: string; label: string }) {
  return (
    <form action={action} method="POST" style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">{label}</button>
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
    <main>
      <h1>Reservations</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {reservations.length === 0 ? (
        <p>None yet.</p>
      ) : (
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
                <td>{r.guest.firstName} {r.guest.lastName}</td>
                <td>{r.room?.number ?? "—"}</td>
                <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                <td>{r.status}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  {r.status === "CONFIRMED" && (
                    <>
                      <ActionForm action={`/api/reservations/${r.id}/check-in`} id={r.id} label="Check in" />
                      <ActionForm action={`/api/reservations/${r.id}/cancel`} id={r.id} label="Cancel" />
                    </>
                  )}
                  {r.status === "CHECKED_IN" && (
                    <ActionForm action={`/api/reservations/${r.id}/check-out`} id={r.id} label="Check out" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
