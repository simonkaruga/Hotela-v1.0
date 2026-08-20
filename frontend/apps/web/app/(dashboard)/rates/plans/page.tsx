import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { EmptyState } from "../../../../components/EmptyState";
import { RatesIcon } from "../../../../components/icons";

type Room = { id: string; propertyId: string; roomTypeId: string; roomType: { id: string; name: string; baseRate: string } };
type RatePlan = {
  id: string;
  name: string;
  type: string;
  adjustmentPct: string;
  minStay: number | null;
  active: boolean;
  effectiveRate: number;
  roomType: { name: string };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${apiUrl}/rooms`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load rooms: ${res.status}`);
  return res.json();
}

async function getRatePlans(propertyId: string): Promise<RatePlan[]> {
  const res = await fetch(`${apiUrl}/rates/plans?propertyId=${propertyId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load rate plans: ${res.status}`);
  return res.json();
}

export default async function RatePlansPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rooms = await getRooms();
  const propertyId = rooms[0]?.propertyId ?? "";
  const roomTypes = Array.from(new Map(rooms.map((r) => [r.roomType.id, r.roomType])).values());
  const plans = await getRatePlans(propertyId);

  return (
    <>
      <PageHeader icon={RatesIcon} group="back-office" title="Rate Plans" description="Rate plans per room type — BAR, corporate, package, non-refundable." />
      <ErrorBanner message={error} />

      <h2>New rate plan</h2>
      <form action="/api/rates/plans" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          Room type
          <select name="roomTypeId" required>
            {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name} ({Number(rt.baseRate).toLocaleString()})</option>)}
          </select>
        </label>
        <label>Name<input name="name" required /></label>
        <label>
          Type
          <select name="type" defaultValue="BAR">
            <option value="BAR">BAR</option>
            <option value="CORPORATE">Corporate</option>
            <option value="PACKAGE">Package</option>
            <option value="NON_REFUNDABLE">Non-refundable</option>
          </select>
        </label>
        <label>Adjustment % <input type="number" name="adjustmentPct" step="0.01" required className="w-24" /></label>
        <label>Min stay <input type="number" name="minStay" min="1" className="w-20" /></label>
        <button type="submit" className="secondary">Create plan</button>
      </form>

      <h2>Plans</h2>
      {plans.length === 0 ? (
        <EmptyState icon={RatesIcon} title="No rate plans yet" description="Create a rate plan to offer adjusted pricing per room type." />
      ) : (
        <Card className="mt-3">
          <table>
            <thead><tr><th>Room type</th><th>Plan</th><th>Type</th><th className="text-right">Adjustment</th><th className="text-right">Effective rate</th><th>Min stay</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.roomType.name}</td>
                  <td>{p.name}</td>
                  <td className="text-slate-500">{p.type.replaceAll("_", " ")}</td>
                  <td className="text-right">{Number(p.adjustmentPct) > 0 ? "+" : ""}{p.adjustmentPct}%</td>
                  <td className="text-right font-medium">{p.effectiveRate.toLocaleString()}</td>
                  <td className="text-slate-500">{p.minStay ?? "—"}</td>
                  <td><Badge status={p.active ? "CONFIRMED" : "CANCELLED"} /></td>
                  <td>
                    {p.active && (
                      <form action={`/api/rates/plans/${p.id}/deactivate`} method="POST">
                        <button type="submit" className="danger">Deactivate</button>
                      </form>
                    )}
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
