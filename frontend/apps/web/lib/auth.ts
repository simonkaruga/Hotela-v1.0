import { cookies } from "next/headers";

export const SESSION_COOKIE = "hotela_session";

export type Session = { sub: string; email: string; role: string; propertyId: string };

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<Session | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const payloadB64 = token.split(".")[1];
    const json = Buffer.from(payloadB64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
