type Reservation = { status: string };
type Room = { reservations: unknown[] };
type Folio = { status: string; balance: number };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </a>
  );
}

export default async function DashboardHomePage() {
  const [reservations, rooms, folios] = await Promise.all([
    getJson<Reservation[]>("/reservations"),
    getJson<Room[]>("/rooms"),
    getJson<Folio[]>("/folios"),
  ]);

  const checkedIn = reservations.filter((r) => r.status === "CHECKED_IN").length;
  const occupiedRooms = rooms.filter((r) => r.reservations.length > 0).length;
  const openFolios = folios.filter((f) => f.status === "OPEN");
  const outstandingBalance = openFolios.reduce((sum, f) => sum + f.balance, 0);

  return (
    <>
      <h1>Naivasha Lakeside Resort</h1>
      <p className="mt-1 text-sm text-slate-500">Live overview across front desk, guest spend, and back office.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Rooms occupied" value={`${occupiedRooms} / ${rooms.length}`} />
        <StatTile label="Guests in house" value={checkedIn} />
        <StatTile label="Open folios" value={openFolios.length} />
        <StatTile label="Outstanding balance" value={outstandingBalance.toLocaleString()} />
      </div>

      <h2>Front office</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/front-desk" title="Front Desk" description="Room rack and live occupancy" />
        <QuickLink href="/reservations" title="Reservations" description="Check in, check out, cancel" />
        <QuickLink href="/guests" title="Guests" description="Profiles, VIP flags, search" />
      </div>

      <h2>Guest spend</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/billing/folios" title="Folios" description="Charges, payments, settlement" />
        <QuickLink href="/loyalty" title="Loyalty" description="Points, tiers, redemption" />
        <QuickLink href="/pos/restaurant" title="Restaurant & Bar" description="Orders posted to room folios" />
        <QuickLink href="/pos/spa" title="Spa" description="Appointments posted to room folios" />
      </div>

      <h2>Back office</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/accounting/general-ledger" title="General Ledger" description="Chart of accounts, trial balance" />
        <QuickLink href="/accounting/accounts-receivable" title="Accounts Receivable" description="Corporate billing, credit limits" />
        <QuickLink href="/procurement/purchase-orders" title="Procurement" description="Suppliers, inventory, purchase orders" />
        <QuickLink href="/hr/employees" title="HR" description="Employees and shift scheduling" />
        <QuickLink href="/events/inquiries" title="Events & MICE" description="Inquiries, room blocks, quotes" />
      </div>
    </>
  );
}
