// Verifies a RevenueCat entitlement for the calling user, then unlocks
// the specified challenge by upserting user_challenges with payment_status='paid'.
// Bypasses client RLS via the service role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const REVENUECAT_API = "https://api.revenuecat.com/v1/subscribers";
const ENTITLEMENT_ID = "premium";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const rcApiKey = Deno.env.get("REVENUECAT_APPLE_API_KEY")!;

    // Authenticate caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Not authenticated" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const challengeId: string | undefined = body.challengeId;
    const productIdentifier: string | undefined = body.productIdentifier;

    if (!challengeId) {
      return json({ error: "challengeId is required" }, 400);
    }

    // Server-side RevenueCat verification
    const rcRes = await fetch(`${REVENUECAT_API}/${user.id}`, {
      headers: {
        Authorization: `Bearer ${rcApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!rcRes.ok) {
      const text = await rcRes.text();
      console.error("RevenueCat lookup failed:", rcRes.status, text);
      return json({ error: "Could not verify purchase" }, 502);
    }

    const rcData = await rcRes.json();
    const entitlements = rcData?.subscriber?.entitlements ?? {};
    const nonSubs = rcData?.subscriber?.non_subscriptions ?? {};

    const hasEntitlement = !!entitlements[ENTITLEMENT_ID];
    const hasNonSubPurchase =
      productIdentifier && Array.isArray(nonSubs[productIdentifier])
        ? nonSubs[productIdentifier].length > 0
        : false;

    if (!hasEntitlement && !hasNonSubPurchase) {
      console.error("No active entitlement or purchase for user", user.id);
      return json({ error: "No active purchase found" }, 403);
    }

    // Service-role upsert — bypasses RLS
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: existing } = await adminClient
      .from("user_challenges")
      .select("id, payment_status")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing) {
      if (existing.payment_status !== "paid") {
        const { error: updateErr } = await adminClient
          .from("user_challenges")
          .update({ payment_status: "paid", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (updateErr) {
          console.error("Update failed:", updateErr);
          return json({ error: "Failed to update enrollment" }, 500);
        }
      }
    } else {
      const { error: insertErr } = await adminClient
        .from("user_challenges")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          payment_status: "paid",
        });
      if (insertErr) {
        console.error("Insert failed:", insertErr);
        return json({ error: "Failed to create enrollment" }, 500);
      }
    }

    return json({ success: true });
  } catch (err) {
    console.error("unlock-iap-challenge error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
