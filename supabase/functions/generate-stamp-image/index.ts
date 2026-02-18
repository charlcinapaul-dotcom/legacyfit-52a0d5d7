import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  milestoneId: string;
  title: string;
  locationName: string;
  milesRequired: number;
  stampCopy?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check - admin only
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

    // Check admin role
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = serviceClient;

    const { milestoneId, title, locationName, milesRequired, stampCopy }: GenerateRequest = await req.json();

    if (!milestoneId || !title) {
      throw new Error("Missing required fields: milestoneId, title");
    }

    console.log(`Generating stamp image for milestone: ${title}`);

    // Check if stamp image already exists
    const { data: existingImage } = await supabase
      .from("passport_stamp_images")
      .select("image_url")
      .eq("milestone_id", milestoneId)
      .maybeSingle();

    if (existingImage?.image_url) {
      console.log("Stamp image already exists, returning cached version");
      return new Response(JSON.stringify({ imageUrl: existingImage.image_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate stamp image using Lovable AI
    const prompt = `Create a vintage passport-style stamp design with the following elements:
- Style: Authentic vintage travel/passport stamp with worn, distressed edges
- Shape: Circular or rectangular with decorative border
- Color scheme: Deep blue, burgundy, or sepia tones typical of official stamps
- Main text: "${title}" prominently displayed
- Location: "${locationName || "Journey Milestone"}"
- Mileage badge: "${milesRequired} MILES" in a small badge or banner
- Additional text: "${stampCopy || ""}"
- Include decorative elements like postal marks, stars, or laurel wreaths
- Brand mark: Small "LegacyFit" text at bottom
- Make it look authentic, like a real passport stamp from a prestigious institution
- Ultra high resolution, detailed textures, professional quality`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
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

    console.log("Stamp image generated successfully");

    // Store the image URL in the database
    const { error: insertError } = await supabase.from("passport_stamp_images").upsert({
      milestone_id: milestoneId,
      image_url: imageData,
    });

    if (insertError) {
      console.error("Error storing stamp image:", insertError);
      // Don't fail - still return the image
    }

    // Also update the milestone's stamp_image_url
    await supabase
      .from("milestones")
      .update({ stamp_image_url: imageData })
      .eq("id", milestoneId);

    return new Response(JSON.stringify({ imageUrl: imageData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in generate-stamp-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
