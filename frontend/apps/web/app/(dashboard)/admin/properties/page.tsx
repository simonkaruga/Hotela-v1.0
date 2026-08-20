import { Card } from "../../../../components/Card";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { PropertyIcon } from "../../../../components/icons";

type Property = { id: string; name: string; slug: string; timezone: string; currency: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getProperties(): Promise<Property[]> {
  const res = await fetch(`${apiUrl}/properties`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load properties: ${res.status}`);
  return res.json();
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const properties = await getProperties();

  return (
    <>
      <PageHeader icon={PropertyIcon} group="admin" title="Properties" description="Properties running on Hotela." />
      <ErrorBanner message={error} />

      <Card className="mt-4">
        <table>
          <thead><tr><th>Name</th><th>Slug</th><th>Timezone</th><th>Currency</th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td className="text-slate-500">{p.slug}</td>
                <td className="text-slate-500">{p.timezone}</td>
                <td className="text-slate-500">{p.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2>Add property</h2>
      <form action="/api/properties" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <label>Name<input name="name" required /></label>
        <label>Slug<input name="slug" required placeholder="lowercase-with-hyphens" /></label>
        <label>Timezone<input name="timezone" placeholder="Africa/Nairobi" /></label>
        <label>Currency<input name="currency" placeholder="KES" /></label>
        <button type="submit" className="secondary">Add property</button>
      </form>
    </>
  );
}
