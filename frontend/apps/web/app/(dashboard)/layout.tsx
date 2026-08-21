import type { ReactNode } from "react";
import Link from "next/link";
import { getSession, authHeaders } from "../../lib/auth";
import { Nav } from "../../components/Nav";
import { Avatar } from "../../components/Avatar";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Property = { name: string; logoUrl: string | null };

async function getUnreadCount(propertyId: string): Promise<number> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/notifications?propertyId=${propertyId}&unread=true`, { cache: "no-store", headers });
  if (!res.ok) return 0;
  const notifications: unknown[] = await res.json();
  return notifications.length;
}

async function getProperty(): Promise<Property | null> {
  const res = await fetch(`${apiUrl}/properties`, { cache: "no-store" });
  if (!res.ok) return null;
  const properties: Property[] = await res.json();
  return properties[0] ?? null;
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const [unreadCount, property] = await Promise.all([
    session ? getUnreadCount(session.propertyId) : Promise.resolve(0),
    getProperty(),
  ]);

  return (
    <div className="flex h-screen bg-[#f4f6fb]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0f1117] text-white">
        {/* Property lockup */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          {property?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.logoUrl}
              alt={property.name}
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-tight tracking-tight text-white">
              {property?.name ?? "Hotela"}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/30">on Hotela</p>
          </div>
        </div>
        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <Nav />
        </div>
        {/* Footer */}
        {session && (
          <div className="border-t border-white/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={session.email ?? "U"} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{session.email}</p>
                <p className="text-[10px] text-white/40 capitalize">{session.role?.toLowerCase().replaceAll("_", " ")}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/70 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {property?.name ?? "Hotela"}
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <Link
              href="/notifications"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {session && (
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="secondary h-9 px-4 text-xs">
                  Log out
                </button>
              </form>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
