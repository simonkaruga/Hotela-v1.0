import { LoginScene } from "../../../components/LoginScene";

type Property = { name: string; tagline: string | null; heroImageUrl: string | null };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getProperty(): Promise<Property | null> {
  const res = await fetch(`${apiUrl}/properties`, { cache: "no-store" });
  if (!res.ok) return null;
  const properties: Property[] = await res.json();
  return properties[0] ?? null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const property = await getProperty();

  return (
    <main className="flex min-h-screen bg-slate-50">
      <div
        className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 bg-cover bg-center lg:block"
        style={property?.heroImageUrl ? { backgroundImage: `url(${property.heroImageUrl})` } : undefined}
      >
        {property?.heroImageUrl ? (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        ) : (
          <div className="absolute inset-0">
            <LoginScene />
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="text-lg font-semibold tracking-tight text-white">Hotela</div>

          <div className="max-w-md">
            <p className="text-3xl font-semibold normal-case leading-tight tracking-normal text-white">
              {property?.name ?? "The hotel OS"}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-indigo-200/80">
              {property?.tagline ??
                "One system for reservations, front desk, folios, restaurant & spa, accounting, and everything in between."}
            </p>
          </div>

          <p className="text-xs text-indigo-300/50">{property?.name ?? "Hotela"} · powered by Hotela</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-xl">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your Hotela credentials to continue.</p>

          <form action="/api/auth/login" method="POST" className="mt-6 flex flex-col gap-4">
            <label className="block">
              Email
              <input name="email" type="email" required autoComplete="email" className="block w-full" />
            </label>
            <label className="block">
              Password
              <input name="password" type="password" required autoComplete="current-password" className="block w-full" />
            </label>
            <button type="submit" className="mt-2 w-full">Log in</button>
          </form>

          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </main>
  );
}
