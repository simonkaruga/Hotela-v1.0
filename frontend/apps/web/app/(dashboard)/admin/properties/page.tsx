import { Card } from "../../../../components/Card";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { PageHeader } from "../../../../components/PageHeader";
import { PropertyIcon } from "../../../../components/icons";

type Property = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  tagline: string | null;
  heroImageUrl: string | null;
  logoUrl: string | null;
};

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
      <PageHeader icon={PropertyIcon} group="admin" title="Properties" description="Every hotel running on Hotela, with its own name, colors, and branding." />
      <ErrorBanner message={error} />

      <div className="mt-4 flex flex-col gap-4">
        {properties.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div
                className="h-32 w-full shrink-0 bg-gradient-to-br from-slate-800 to-slate-950 bg-cover bg-center sm:h-auto sm:w-56"
                style={p.heroImageUrl ? { backgroundImage: `url(${p.heroImageUrl})` } : undefined}
              />
              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-base font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.slug}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{p.tagline ?? "No tagline set."}</p>
                <p className="mt-2 text-xs text-slate-400">{p.timezone} · {p.currency}</p>

                <details className="mt-3 group">
                  <summary className="cursor-pointer list-none text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    Edit branding
                  </summary>
                  <form action={`/api/properties/${p.id}`} method="POST" className="mt-3 flex flex-wrap items-end gap-3">
                    <label>Name<input name="name" defaultValue={p.name} /></label>
                    <label>Tagline<input name="tagline" defaultValue={p.tagline ?? ""} className="w-64" /></label>
                    <label>Hero image URL<input name="heroImageUrl" defaultValue={p.heroImageUrl ?? ""} className="w-64" /></label>
                    <label>Logo URL<input name="logoUrl" defaultValue={p.logoUrl ?? ""} className="w-64" /></label>
                    <label>Timezone<input name="timezone" defaultValue={p.timezone} /></label>
                    <label>Currency<input name="currency" defaultValue={p.currency} /></label>
                    <button type="submit" className="secondary">Save</button>
                  </form>
                </details>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2>Add property</h2>
      <form action="/api/properties" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <label>Name<input name="name" required /></label>
        <label>Slug<input name="slug" required placeholder="lowercase-with-hyphens" /></label>
        <label>Timezone<input name="timezone" placeholder="Africa/Nairobi" /></label>
        <label>Currency<input name="currency" placeholder="KES" /></label>
        <label>Tagline<input name="tagline" className="w-64" /></label>
        <label>Hero image URL<input name="heroImageUrl" className="w-64" /></label>
        <button type="submit" className="secondary">Add property</button>
      </form>
    </>
  );
}
