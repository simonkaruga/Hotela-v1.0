import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { ErrorBanner } from "../../../../components/ErrorBanner";

type Employee = { id: string; firstName: string; lastName: string; department: string; phone: string | null };
type Shift = { id: string; date: string; startTime: string; endTime: string; department: string; employee: { firstName: string; lastName: string } };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function authedGet<T>(path: string): Promise<T | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const guests = await getGuests();
  const propertyId = guests[0]?.propertyId ?? "";

  const [employees, shifts] = await Promise.all([
    authedGet<Employee[]>(`/hr/employees?propertyId=${propertyId}`),
    authedGet<Shift[]>(`/hr/shifts`),
  ]);

  if (employees === "forbidden") {
    return (
      <>
        <h1>HR</h1>
        <p className="mt-4 text-sm text-slate-500">Sign in to view HR.</p>
      </>
    );
  }

  return (
    <>
      <h1>HR — Employees &amp; Shifts</h1>
      <ErrorBanner message={error} />

      <h2>Employees</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Name</th><th>Department</th><th>Phone</th></tr></thead>
          <tbody>
            {(employees as Employee[]).map((e) => (
              <tr key={e.id}>
                <td className="font-medium">{e.firstName} {e.lastName}</td>
                <td className="text-slate-600">{e.department}</td>
                <td className="text-slate-500">{e.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <form action="/api/hr/employees" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>First name<input name="firstName" required /></label>
        <label>Last name<input name="lastName" required /></label>
        <label>Department<input name="department" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Hire date<input type="date" name="hireDate" required /></label>
        <button type="submit" className="secondary">Add employee</button>
      </form>

      <h2>Shifts</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Employee</th><th>Date</th><th>Time</th><th>Department</th></tr></thead>
          <tbody>
            {(shifts as Shift[]).map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.employee.firstName} {s.employee.lastName}</td>
                <td className="text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.startTime} – {s.endTime}</td>
                <td className="text-slate-600">{s.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <form action="/api/hr/shifts" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          Employee
          <select name="employeeId" required>
            {(employees as Employee[]).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </label>
        <label>Date<input type="date" name="date" required /></label>
        <label>Start<input type="time" name="startTime" required /></label>
        <label>End<input type="time" name="endTime" required /></label>
        <label>Department<input name="department" required /></label>
        <button type="submit" className="secondary">Add shift</button>
      </form>
    </>
  );
}
