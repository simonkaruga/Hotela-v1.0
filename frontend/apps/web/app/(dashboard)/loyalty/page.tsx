import { authHeaders } from "../../../lib/auth";

type Guest = { id: string; firstName: string; lastName: string; loyaltyPoints: number; loyaltyTier: string };
type LoyaltyDetail = {
  points: number;
  tier: string;
  transactions: { id: string; type: string; points: number; description: string; createdAt: string }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<Guest[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function getLoyaltyDetail(guestId: string): Promise<LoyaltyDetail | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/loyalty/guests/${guestId}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load loyalty detail: ${res.status}`);
  return res.json();
}

export default async function LoyaltyPage({
  searchParams,
}: {
  searchParams: Promise<{ guestId?: string; error?: string }>;
}) {
  const { guestId, error } = await searchParams;
  const guests = await getGuests();
  const detail = guestId ? await getLoyaltyDetail(guestId) : null;
  const selected = guests.find((g) => g.id === guestId);

  return (
    <main>
      <h1>Loyalty</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Guests</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Points</th>
            <th>Tier</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td>{g.firstName} {g.lastName}</td>
              <td>{g.loyaltyPoints}</td>
              <td>{g.loyaltyTier}</td>
              <td><a href={`/loyalty?guestId=${g.id}`}>View</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      {guestId && selected && (
        <>
          <h2>{selected.firstName} {selected.lastName}</h2>
          {detail === "forbidden" ? (
            <p>Your role cannot view redemption history (need to be logged in).</p>
          ) : detail ? (
            <>
              <p>Points: {detail.points} | Tier: {detail.tier}</p>

              <form action="/api/loyalty/redeem" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "300px" }}>
                <input type="hidden" name="guestId" value={guestId} />
                <label>
                  Points to redeem
                  <input type="number" name="points" min="1" required style={{ display: "block", width: "100%" }} />
                </label>
                <label>
                  Description
                  <input name="description" required style={{ display: "block", width: "100%" }} />
                </label>
                <button type="submit">Redeem</button>
              </form>

              <h3>History</h3>
              <table>
                <thead>
                  <tr><th>Type</th><th>Points</th><th>Description</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {detail.transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.type}</td>
                      <td>{t.points}</td>
                      <td>{t.description}</td>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </>
      )}
    </main>
  );
}
