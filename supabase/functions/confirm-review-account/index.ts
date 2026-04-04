// Temporary bypass for Apple App Review login access
// This function auto-confirms email verification for the App Store review test account ONLY.
// Remove this function after the app is approved.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REVIEW_EMAIL = "review@legacyfit.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // ONLY allow the exact review email — reject everything else
    if (email?.toLowerCase() !== REVIEW_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Not a review account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const reviewUser = users.find((u) => u.email?.toLowerCase() === REVIEW_EMAIL);
    if (!reviewUser) {
      return new Response(
        JSON.stringify({ error: "Review account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-confirm the email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      reviewUser.id,
      { email_confirm: true }
    );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("confirm-review-account error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
