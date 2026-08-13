export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl">Hotela</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to continue</p>

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
    </main>
  );
}
