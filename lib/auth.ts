// MongoDB-backed auth — talks to the local API routes (app/api/auth/*).
export type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
  avatar?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toUser = (u: any): AuthUser => ({
  id: u?.id || u?._id || "",
  email: u?.email || "",
  firstName: u?.firstName || null,
  lastName: u?.lastName || null,
  phone: u?.phone || null,
  role: u?.role || "tenant",
  avatar: u?.avatar || null,
});

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!res.ok) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  return data.user ? toUser(data.user) : null;
}

export async function signup(input: { firstName: string; lastName: string; email: string; password: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await post("/api/auth/signup", input);
  if (!data.ok) return { ok: false as const, error: data.error || "Signup failed." };
  return { ok: true as const };
}

export async function login(email: string, password: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await post("/api/auth/login", { email, password });
  if (!data.ok) return { ok: false as const, error: data.error || "Unable to log in." };
  return { ok: true as const };
}

export async function logout() {
  await post("/api/auth/logout", {});
}

export async function getProfile(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export async function updateProfile(data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await res.json();
  if (!result.ok) return { ok: false as const, error: result.error || "Could not save profile." };
  return { ok: true as const };
}
