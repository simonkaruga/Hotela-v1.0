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
} from "./icons";

const NAV_GROUPS = [
  {
    label: "Front Office",
    links: [
      { href: "/", label: "Dashboard", icon: DashboardIcon },
      { href: "/front-desk", label: "Front Desk", icon: FrontDeskIcon },
      { href: "/reservations", label: "Reservations", icon: ReservationsIcon },
      { href: "/guests", label: "Guests", icon: GuestsIcon },
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
    ],
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <li key={link.href}>
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
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />}
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
