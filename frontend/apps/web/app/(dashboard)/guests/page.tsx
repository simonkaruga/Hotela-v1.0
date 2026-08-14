import { Card } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { Avatar } from "../../../components/Avatar";
import { GuestsIcon } from "../../../components/icons";

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
      <PageHeader icon={GuestsIcon} group="front-office" title="Guests" description="Profiles, VIP flags, and search." />
      {guests.length === 0 ? (
        <EmptyState icon={GuestsIcon} title="No guests yet" description="Guest profiles will appear here once created." />
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
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${g.firstName} ${g.lastName}`} />
                      <span className="font-medium">{g.firstName} {g.lastName}</span>
                    </div>
                  </td>
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
