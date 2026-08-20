import { authHeaders } from "../../../lib/auth";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { HousekeepingIcon } from "../../../components/icons";

type Room = { id: string; number: string };
type Employee = { id: string; firstName: string; lastName: string };
type Task = {
  id: string;
  status: string;
  notes: string | null;
  room: { number: string };
  assignedTo: { firstName: string; lastName: string } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${apiUrl}/rooms`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load rooms: ${res.status}`);
  return res.json();
}

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function getEmployees(propertyId: string): Promise<Employee[] | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}/hr/employees?propertyId=${propertyId}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load employees: ${res.status}`);
  return res.json();
}

async function getTasks(propertyId: string): Promise<Task[]> {
  const res = await fetch(`${apiUrl}/housekeeping/tasks?propertyId=${propertyId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load tasks: ${res.status}`);
  return res.json();
}

export default async function HousekeepingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [rooms, guests] = await Promise.all([getRooms(), getGuests()]);
  const propertyId = guests[0]?.propertyId ?? "";
  const [employees, tasks] = await Promise.all([getEmployees(propertyId), getTasks(propertyId)]);

  return (
    <>
      <PageHeader icon={HousekeepingIcon} group="front-office" title="Housekeeping" description="Room cleaning tasks and inspection sign-off." />
      <ErrorBanner message={error} />

      <h2>New task</h2>
      <form action="/api/housekeeping/tasks" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          Room
          <select name="roomId" required>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}
          </select>
        </label>
        {employees !== "forbidden" && (
          <label>
            Assign to
            <select name="assignedToId">
              <option value="">Unassigned</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </label>
        )}
        <label>Notes<input name="notes" /></label>
        <button type="submit" className="secondary">Create task</button>
      </form>

      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <EmptyState icon={HousekeepingIcon} title="No tasks yet" description="Create a task to start tracking room cleaning." />
      ) : (
        <Card className="mt-3">
          <table>
            <thead><tr><th>Room</th><th>Assigned to</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.room.number}</td>
                  <td className="text-slate-600">{t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "—"}</td>
                  <td className="text-slate-500">{t.notes ?? "—"}</td>
                  <td><Badge status={t.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      {t.status === "PENDING" && (
                        <form action={`/api/housekeeping/tasks/${t.id}/start`} method="POST">
                          <button type="submit" className="secondary">Start</button>
                        </form>
                      )}
                      {t.status === "IN_PROGRESS" && (
                        <form action={`/api/housekeeping/tasks/${t.id}/complete`} method="POST">
                          <button type="submit" className="secondary">Complete</button>
                        </form>
                      )}
                      {t.status === "DONE" && (
                        <form action={`/api/housekeeping/tasks/${t.id}/inspect`} method="POST">
                          <button type="submit">Inspect &amp; clear</button>
                        </form>
                      )}
                    </div>
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
