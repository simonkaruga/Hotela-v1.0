type Folio = {
  id: string;
  status: string;
  balance: number;
  reservation: {
    guest: { firstName: string; lastName: string };
    room: { number: string } | null;
  };
};

async function getFolios(): Promise<Folio[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/folios`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load folios: ${res.status}`);
  }
  return res.json();
}

export default async function FoliosPage() {
  const folios = await getFolios();

  if (folios.length === 0) {
    return <main>Folios — none yet.</main>;
  }

  return (
    <main>
      <h1>Folios</h1>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Status</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {folios.map((f) => (
            <tr key={f.id}>
              <td>{f.reservation.guest.firstName} {f.reservation.guest.lastName}</td>
              <td>{f.reservation.room?.number ?? "—"}</td>
              <td>{f.status}</td>
              <td>{f.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
