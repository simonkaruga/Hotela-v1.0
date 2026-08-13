import { authHeaders } from "../../../lib/auth";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { ErrorBanner } from "../../../components/ErrorBanner";

type Guest = { id: string; firstName: string; lastName: string; loyaltyPoints: number; loyaltyTier: string };
type LoyaltyDetail = {
  points: number;
  tier: string;
  transactions: { id: string; type: string; points: number; description: string; createdAt: string }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TIER_STYLES: Record<string, string> = {
  BRONZE: "bg-orange-50 text-orange-700",
  SILVER: "bg-slate-100 text-slate-600",
  GOLD: "bg-amber-50 text-amber-700",
  PLATINUM: "bg-indigo-50 text-indigo-700",
};

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
    <>
      <h1>Loyalty</h1>
      <ErrorBanner message={error} />

      <h2>Guests</h2>
      <Card className="mt-3">
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
              <tr key={g.id} className={g.id === guestId ? "bg-indigo-50/40" : ""}>
                <td className="font-medium">{g.firstName} {g.lastName}</td>
                <td>{g.loyaltyPoints}</td>
                <td><span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLES[g.loyaltyTier] ?? "bg-slate-100 text-slate-600"}`}>{g.loyaltyTier}</span></td>
                <td><a href={`/loyalty?guestId=${g.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {guestId && selected && (
        <>
          <h2>{selected.firstName} {selected.lastName}</h2>
          {detail === "forbidden" ? (
            <p className="mt-2 text-sm text-slate-500">Your role cannot view redemption history (need to be logged in).</p>
          ) : detail ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{detail.points}</span> points ·{" "}
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLES[detail.tier] ?? ""}`}>{detail.tier}</span>
              </p>

              <form action="/api/loyalty/redeem" method="POST" className="mt-4 flex max-w-sm flex-col gap-3">
                <input type="hidden" name="guestId" value={guestId} />
                <label>
                  Points to redeem
                  <input type="number" name="points" min="1" required className="block w-full" />
                </label>
                <label>
                  Description
                  <input name="description" required className="block w-full" />
                </label>
                <button type="submit" className="w-fit">Redeem</button>
              </form>

              <h3 className="mt-6">History</h3>
              <Card className="mt-2">
                <table>
                  <thead>
                    <tr><th>Type</th><th>Points</th><th>Description</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {detail.transactions.map((t) => (
                      <tr key={t.id}>
                        <td><Badge status={t.type} /></td>
                        <td>{t.points}</td>
                        <td className="text-slate-600">{t.description}</td>
                        <td className="text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          ) : null}
        </>
      )}
    </>
  );
}
