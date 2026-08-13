import { LoginScene } from "../../../components/LoginScene";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 lg:block">
        <div className="absolute inset-0">
          <LoginScene />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="text-lg font-semibold tracking-tight text-white">Hotela</div>

          <div className="max-w-md">
            <h2 className="!mt-0 text-3xl font-semibold leading-tight text-white">
              The hotel OS,<br />built for Naivasha and beyond.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-indigo-200/80">
              One system for reservations, front desk, folios, restaurant &amp; spa,
              accounting, and everything in between — running Naivasha Lakeside Resort.
            </p>
          </div>

          <p className="text-xs text-indigo-300/50">Naivasha Lakeside Resort · Avinaya Solutions</p>
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
