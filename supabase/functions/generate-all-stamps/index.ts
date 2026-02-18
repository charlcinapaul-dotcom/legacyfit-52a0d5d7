import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Milestone {
  id: string;
  title: string;
  location_name: string | null;
  miles_required: number;
  stamp_copy: string | null;
  stamp_image_url: string | null;
}

interface GenerationResult {
  milestoneId: string;
  title: string;
  success: boolean;
  error?: string;
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData } = await supabase
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

    // Parse optional limit from request body
    let limit = 50; // Default limit
    try {
      const body = await req.json();
      if (body.limit) limit = body.limit;
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`Starting batch stamp generation with limit: ${limit}`);

    // Query all milestones without stamp_image_url
    const { data: milestones, error: queryError } = await supabase
      .from("milestones")
      .select("id, title, location_name, miles_required, stamp_copy, stamp_image_url")
      .is("stamp_image_url", null)
      .limit(limit);

    if (queryError) {
      throw new Error(`Failed to query milestones: ${queryError.message}`);
    }

    if (!milestones || milestones.length === 0) {
      console.log("No milestones found without stamp images");
      return new Response(
        JSON.stringify({ 
          message: "All milestones already have stamp images",
          generated: 0,
          results: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${milestones.length} milestones without stamp images`);

    const results: GenerationResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process each milestone
    for (const milestone of milestones as Milestone[]) {
      console.log(`Generating stamp for: ${milestone.title}`);

      try {
        // Generate stamp image using Lovable AI
        const prompt = `Create a vintage passport-style stamp design with the following elements:
- Style: Authentic vintage travel/passport stamp with worn, distressed edges
- Shape: Circular or rectangular with decorative border
- Color scheme: Deep blue, burgundy, or sepia tones typical of official stamps
- Main text: "${milestone.title}" prominently displayed
- Location: "${milestone.location_name || "Journey Milestone"}"
- Mileage badge: "${milestone.miles_required} MILES" in a small badge or banner
- Additional text: "${milestone.stamp_copy || ""}"
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
          console.error(`AI API error for ${milestone.title}:`, errorText);
          
          // Check for rate limiting
          if (response.status === 429) {
            results.push({
              milestoneId: milestone.id,
              title: milestone.title,
              success: false,
              error: "Rate limited - try again later"
            });
            failCount++;
            // Wait longer on rate limit
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
          
          throw new Error(`AI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const imageData = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData) {
          throw new Error("No image generated from AI");
        }

        console.log(`Stamp image generated for: ${milestone.title}`);

        // Store the image URL in passport_stamp_images
        const { error: insertError } = await supabase.from("passport_stamp_images").upsert({
          milestone_id: milestone.id,
          image_url: imageData,
        });

        if (insertError) {
          console.error(`Error storing stamp image for ${milestone.title}:`, insertError);
        }

        // Update the milestone's stamp_image_url
        const { error: updateError } = await supabase
          .from("milestones")
          .update({ stamp_image_url: imageData })
          .eq("id", milestone.id);

        if (updateError) {
          console.error(`Error updating milestone ${milestone.title}:`, updateError);
        }

        results.push({
          milestoneId: milestone.id,
          title: milestone.title,
          success: true
        });
        successCount++;

        // Small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error generating stamp for ${milestone.title}:`, errorMessage);
        results.push({
          milestoneId: milestone.id,
          title: milestone.title,
          success: false,
          error: errorMessage
        });
        failCount++;
        
        // Continue to next milestone
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Batch generation complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        message: `Generated ${successCount} stamp images, ${failCount} failed`,
        generated: successCount,
        failed: failCount,
        total: milestones.length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    console.error("Error in generate-all-stamps:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
