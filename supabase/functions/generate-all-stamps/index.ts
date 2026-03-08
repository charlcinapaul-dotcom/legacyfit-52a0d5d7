import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEW_CHALLENGE_SLUGS = [
  "madam-cj-walker",
  "charles-drew",
  "mae-jemison",
  "daniel-hale-williams",
  "patricia-bath",
  "harriet-pickens",
  "benjamin-o-davis-sr",
  "willa-brown",
  "cornelius-coffey",
  "jane-bolin",
  "constance-baker-motley",
  "garrett-morgan",
  "matthew-henson",
];

interface Milestone {
  id: string;
  title: string;
  stamp_title: string | null;
  location_name: string | null;
  miles_required: number;
  stamp_copy: string | null;
  stamp_image_url: string | null;
}

interface GenerationResult {
  milestoneId: string;
  title: string;
  success: boolean;
  url?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check — admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Verify caller is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse optional limit
    let limit = 10;
    try {
      const body = await req.json();
      if (body.limit) limit = body.limit;
    } catch {
      // No body or invalid JSON — use default
    }

    console.log(`Starting stamp generation for 13 new challenges, batch limit: ${limit}`);

    // Query milestones for the 13 new challenges that are missing a stamp image
    const { data: milestones, error: queryError } = await supabase
      .from("milestones")
      .select(`
        id,
        title,
        stamp_title,
        location_name,
        miles_required,
        stamp_copy,
        stamp_image_url,
        challenges!inner(slug)
      `)
      .is("stamp_image_url", null)
      .in("challenges.slug", NEW_CHALLENGE_SLUGS)
      .limit(limit);

    if (queryError) {
      throw new Error(`Failed to query milestones: ${queryError.message}`);
    }

    if (!milestones || milestones.length === 0) {
      console.log("No milestones found without stamp images for the 13 new challenges");
      return new Response(
        JSON.stringify({
          message: "All milestones for the 13 new challenges already have stamp images",
          generated: 0,
          results: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${milestones.length} milestones without stamp images`);

    const results: GenerationResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const milestone of milestones as Milestone[]) {
      console.log(`Generating stamp for: ${milestone.title}`);

      try {
        const displayName = milestone.stamp_title || milestone.title;
        const locationLine = milestone.location_name || "Journey Milestone";
        const mileageBanner = `${milestone.miles_required} MILES`;
        const bottomArcText = milestone.stamp_copy || milestone.title;

        const prompt = `A single vintage passport stamp — circular shape, white background.

Outer ring: double concentric border (thin inner rule, thicker outer rule).
Between the rings: wheat or laurel wreath decorating the top arc; small serif capital text reading "${bottomArcText}" curved along the bottom arc; "LEGACYFIT" credit text centered at the very bottom edge of the outer ring.
Center field: bold serif all-caps name "${displayName}" as the dominant text; one line below in smaller text: "${locationLine}"; a rectangular ribbon/banner across the lower center reading "${mileageBanner}".

Ink color: deep navy blue OR burgundy red — single ink color, aged appearance.
Distressed look: uneven ink coverage, slight bleed, worn edges — rubber-stamped feel.
No photographic elements — pure illustrative stamp graphic only.
Square canvas, stamp centered on a white background.`;

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
          console.error(`AI API error for ${milestone.title}:`, errorText);
          if (response.status === 429) {
            results.push({ milestoneId: milestone.id, title: milestone.title, success: false, error: "Rate limited — try again later" });
            failCount++;
            await new Promise((r) => setTimeout(r, 5000));
            continue;
          }
          throw new Error(`AI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const imageData: string | undefined = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData) {
          throw new Error("No image generated from AI");
        }

        // Decode base64 data URL → binary → upload to storage
        const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const storagePath = `stamps/${milestone.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from("challenge-images")
          .upload(storagePath, bytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("challenge-images")
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;

        console.log(`Stamp uploaded for: ${milestone.title} → ${publicUrl}`);

        // Upsert into passport_stamp_images
        const { error: insertError } = await supabase.from("passport_stamp_images").upsert({
          milestone_id: milestone.id,
          image_url: publicUrl,
        });
        if (insertError) {
          console.error(`Error storing stamp image for ${milestone.title}:`, insertError);
        }

        // Update milestones.stamp_image_url
        const { error: updateError } = await supabase
          .from("milestones")
          .update({ stamp_image_url: publicUrl })
          .eq("id", milestone.id);
        if (updateError) {
          console.error(`Error updating milestone ${milestone.title}:`, updateError);
        }

        results.push({ milestoneId: milestone.id, title: milestone.title, success: true, url: publicUrl });
        successCount++;

        // Brief delay between generations to avoid rate limiting
        await new Promise((r) => setTimeout(r, 2000));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error generating stamp for ${milestone.title}:`, errorMessage);
        results.push({ milestoneId: milestone.id, title: milestone.title, success: false, error: errorMessage });
        failCount++;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`Batch complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        message: `Generated ${successCount} stamp image(s), ${failCount} failed`,
        generated: successCount,
        failed: failCount,
        total: milestones.length,
        results,
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
