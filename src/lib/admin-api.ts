"use client";

import { supabase } from "@/lib/supabase/client";

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Az admin művelethez újra be kell jelentkezni.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  if (!requestInit.cache) {
    requestInit.cache = "no-store";
  }

  return fetch(input, requestInit);
}
