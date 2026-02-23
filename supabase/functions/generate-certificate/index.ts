import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CertificateRequest {
  challengeId: string;
  challengeName: string;
  displayName: string;
  totalMiles: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { challengeId, challengeName, displayName, totalMiles }: CertificateRequest = await req.json();

    if (!challengeId || !challengeName) {
      throw new Error("Missing required fields");
    }

    console.log(`Generating certificate for ${displayName} - ${challengeName}`);

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from("certificates")
      .select("image_url")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existing?.image_url) {
      console.log("Certificate already exists, returning cached");
      return new Response(JSON.stringify({ imageUrl: existing.image_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `Create a prestigious completion certificate with these specifications:
- Style: Elegant, formal certificate of achievement with ornate gold borders and decorative flourishes
- Background: Rich dark navy/midnight blue (#1a1a2e) with subtle texture
- Border: Ornate gold (#d4af37) decorative frame with corner medallions
- Header: "CERTIFICATE OF COMPLETION" in elegant gold serif lettering
- Brand: "LegacyFit" in gold below the header with subtle glow
- Main text: "This certifies that" in smaller gold text
- Name: "${displayName || "Explorer"}" in large, bold white elegant serif font
- Achievement: "has successfully completed" in gold
- Challenge: "${challengeName}" in large white bold text
- Details: "${totalMiles} Miles" in a gold badge/medallion
- Date: "${completionDate}" in white
- Footer: "Every Mile Unlocks History" motto in gold italic
- Include: Official seal/stamp mark in bottom corner, laurel wreath decorations
- Quality: Ultra high resolution, professional print-quality certificate
- Aspect ratio: 4:3 landscape orientation`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const imageData = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error("No image generated from AI");
    }

    console.log("Certificate image generated successfully");

    // Store certificate in database using the authenticated userId
    const { error: insertError } = await supabase.from("certificates").insert({
      user_id: userId,
      challenge_id: challengeId,
      image_url: imageData,
    });

    if (insertError) {
      console.error("Error storing certificate:", insertError);
    }

    return new Response(JSON.stringify({ imageUrl: imageData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in generate-certificate:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
