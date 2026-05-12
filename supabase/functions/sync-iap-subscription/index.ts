import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REVENUECAT_API = "https://api.revenuecat.com/v1/subscribers";
const ENTITLEMENT_ID = "premium";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await anonClient.auth.getUser(token);
    const user = authData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Server-side RevenueCat verification — never trust client-supplied status
    const rcApiKey = Deno.env.get("REVENUECAT_APPLE_API_KEY");
    if (!rcApiKey) {
      console.error("REVENUECAT_APPLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const rcRes = await fetch(`${REVENUECAT_API}/${user.id}`, {
      headers: {
        Authorization: `Bearer ${rcApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!rcRes.ok) {
      const text = await rcRes.text();
      console.error("RevenueCat lookup failed:", rcRes.status, text);
      return new Response(JSON.stringify({ error: "Could not verify subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    const rcData = await rcRes.json();
    const entitlement = rcData?.subscriber?.entitlements?.[ENTITLEMENT_ID];
    const isActive = !!entitlement && (!entitlement.expires_date || new Date(entitlement.expires_date) > new Date());
    const expiresDate: string | null = entitlement?.expires_date ?? null;

    if (isActive) {
      // Upsert an active subscription record
      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            status: "active",
            plan_type: "apple_iap",
            current_period_end: expiresDate || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Upsert error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else {
      // Mark subscription as expired if it exists
      await supabase
        .from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("plan_type", "apple_iap");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Sync IAP error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
