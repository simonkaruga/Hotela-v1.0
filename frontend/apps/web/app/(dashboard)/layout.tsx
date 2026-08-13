import type { ReactNode } from "react";
import { getSession } from "../../lib/auth";
import { Nav } from "../../components/Nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Hotela</span>
        </div>
        <Nav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-slate-200 bg-white px-6">
          {session && (
            <>
              <span className="text-sm text-slate-600">
                {session.email} <span className="text-slate-400">·</span>{" "}
                <span className="font-medium text-slate-800">{session.role}</span>
              </span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-none ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-900">
                  Log out
                </button>
              </form>
            </>
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
