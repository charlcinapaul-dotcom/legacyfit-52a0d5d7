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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Read the raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process paid sessions
    if (session.payment_status !== "paid") {
      console.log(`[stripe-webhook] Session ${session.id} not paid yet, skipping`);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const challengeId = session.metadata?.challenge_id;
    const userId = session.metadata?.user_id;

    if (!challengeId || !userId) {
      console.error(`[stripe-webhook] Missing metadata on session ${session.id}:`, session.metadata);
      return new Response(JSON.stringify({ error: "Missing session metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[stripe-webhook] Processing enrollment — userId: ${userId}, challengeId: ${challengeId}`);

    // Check if enrollment already exists and is paid (idempotency)
    const { data: existing } = await supabaseAdmin
      .from("user_challenges")
      .select("id, payment_status")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      console.log(`[stripe-webhook] Enrollment already paid for session ${session.id}, skipping`);
      return new Response(JSON.stringify({ received: true, already_enrolled: true }), {
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
      console.error(`[stripe-webhook] Failed to upsert enrollment:`, upsertError);
      return new Response(JSON.stringify({ error: "Failed to record enrollment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[stripe-webhook] Enrollment upserted for user ${userId}, challenge ${challengeId}`);

    // Record payment — idempotent via unique(stripe_checkout_session_id)
    const { error: paymentError } = await supabaseAdmin.from("payments").upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        amount_cents: session.amount_total ?? 0,
        status: "paid",
        stripe_payment_id: session.payment_intent as string,
        stripe_checkout_session_id: session.id,
      },
      { onConflict: "stripe_checkout_session_id" }
    );

    if (paymentError) {
      console.warn(`[stripe-webhook] Payment upsert warning:`, paymentError.message);
    } else {
      console.log(`[stripe-webhook] Payment record written for session ${session.id}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
