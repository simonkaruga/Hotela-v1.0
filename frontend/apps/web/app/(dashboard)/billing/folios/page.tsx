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

export default async function FoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [folios, { error }] = await Promise.all([getFolios(), searchParams]);

  return (
    <main>
      <h1>Folios</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {folios.length === 0 ? (
        <p>None yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Status</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {folios.map((f) => (
              <tr key={f.id}>
                <td>{f.reservation.guest.firstName} {f.reservation.guest.lastName}</td>
                <td>{f.reservation.room?.number ?? "—"}</td>
                <td>{f.status}</td>
                <td>{f.balance.toLocaleString()}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  {f.status === "OPEN" && (
                    <form action={`/api/folios/${f.id}/settle`} method="POST">
                      <button type="submit">Settle</button>
                    </form>
                  )}
                  {f.status === "SETTLED" && (
                    <form action={`/api/accounting/post-folio/${f.id}`} method="POST">
                      <button type="submit">Post to GL</button>
                    </form>
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
