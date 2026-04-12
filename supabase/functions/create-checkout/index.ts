import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_IDS: Record<string, string> = {
  digital: "price_1T7L5c3JzkAB6gcFg4PpYJmg",                // $12.99 Digital Collection (Live)
  boarding_pass: "price_1T7LUF3JzkAB6gcF8AGmuWcr",          // $29.00 Collector's Edition (Live)
  boarding_pass_subscriber: "price_1TLEeQ3JzkAB6gcF9EhlaMFz", // $19.00 Collector's Edition Subscriber (Live)
  subscription: "price_1TLET43JzkAB6gcF4EA4ak5S",           // $9.99/mo LegacyFit Digital Pass (Live)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { challengeId, tier, slug, shippingOrderId } = await req.json();

    // Subscription tier does not require a challengeId
    const isSubscription = tier === "subscription";
    if (!challengeId && !isSubscription) {
      return new Response(JSON.stringify({ error: "Missing challengeId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const priceId = PRICE_IDS[tier] || PRICE_IDS.digital;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or reference existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://legacyfitvirtual.lovable.app";

    let session;

    if (isSubscription) {
      // Recurring subscription checkout
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&subscription=true`,
        cancel_url: `${origin}/dashboard`,
        metadata: {
          user_id: user.id,
          tier,
          ...(shippingOrderId ? { shipping_order_id: shippingOrderId } : {}),
        },
      });
    } else {
      // One-time payment checkout
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&challenge_id=${challengeId}`,
        cancel_url: `${origin}/challenge/${slug || challengeId}`,
        metadata: {
          user_id: user.id,
          challenge_id: challengeId,
          tier,
          ...(shippingOrderId ? { shipping_order_id: shippingOrderId } : {}),
        },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
