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

    // Enforce one-challenge limit: check if user already has any active (paid) challenge
    const { data: existingChallenges } = await supabase
      .from("user_challenges")
      .select("id, challenge_id, payment_status")
      .eq("user_id", user.id)
      .eq("payment_status", "paid");

    if (existingChallenges && existingChallenges.length > 0) {
      const alreadyInThis = existingChallenges.some((c: any) => c.challenge_id === challengeId);
      if (alreadyInThis) {
        return new Response(JSON.stringify({ error: "You're already enrolled in this challenge." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Beta limit: You can only have one active challenge at a time. Complete your current challenge first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate beta code
    const { data: betaCode, error: findError } = await supabase
      .from("beta_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (findError || !betaCode) {
      return new Response(JSON.stringify({ error: "Invalid beta code. Please check your code and try again." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (betaCode.times_used >= betaCode.max_uses) {
      return new Response(JSON.stringify({ error: "This beta code has reached its maximum number of uses." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enroll the user with paid status
    const { data: existing } = await supabase
      .from("user_challenges")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_challenges")
        .update({ payment_status: "paid", stripe_payment_id: `beta_${betaCode.code}` })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("user_challenges")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          payment_status: "paid",
          stripe_payment_id: `beta_${betaCode.code}`,
          miles_logged: 0,
        });
    }

    // Increment usage count
    await supabase
      .from("beta_codes")
      .update({ times_used: betaCode.times_used + 1 })
      .eq("id", betaCode.id);

    return new Response(JSON.stringify({ success: true, message: "Welcome to the beta! You're enrolled and ready to start logging miles." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error redeeming beta code:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
