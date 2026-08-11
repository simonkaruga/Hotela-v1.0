export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: "320px", margin: "4rem auto" }}>
      <h1>Hotela — Sign in</h1>
      <form action="/api/auth/login" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" style={{ display: "block", width: "100%" }} />
        </label>
        <button type="submit">Log in</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
