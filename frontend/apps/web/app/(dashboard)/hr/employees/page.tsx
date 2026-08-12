import { authHeaders } from "../../../../lib/auth";

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
    return <main><h1>HR</h1><p>Sign in to view HR.</p></main>;
  }

  return (
    <main>
      <h1>HR — Employees &amp; Shifts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Employees</h2>
      <table>
        <thead><tr><th>Name</th><th>Department</th><th>Phone</th></tr></thead>
        <tbody>
          {(employees as Employee[]).map((e) => (
            <tr key={e.id}><td>{e.firstName} {e.lastName}</td><td>{e.department}</td><td>{e.phone ?? "—"}</td></tr>
          ))}
        </tbody>
      </table>
      <form action="/api/hr/employees" method="POST" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "600px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="firstName" placeholder="First name" required />
        <input name="lastName" placeholder="Last name" required />
        <input name="department" placeholder="Department" required />
        <input name="phone" placeholder="Phone" />
        <input type="date" name="hireDate" required />
        <button type="submit">Add employee</button>
      </form>

      <h2>Shifts</h2>
      <table>
        <thead><tr><th>Employee</th><th>Date</th><th>Time</th><th>Department</th></tr></thead>
        <tbody>
          {(shifts as Shift[]).map((s) => (
            <tr key={s.id}>
              <td>{s.employee.firstName} {s.employee.lastName}</td>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.startTime} - {s.endTime}</td>
              <td>{s.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action="/api/hr/shifts" method="POST" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "600px" }}>
        <label>
          Employee
          <select name="employeeId" required>
            {(employees as Employee[]).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </label>
        <input type="date" name="date" required />
        <input type="time" name="startTime" required />
        <input type="time" name="endTime" required />
        <input name="department" placeholder="Department" required />
        <button type="submit">Add shift</button>
      </form>
    </main>
  );
}
