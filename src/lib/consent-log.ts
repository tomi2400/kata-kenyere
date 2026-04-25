import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ConsentAction = "accept_all" | "accept_necessary" | "custom" | "change";

interface ConsentLogEntry {
  consent_id: string;
  categories: string[];
  action: ConsentAction;
}

let consentClient: SupabaseClient | null = null;

function getConsentClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!consentClient) {
    consentClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return consentClient;
}

export async function logConsent(entry: ConsentLogEntry) {
  try {
    const supabase = getConsentClient();
    if (!supabase) return;

    const { error } = await supabase.from("cookie_consents").insert({
      consent_id: entry.consent_id,
      categories: entry.categories,
      action: entry.action,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    if (error) {
      console.error("Consent log error:", error);
    }
  } catch (error) {
    console.error("Consent log error:", error);
  }
}
