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

export default async function ReservationsPage() {
  const reservations = await getReservations();

  if (reservations.length === 0) {
    return <main>Reservations — none yet.</main>;
  }

  return (
    <main>
      <h1>Reservations</h1>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
