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
    <main>
      <h1>Restaurant &amp; Bar</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>New order</h2>
      {reservations.length === 0 ? (
        <p>No checked-in guests to order for.</p>
      ) : (
        <form action="/api/pos/orders" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
          <label>
            Guest / room
            <select name="reservationId" required style={{ display: "block", width: "100%" }}>
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.guest.firstName} {r.guest.lastName} — Room {r.room?.number ?? "?"}
                </option>
              ))}
            </select>
          </label>
          {menu.map((item) => (
            <label key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
              {item.name} ({Number(item.price).toLocaleString()})
              <input type="number" name={`qty_${item.id}`} min={0} defaultValue={0} style={{ width: "60px" }} />
            </label>
          ))}
          <button type="submit">Place order</button>
        </form>
      )}

      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
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
                  <td>{o.reservation.guest.firstName} {o.reservation.guest.lastName}</td>
                  <td>{o.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(", ")}</td>
                  <td>{total.toLocaleString()}</td>
                  <td>{o.status}</td>
                  <td>
                    {o.status === "OPEN" && (
                      <form action={`/api/pos/orders/${o.id}/post-to-folio`} method="POST">
                        <button type="submit">Post to folio</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
