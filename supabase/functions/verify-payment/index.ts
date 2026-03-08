import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Authenticate the caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const challengeId = session.metadata?.challenge_id;
    const userId = session.metadata?.user_id;

    if (!challengeId || !userId) {
      throw new Error("Invalid session metadata");
    }

    // Verify the authenticated user matches the session owner
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Check if enrollment already exists
    const { data: existing } = await supabaseAdmin
      .from("user_challenges")
      .select("id, payment_status")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing && existing.payment_status === "paid") {
      return new Response(JSON.stringify({ success: true, already_enrolled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert enrollment — idempotent via unique(user_id, challenge_id)
    const { error: upsertError } = await supabaseAdmin
      .from("user_challenges")
      .upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          payment_status: "paid",
          stripe_payment_id: session.payment_intent as string,
        },
        { onConflict: "user_id,challenge_id" }
      );

    if (upsertError) {
      throw new Error(`Failed to record enrollment: ${upsertError.message}`);
    }

    // Record payment — idempotent via unique(stripe_checkout_session_id)
    const { error: paymentError } = await supabaseAdmin.from("payments").upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        amount_cents: session.amount_total || 1299,
        status: "paid",
        stripe_payment_id: session.payment_intent as string,
        stripe_checkout_session_id: sessionId,
      },
      { onConflict: "stripe_checkout_session_id" }
    );

    if (paymentError) {
      console.warn("Payment record insert warning:", paymentError.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
