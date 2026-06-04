import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

export type AdminAuthSuccess = {
  user: User;
  supabase: SupabaseClient;
};

export type AdminAuthResult =
  | { ok: true; auth: AdminAuthSuccess }
  | { ok: false; response: NextResponse };

export async function getAdminAuth(
  request: Request,
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<AdminAuthResult> {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response: jsonError("Nincs bejelentkezett admin felhasználó.", 401),
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return {
      ok: false,
      response: jsonError("Érvénytelen vagy lejárt bejelentkezés.", 401),
    };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return {
      ok: false,
      response: jsonError("Ehhez a művelethez admin jogosultság szükséges.", 403),
    };
  }

  return {
    ok: true,
    auth: {
      user: userData.user,
      supabase,
    },
  };
}

export async function requireAdmin(
  request: Request,
  supabase?: SupabaseClient
) {
  const result = await getAdminAuth(request, supabase);

  return result.ok ? null : result.response;
}
