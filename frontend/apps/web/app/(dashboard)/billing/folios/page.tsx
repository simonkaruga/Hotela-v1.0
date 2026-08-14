import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { EmptyState } from "../../../../components/EmptyState";
import { Avatar } from "../../../../components/Avatar";
import { FoliosIcon } from "../../../../components/icons";

type Folio = {
  id: string;
  status: string;
  balance: number;
  reservation: {
    guest: { firstName: string; lastName: string };
    room: { number: string } | null;
  };
};

async function getFolios(): Promise<Folio[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/folios`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load folios: ${res.status}`);
  }
  return res.json();
}

export default async function FoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [folios, { error }] = await Promise.all([getFolios(), searchParams]);

  return (
    <>
      <PageHeader icon={FoliosIcon} group="guest-spend" title="Folios" description="Charges, payments, and settlement." />
      <ErrorBanner message={error} />
      {folios.length === 0 ? (
        <EmptyState icon={FoliosIcon} title="No folios yet" description="Folios are created automatically with each reservation." />
      ) : (
        <Card className="mt-4">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {folios.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${f.reservation.guest.firstName} ${f.reservation.guest.lastName}`} />
                      <span className="font-medium">{f.reservation.guest.firstName} {f.reservation.guest.lastName}</span>
                    </div>
                  </td>
                  <td>{f.reservation.room?.number ?? "—"}</td>
                  <td><Badge status={f.status} /></td>
                  <td className={f.balance > 0 ? "font-medium text-amber-700" : "text-slate-500"}>
                    {f.balance.toLocaleString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {f.status === "OPEN" && (
                        <form action={`/api/folios/${f.id}/settle`} method="POST">
                          <button type="submit">Settle</button>
                        </form>
                      )}
                      {f.status === "SETTLED" && (
                        <form action={`/api/accounting/post-folio/${f.id}`} method="POST">
                          <button type="submit" className="secondary">Post to GL</button>
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
