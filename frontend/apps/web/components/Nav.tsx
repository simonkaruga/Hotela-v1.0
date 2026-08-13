"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Front Office",
    links: [
      { href: "/", label: "Dashboard" },
      { href: "/front-desk", label: "Front Desk" },
      { href: "/reservations", label: "Reservations" },
      { href: "/guests", label: "Guests" },
    ],
  },
  {
    label: "Guest Spend",
    links: [
      { href: "/billing/folios", label: "Folios" },
      { href: "/loyalty", label: "Loyalty" },
      { href: "/pos/restaurant", label: "Restaurant & Bar" },
      { href: "/pos/spa", label: "Spa" },
    ],
  },
  {
    label: "Back Office",
    links: [
      { href: "/accounting/general-ledger", label: "General Ledger" },
      { href: "/accounting/accounts-receivable", label: "Accounts Receivable" },
      { href: "/procurement/purchase-orders", label: "Procurement" },
      { href: "/hr/employees", label: "HR" },
      { href: "/events/inquiries", label: "Events & MICE" },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      active
                        ? "block rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                        : "block rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  >
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
