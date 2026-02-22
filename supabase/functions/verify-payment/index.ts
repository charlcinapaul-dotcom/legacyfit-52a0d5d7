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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("User not authenticated");

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

    if (!challengeId || userId !== user.id) {
      throw new Error("Invalid session metadata");
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

    if (existing) {
      // Update existing pending enrollment
      await supabaseAdmin
        .from("user_challenges")
        .update({
          payment_status: "paid",
          stripe_payment_id: session.payment_intent as string,
        })
        .eq("id", existing.id);
    } else {
      // Create new enrollment
      await supabaseAdmin
        .from("user_challenges")
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          payment_status: "paid",
          stripe_payment_id: session.payment_intent as string,
        });
    }

    // Record payment
    await supabaseAdmin.from("payments").insert({
      user_id: userId,
      challenge_id: challengeId,
      amount_cents: session.amount_total || 2900,
      status: "paid",
      stripe_payment_id: session.payment_intent as string,
      stripe_checkout_session_id: sessionId,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
