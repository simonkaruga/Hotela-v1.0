import type { ReactNode } from "react";
import { getSession } from "../../lib/auth";
import { Nav } from "../../components/Nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex h-screen bg-[#f4f6fb]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0f1117] text-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">Hotela</span>
        </div>
        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <Nav />
        </div>
        {/* Footer */}
        {session && (
          <div className="border-t border-white/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                {session.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{session.email}</p>
                <p className="text-[10px] text-white/40 capitalize">{session.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/70 px-8 backdrop-blur-md">
          <div />
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 from-transparent to-transparent p-0 text-slate-500 shadow-none ring-0 hover:bg-slate-200 hover:text-slate-700">
              <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </button>
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
