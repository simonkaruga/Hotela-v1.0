import { Card } from "../../../components/Card";

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  vip: boolean;
};

async function getGuests(): Promise<Guest[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load guests: ${res.status}`);
  }
  return res.json();
}

export default async function GuestsPage() {
  const guests = await getGuests();

  return (
    <>
      <h1>Guests</h1>
      {guests.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">None yet.</p>
      ) : (
        <Card className="mt-4">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>VIP</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id}>
                  <td className="font-medium">{g.firstName} {g.lastName}</td>
                  <td className="text-slate-500">{g.email ?? "—"}</td>
                  <td className="text-slate-500">{g.phone ?? "—"}</td>
                  <td>{g.vip && <span className="text-amber-500">★</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
