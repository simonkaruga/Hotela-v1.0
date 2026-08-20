import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { PageHeader } from "../../../../components/PageHeader";
import { AuditIcon } from "../../../../components/icons";

type AuditEntry = {
  id: string;
  userEmail: string | null;
  role: string | null;
  method: string;
  path: string;
  statusCode: number | null;
  createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getAuditLog(): Promise<AuditEntry[] | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/audit-log`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load audit log: ${res.status}`);
  return res.json();
}

export default async function AuditLogPage() {
  const entries = await getAuditLog();

  return (
    <>
      <PageHeader icon={AuditIcon} group="admin" title="Audit Log" description="Every mutating request across the system." />

      {entries === "forbidden" ? (
        <p className="mt-4 text-sm text-slate-500">Your role cannot view the audit log (General Manager only).</p>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No activity logged yet.</p>
      ) : (
        <Card className="mt-4">
          <table>
            <thead><tr><th>When</th><th>User</th><th>Role</th><th>Method</th><th>Path</th><th>Status</th></tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="text-slate-500">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="font-medium">{e.userEmail ?? "—"}</td>
                  <td className="text-slate-500">{e.role ?? "—"}</td>
                  <td className="text-slate-600">{e.method}</td>
                  <td className="text-slate-600">{e.path}</td>
                  <td className={e.statusCode && e.statusCode >= 400 ? "font-medium text-red-600" : "text-emerald-700"}>
                    {e.statusCode ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
