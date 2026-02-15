import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, challengeId } = await req.json();

    if (!code || !challengeId) {
      return new Response(JSON.stringify({ error: "Missing code or challengeId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the reward code
    const { data: rewardCode, error: findError } = await supabase
      .from("reward_codes")
      .select("*")
      .eq("code", code.toLowerCase())
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError || !rewardCode) {
      return new Response(JSON.stringify({ error: "Invalid reward code. Make sure you're using your own earned code." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rewardCode.is_redeemed) {
      return new Response(JSON.stringify({ error: "This reward code has already been used." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is already enrolled in this challenge
    const { data: existing } = await supabase
      .from("user_challenges")
      .select("id, payment_status")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "You're already enrolled in this challenge." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enroll the user (upsert)
    if (existing) {
      await supabase
        .from("user_challenges")
        .update({ payment_status: "paid", stripe_payment_id: `reward_${rewardCode.code}` })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("user_challenges")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          payment_status: "paid",
          stripe_payment_id: `reward_${rewardCode.code}`,
          miles_logged: 0,
        });
    }

    // Mark reward code as redeemed
    await supabase
      .from("reward_codes")
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
        redeemed_for_challenge_id: challengeId,
      })
      .eq("id", rewardCode.id);

    return new Response(JSON.stringify({ success: true, message: "You're enrolled! Enjoy your free challenge." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error redeeming reward code:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
