"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  FrontDeskIcon,
  ReservationsIcon,
  GuestsIcon,
  FoliosIcon,
  LoyaltyIcon,
  RestaurantIcon,
  SpaIcon,
  GeneralLedgerIcon,
  AccountsReceivableIcon,
  ProcurementIcon,
  HrIcon,
  EventsIcon,
  ReportsIcon,
  HousekeepingIcon,
  MaintenanceIcon,
  RatesIcon,
  AuditIcon,
  NotificationsBellIcon,
  PropertyIcon,
} from "./icons";

const NAV_GROUPS = [
  {
    label: "Front Office",
    links: [
      { href: "/", label: "Dashboard", icon: DashboardIcon },
      { href: "/front-desk", label: "Front Desk", icon: FrontDeskIcon },
      { href: "/reservations", label: "Reservations", icon: ReservationsIcon },
      { href: "/guests", label: "Guests", icon: GuestsIcon },
      { href: "/housekeeping", label: "Housekeeping", icon: HousekeepingIcon },
      { href: "/maintenance", label: "Maintenance", icon: MaintenanceIcon },
    ],
  },
  {
    label: "Guest Spend",
    links: [
      { href: "/billing/folios", label: "Folios", icon: FoliosIcon },
      { href: "/loyalty", label: "Loyalty", icon: LoyaltyIcon },
      { href: "/pos/restaurant", label: "Restaurant & Bar", icon: RestaurantIcon },
      { href: "/pos/spa", label: "Spa", icon: SpaIcon },
    ],
  },
  {
    label: "Back Office",
    links: [
      { href: "/accounting/general-ledger", label: "General Ledger", icon: GeneralLedgerIcon },
      { href: "/accounting/accounts-receivable", label: "Accounts Receivable", icon: AccountsReceivableIcon },
      { href: "/procurement/purchase-orders", label: "Procurement", icon: ProcurementIcon },
      { href: "/hr/employees", label: "HR", icon: HrIcon },
      { href: "/events/inquiries", label: "Events & MICE", icon: EventsIcon },
      { href: "/rates/plans", label: "Rate Plans", icon: RatesIcon },
      { href: "/reports/dashboard", label: "Daily Report", icon: ReportsIcon },
      { href: "/night-audit", label: "Night Audit", icon: ReportsIcon },
    ],
  },
  {
    label: "Admin",
    links: [
      { href: "/admin/properties", label: "Properties", icon: PropertyIcon },
      { href: "/notifications", label: "Notifications", icon: NotificationsBellIcon },
      { href: "/admin/audit-log", label: "Audit Log", icon: AuditIcon },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col px-3 py-5">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label} className={i === 0 ? "mb-5" : "mb-5 border-t border-white/5 pt-5"}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <li key={link.href} className="relative">
                  {active && (
                    <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-400" />
                  )}
                  <Link
                    href={link.href}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                        : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/90"
                    }
                  >
                    <LinkIcon className={active ? "h-4 w-4 text-violet-400" : "h-4 w-4 text-white/30"} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
