import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";

type MenuItem = { id: string; name: string; price: string; category: string | null };
type Reservation = {
  id: string;
  guest: { firstName: string; lastName: string };
  room: { number: string } | null;
};
type Order = {
  id: string;
  status: string;
  createdAt: string;
  reservation: { guest: { firstName: string; lastName: string } };
  items: { quantity: number; unitPrice: string; menuItem: { name: string } }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${apiUrl}/pos/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load menu: ${res.status}`);
  return res.json();
}

async function getCheckedInReservations(): Promise<Reservation[]> {
  const res = await fetch(`${apiUrl}/reservations?status=CHECKED_IN`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load reservations: ${res.status}`);
  return res.json();
}

async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${apiUrl}/pos/orders`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load orders: ${res.status}`);
  return res.json();
}

export default async function RestaurantPosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [menu, reservations, orders, { error }] = await Promise.all([
    getMenu(),
    getCheckedInReservations(),
    getOrders(),
    searchParams,
  ]);

  return (
    <>
      <h1>Restaurant &amp; Bar</h1>
      <ErrorBanner message={error} />

      <h2>New order</h2>
      {reservations.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No checked-in guests to order for.</p>
      ) : (
        <form action="/api/pos/orders" method="POST" className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
          <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            {menu.map((item) => (
              <label key={item.id} className="flex items-center justify-between font-normal normal-case tracking-normal text-slate-700">
                <span>{item.name} <span className="text-slate-400">({Number(item.price).toLocaleString()})</span></span>
                <input type="number" name={`qty_${item.id}`} min={0} defaultValue={0} className="w-16 text-center" />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-1 w-fit">Place order</button>
        </form>
      )}

      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No orders yet.</p>
      ) : (
        <Card className="mt-3">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const total = o.items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
                return (
                  <tr key={o.id}>
                    <td className="font-medium">{o.reservation.guest.firstName} {o.reservation.guest.lastName}</td>
                    <td className="text-slate-600">{o.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(", ")}</td>
                    <td>{total.toLocaleString()}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      {o.status === "OPEN" && (
                        <form action={`/api/pos/orders/${o.id}/post-to-folio`} method="POST">
                          <button type="submit" className="secondary">Post to folio</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
