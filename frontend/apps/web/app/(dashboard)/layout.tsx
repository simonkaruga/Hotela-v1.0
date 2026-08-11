import type { ReactNode } from "react";
import { getSession } from "../../lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #ccc" }}>
        <strong>Hotela</strong>
        {session && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span>{session.email} ({session.role})</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit">Log out</button>
            </form>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
