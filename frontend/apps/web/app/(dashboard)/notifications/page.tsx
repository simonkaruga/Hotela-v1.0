import { authHeaders, getSession } from "../../../lib/auth";
import { Card } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { NotificationsBellIcon } from "../../../components/icons";

type Notification = { id: string; type: string; message: string; read: boolean; createdAt: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getNotifications(propertyId: string): Promise<Notification[] | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/notifications?propertyId=${propertyId}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load notifications: ${res.status}`);
  return res.json();
}

export default async function NotificationsPage() {
  const session = await getSession();
  const propertyId = session?.propertyId ?? "";
  const notifications = session ? await getNotifications(propertyId) : "forbidden";

  return (
    <>
      <PageHeader icon={NotificationsBellIcon} group="admin" title="Notifications" description="Low stock, new inquiries, and urgent maintenance." />

      {notifications === "forbidden" ? (
        <p className="mt-4 text-sm text-slate-500">Sign in to view notifications.</p>
      ) : notifications.length === 0 ? (
        <EmptyState icon={NotificationsBellIcon} title="You're all caught up" description="New notifications will appear here." />
      ) : (
        <>
          <form action="/api/notifications/read-all" method="POST" className="mt-4">
            <input type="hidden" name="propertyId" value={propertyId} />
            <button type="submit" className="secondary">Mark all read</button>
          </form>

          <Card className="mt-3">
            <table>
              <thead><tr><th>Message</th><th>Type</th><th>When</th><th>Actions</th></tr></thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className={n.read ? "" : "bg-indigo-50/40"}>
                    <td className={n.read ? "text-slate-600" : "font-medium text-slate-900"}>{n.message}</td>
                    <td className="text-slate-500">{n.type.replaceAll("_", " ")}</td>
                    <td className="text-slate-500">{new Date(n.createdAt).toLocaleString()}</td>
                    <td>
                      {!n.read && (
                        <form action={`/api/notifications/${n.id}/read`} method="POST">
                          <button type="submit" className="secondary">Mark read</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}
