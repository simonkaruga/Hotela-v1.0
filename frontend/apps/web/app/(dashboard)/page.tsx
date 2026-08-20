import type { ComponentType } from "react";
import Link from "next/link";
import { getSession, authHeaders } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";
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
  HousekeepingIcon,
  MaintenanceIcon,
  RatesIcon,
  ReportsIcon,
  NotificationsBellIcon,
  ChevronRightIcon,
} from "../../components/icons";
import type { ModuleGroup } from "../../components/moduleColors";
import { MODULE_GROUP_STYLES } from "../../components/moduleColors";

type Reservation = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guest: { firstName: string; lastName: string };
  room: { number: string } | null;
};
type Room = { status: string; reservations: unknown[] };
type Folio = { status: string; balance: number };
type HousekeepingTask = { status: string };
type MaintenanceTicket = { status: string; priority: string; description: string; room: { number: string } | null };
type Notification = { id: string; type: string; message: string; createdAt: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function getNotifications(propertyId: string): Promise<Notification[] | null> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/notifications?propertyId=${propertyId}&unread=true`, { cache: "no-store", headers });
  if (!res.ok) return null;
  return res.json();
}

const STAT_STYLES = {
  indigo: "bg-indigo-50 text-indigo-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

const ROOM_STATUS_STYLES: Record<string, string> = {
  CLEAN: "bg-emerald-400",
  INSPECTED: "bg-emerald-400",
  DIRTY: "bg-amber-400",
  OUT_OF_ORDER: "bg-rose-400",
  OUT_OF_SERVICE: "bg-slate-400",
};

const PRIORITY_STYLES: Record<string, string> = {
  EMERGENCY: "bg-rose-50 text-rose-700",
  URGENT: "bg-amber-50 text-amber-700",
  ROUTINE: "bg-slate-100 text-slate-600",
  PREVENTIVE: "bg-slate-100 text-slate-600",
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

function PanelCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action && (
          <Link href={action.href} className="flex items-center gap-0.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            {action.label}
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
  group,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  group: ModuleGroup;
}) {
  const styles = MODULE_GROUP_STYLES[group];
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.icon}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </Link>
  );
}

export default async function DashboardHomePage() {
  const session = await getSession();
  const propertyId = session?.propertyId ?? "";

  const [reservations, rooms, folios, housekeepingTasks, maintenanceTickets] = await Promise.all([
    getJson<Reservation[]>("/reservations"),
    getJson<Room[]>("/rooms"),
    getJson<Folio[]>("/folios"),
    getJson<HousekeepingTask[]>(`/housekeeping/tasks?propertyId=${propertyId}`),
    getJson<MaintenanceTicket[]>(`/maintenance/tickets?propertyId=${propertyId}`),
  ]);
  const notifications = session ? await getNotifications(propertyId) : null;

  const checkedIn = reservations.filter((r) => r.status === "CHECKED_IN").length;
  const occupiedRooms = rooms.filter((r) => r.reservations.length > 0).length;
  const openFolios = folios.filter((f) => f.status === "OPEN");
  const outstandingBalance = openFolios.reduce((sum, f) => sum + f.balance, 0);
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const arrivals = reservations.filter((r) => r.checkIn.slice(0, 10) === todayStr && r.status !== "CANCELLED" && r.status !== "NO_SHOW");
  const departures = reservations.filter((r) => r.checkOut.slice(0, 10) === todayStr && r.status !== "CANCELLED");

  const roomStatusCounts = rooms.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const openTasks = housekeepingTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const openTickets = maintenanceTickets.filter((t) => t.status !== "RESOLVED");
  const urgentTickets = openTickets.filter((t) => t.priority === "EMERGENCY" || t.priority === "URGENT");

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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {occupancyPct}% occupancy today
            </div>
            {urgentTickets.length > 0 && (
              <Link
                href="/maintenance"
                className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-200 ring-1 ring-inset ring-rose-400/20 hover:bg-rose-500/25"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {urgentTickets.length} urgent maintenance {urgentTickets.length === 1 ? "ticket" : "tickets"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Rooms occupied" value={`${occupiedRooms} / ${rooms.length}`} icon={BedIcon} tone="indigo" />
        <StatTile label="Guests in house" value={checkedIn} icon={GuestsIcon} tone="violet" />
        <StatTile label="Open folios" value={openFolios.length} icon={FoliosIcon} tone="sky" />
        <StatTile label="Outstanding balance" value={outstandingBalance.toLocaleString()} icon={CoinsIcon} tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <PanelCard title={`Arrivals today (${arrivals.length})`} action={{ href: "/reservations", label: "View all" }}>
              {arrivals.length === 0 ? (
                <p className="text-sm text-slate-400">No arrivals expected today.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {arrivals.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center gap-2.5">
                      <Avatar name={`${r.guest.firstName} ${r.guest.lastName}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{r.guest.firstName} {r.guest.lastName}</p>
                        <p className="text-xs text-slate-500">Room {r.room?.number ?? "unassigned"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard title={`Departures today (${departures.length})`} action={{ href: "/reservations", label: "View all" }}>
              {departures.length === 0 ? (
                <p className="text-sm text-slate-400">No departures expected today.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {departures.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center gap-2.5">
                      <Avatar name={`${r.guest.firstName} ${r.guest.lastName}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{r.guest.firstName} {r.guest.lastName}</p>
                        <p className="text-xs text-slate-500">Room {r.room?.number ?? "unassigned"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          </div>

          <PanelCard title="Room status">
            {rooms.length === 0 ? (
              <p className="text-sm text-slate-400">No rooms configured.</p>
            ) : (
              <>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  {Object.entries(roomStatusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className={ROOM_STATUS_STYLES[status] ?? "bg-slate-300"}
                      style={{ width: `${(count / rooms.length) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(roomStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${ROOM_STATUS_STYLES[status] ?? "bg-slate-300"}`} />
                      {status.replaceAll("_", " ")}
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </PanelCard>
        </div>

        <div className="flex flex-col gap-5">
          <PanelCard title="Needs attention">
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/maintenance" className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50">
                  <span className="flex items-center gap-2.5 text-sm text-slate-700">
                    <MaintenanceIcon className="h-4 w-4 text-slate-400" />
                    Open maintenance tickets
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{openTickets.length}</span>
                </Link>
              </li>
              <li>
                <Link href="/housekeeping" className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50">
                  <span className="flex items-center gap-2.5 text-sm text-slate-700">
                    <HousekeepingIcon className="h-4 w-4 text-slate-400" />
                    Housekeeping tasks in progress
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{openTasks}</span>
                </Link>
              </li>
              {notifications !== null && (
                <li>
                  <Link href="/notifications" className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50">
                    <span className="flex items-center gap-2.5 text-sm text-slate-700">
                      <NotificationsBellIcon className="h-4 w-4 text-slate-400" />
                      Unread notifications
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{notifications.length}</span>
                  </Link>
                </li>
              )}
            </ul>

            {urgentTickets.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                {urgentTickets.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">{t.description}</p>
                      <p className="text-[11px] text-slate-400">Room {t.room?.number ?? "—"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[t.priority] ?? "bg-slate-100 text-slate-600"}`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          {notifications !== null && notifications.length > 0 && (
            <PanelCard title="Recent activity" action={{ href: "/notifications", label: "View all" }}>
              <ul className="flex flex-col gap-3">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-700">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}
        </div>
      </div>

      <h2>Quick actions</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <QuickAction href="/front-desk" label="Front Desk" icon={FrontDeskIcon} group="front-office" />
        <QuickAction href="/reservations" label="Reservations" icon={ReservationsIcon} group="front-office" />
        <QuickAction href="/guests" label="Guests" icon={GuestsIcon} group="front-office" />
        <QuickAction href="/housekeeping" label="Housekeeping" icon={HousekeepingIcon} group="front-office" />
        <QuickAction href="/maintenance" label="Maintenance" icon={MaintenanceIcon} group="front-office" />
        <QuickAction href="/billing/folios" label="Folios" icon={FoliosIcon} group="guest-spend" />
        <QuickAction href="/loyalty" label="Loyalty" icon={LoyaltyIcon} group="guest-spend" />
        <QuickAction href="/pos/restaurant" label="Restaurant & Bar" icon={RestaurantIcon} group="guest-spend" />
        <QuickAction href="/pos/spa" label="Spa" icon={SpaIcon} group="guest-spend" />
        <QuickAction href="/accounting/general-ledger" label="General Ledger" icon={GeneralLedgerIcon} group="back-office" />
        <QuickAction href="/accounting/accounts-receivable" label="Accounts Receivable" icon={AccountsReceivableIcon} group="back-office" />
        <QuickAction href="/procurement/purchase-orders" label="Procurement" icon={ProcurementIcon} group="back-office" />
        <QuickAction href="/hr/employees" label="HR" icon={HrIcon} group="back-office" />
        <QuickAction href="/events/inquiries" label="Events & MICE" icon={EventsIcon} group="back-office" />
        <QuickAction href="/rates/plans" label="Rate Plans" icon={RatesIcon} group="back-office" />
        <QuickAction href="/reports/dashboard" label="Daily Report" icon={ReportsIcon} group="back-office" />
      </div>
    </>
  );
}
