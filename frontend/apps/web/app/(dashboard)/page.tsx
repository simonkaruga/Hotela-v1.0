import type { ComponentType } from "react";
import {
  BedIcon,
  GuestsIcon,
  FoliosIcon,
  CoinsIcon,
  FrontDeskIcon,
  ReservationsIcon,
  LoyaltyIcon,
  RestaurantIcon,
  SpaIcon,
  GeneralLedgerIcon,
  AccountsReceivableIcon,
  ProcurementIcon,
  HrIcon,
  EventsIcon,
  ChevronRightIcon,
} from "../../components/icons";
import type { ModuleGroup } from "../../components/moduleColors";
import { MODULE_GROUP_STYLES } from "../../components/moduleColors";

type Reservation = { status: string };
type Room = { reservations: unknown[] };
type Folio = { status: string; balance: number };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

const STAT_STYLES = {
  indigo: "bg-indigo-50 text-indigo-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof STAT_STYLES;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${STAT_STYLES[tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
  group,
}: {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  group: ModuleGroup;
}) {
  const styles = MODULE_GROUP_STYLES[group];
  return (
    <a
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
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
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-8 py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300/70">{today}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Naivasha Lakeside Resort</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-200/70">
            Live overview across front desk, guest spend, and back office.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {occupancyPct}% occupancy today
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Rooms occupied" value={`${occupiedRooms} / ${rooms.length}`} icon={BedIcon} tone="indigo" />
        <StatTile label="Guests in house" value={checkedIn} icon={GuestsIcon} tone="violet" />
        <StatTile label="Open folios" value={openFolios.length} icon={FoliosIcon} tone="sky" />
        <StatTile label="Outstanding balance" value={outstandingBalance.toLocaleString()} icon={CoinsIcon} tone="amber" />
      </div>

      <h2>Front office</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/front-desk" title="Front Desk" description="Room rack and live occupancy" icon={FrontDeskIcon} group="front-office" />
        <QuickLink href="/reservations" title="Reservations" description="Check in, check out, cancel" icon={ReservationsIcon} group="front-office" />
        <QuickLink href="/guests" title="Guests" description="Profiles, VIP flags, search" icon={GuestsIcon} group="front-office" />
      </div>

      <h2>Guest spend</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/billing/folios" title="Folios" description="Charges, payments, settlement" icon={FoliosIcon} group="guest-spend" />
        <QuickLink href="/loyalty" title="Loyalty" description="Points, tiers, redemption" icon={LoyaltyIcon} group="guest-spend" />
        <QuickLink href="/pos/restaurant" title="Restaurant & Bar" description="Orders posted to room folios" icon={RestaurantIcon} group="guest-spend" />
        <QuickLink href="/pos/spa" title="Spa" description="Appointments posted to room folios" icon={SpaIcon} group="guest-spend" />
      </div>

      <h2>Back office</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/accounting/general-ledger" title="General Ledger" description="Chart of accounts, trial balance" icon={GeneralLedgerIcon} group="back-office" />
        <QuickLink href="/accounting/accounts-receivable" title="Accounts Receivable" description="Corporate billing, credit limits" icon={AccountsReceivableIcon} group="back-office" />
        <QuickLink href="/procurement/purchase-orders" title="Procurement" description="Suppliers, inventory, purchase orders" icon={ProcurementIcon} group="back-office" />
        <QuickLink href="/hr/employees" title="HR" description="Employees and shift scheduling" icon={HrIcon} group="back-office" />
        <QuickLink href="/events/inquiries" title="Events & MICE" description="Inquiries, room blocks, quotes" icon={EventsIcon} group="back-office" />
      </div>
    </>
  );
}
