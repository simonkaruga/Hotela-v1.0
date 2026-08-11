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

  if (guests.length === 0) {
    return <main>Guests — none yet.</main>;
  }

  return (
    <main>
      <h1>Guests</h1>
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
              <td>{g.firstName} {g.lastName}</td>
              <td>{g.email ?? "—"}</td>
              <td>{g.phone ?? "—"}</td>
              <td>{g.vip ? "★" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
