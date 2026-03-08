import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Thematic prompts for each challenge
const challengeImagePrompts: Record<string, string> = {
  // ── Women's History Edition ──────────────────────────────────────────────
  "malala": "A beautiful artistic illustration of books, education, Pakistani mountains in background, symbols of empowerment and hope, warm golden lighting, inspirational atmosphere, 16:9 aspect ratio hero banner, ultra high resolution",
  "maya": "An artistic illustration of poetry and literature, a caged bird taking flight, stage lights and artistic expression, warm amber tones, literary celebration, 16:9 aspect ratio hero banner, ultra high resolution",
  "katherine": "A stunning artistic illustration of NASA rockets launching into space, mathematical equations and stars, retro-futuristic space exploration, deep blues and cosmic colors, 16:9 aspect ratio hero banner, ultra high resolution",
  "wilma": "An artistic illustration of Olympic track and field, gold medals, triumphant athlete silhouette, red clay track, victory and determination, warm sunset lighting, 16:9 aspect ratio hero banner, ultra high resolution",
  "eleanor": "An artistic illustration of United Nations flags, diplomacy and human rights symbols, dove of peace, elegant governmental atmosphere, dignified blue and gold tones, 16:9 aspect ratio hero banner, ultra high resolution",
  "sojourner": "An artistic illustration of the freedom trail, historical landmarks of liberation, strength and resilience symbols, earth tones with golden highlights, American historical journey, 16:9 aspect ratio hero banner, ultra high resolution",
  "ida": "An artistic illustration of journalism and press, vintage newspapers, justice scales, investigative reporting, sepia and black tones with gold accents, truth and justice theme, 16:9 aspect ratio hero banner, ultra high resolution",
  "fannie": "An artistic illustration of voting rights, civil rights marches, Mississippi delta landscape, community organizing, warm earthy tones, democratic participation theme, 16:9 aspect ratio hero banner, ultra high resolution",
  "toni": "An artistic illustration of literary excellence, books and storytelling, Nobel Prize symbolism, African American literary heritage, rich purple and gold tones, 16:9 aspect ratio hero banner, ultra high resolution",
  "pride": "A vibrant artistic illustration of rainbow pride colors, Stonewall Inn historical landmark, pride flags waving, celebration of LGBTQ+ history, bold rainbow spectrum colors, 16:9 aspect ratio hero banner, ultra high resolution",

  // ── First Steps: Black Pioneers Edition ─────────────────────────────────
  "madam-cj-walker": "An artistic illustration of a Victorian-era beauty salon with gleaming glass bottles of hair products and lotions on marble shelves, warm golden candlelight, early 20th century American entrepreneurship, rich amber and mahogany tones, symbols of prosperity and self-made success, 16:9 aspect ratio hero banner, ultra high resolution",
  "charles-drew": "A dramatic artistic illustration of blood plasma vials glowing crimson on a laboratory bench, Red Cross insignia, sterile white walls with warm clinical lighting, pioneering medical breakthroughs, deep red and white color palette, stethoscope and scientific instruments, 16:9 aspect ratio hero banner, ultra high resolution",
  "mae-jemison": "A stunning artistic illustration of a space shuttle launching into a vast cosmic sky, Earth's blue curve visible below, stars and nebula in the distance, STEM equations etched in light, deep midnight blues and cosmic purples with bright rocket exhaust, 16:9 aspect ratio hero banner, ultra high resolution",
  "daniel-hale-williams": "An elegant artistic illustration of a pioneering surgical operating theater, anatomical diagrams of the human heart floating in soft light, medical instruments on a steel tray, cool blues and crisp whites, early modern medicine atmosphere, 16:9 aspect ratio hero banner, ultra high resolution",
  "patricia-bath": "A radiant artistic illustration of a laser beam refracting through glass optics and eye diagrams, inventor's laboratory with medical patents pinned to the wall, bright electric blue and white tones, scientific precision and innovation, 16:9 aspect ratio hero banner, ultra high resolution",
  "harriet-pickens": "A dignified artistic illustration of a U.S. Navy ship sailing calm blue waters under an American flag, naval officer uniform with gold braid, ocean horizon at dusk, deep navy blues and warm gold tones, 16:9 aspect ratio hero banner, ultra high resolution",
  "benjamin-o-davis-sr": "A majestic artistic illustration of a WWII-era Tuskegee Airfield at sunset, military stars and medals gleaming, propeller planes lined up on a red-clay runway, olive greens and burnished gold tones, American flags and military regalia, 16:9 aspect ratio hero banner, ultra high resolution",
  "willa-brown": "A soaring artistic illustration of a vintage biplane banking through an open blue sky, aviator goggles and flowing silk scarf catching the wind, puffy white clouds below, clear sky blues and warm golden sunlight, freedom and flight, 16:9 aspect ratio hero banner, ultra high resolution",
  "cornelius-coffey": "An industrial artistic illustration of a 1930s aircraft engine being assembled in a hangar, propeller blades catching the light, grease-stained workbench with tools, Harlem Airport atmosphere, warm amber and industrial steel tones, 16:9 aspect ratio hero banner, ultra high resolution",
  "jane-bolin": "A stately artistic illustration of a New York City courthouse with grand marble columns, law books stacked open, justice scales balanced, dignified navy blue and gold tones, early civil rights era atmosphere, 16:9 aspect ratio hero banner, ultra high resolution",
  "constance-baker-motley": "A powerful artistic illustration of the U.S. Supreme Court steps bathed in golden light, NAACP seal, civil rights marchers carrying signs in silhouette, deep burgundy and marble white tones, justice and equality symbolism, 16:9 aspect ratio hero banner, ultra high resolution",
  "garrett-morgan": "A vivid artistic illustration of the invention of the traffic signal glowing amber and red against a Cleveland cityscape at night, a vintage safety hood on a workbench, inventor's blueprints spread beneath, warm amber and industrial tones, 16:9 aspect ratio hero banner, ultra high resolution",
  "matthew-henson": "A breathtaking artistic illustration of an Arctic polar expedition at the North Pole, a dog sled team pulling across cracked blue-white ice floes, the American flag planted in the snow, cool whites and icy blues with a pale golden horizon, 16:9 aspect ratio hero banner, ultra high resolution",
};

interface Challenge {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check - admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables');
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Fetch all challenges
    const { data: challenges, error: fetchError } = await supabase
      .from('challenges')
      .select('id, slug, title, image_url')
      .order('created_at');

    if (fetchError) {
      throw new Error(`Failed to fetch challenges: ${fetchError.message}`);
    }

    console.log(`Found ${challenges?.length || 0} challenges to process`);

    const results: { slug: string; success: boolean; url?: string; error?: string }[] = [];

    for (const challenge of challenges || []) {
      const slug = challenge.slug || '';
      
      // Skip if already has an image
      if (challenge.image_url) {
        console.log(`Skipping ${slug} - already has image`);
        results.push({ slug, success: true, url: challenge.image_url });
        continue;
      }

      // Get prompt for this challenge
      const prompt = challengeImagePrompts[slug];
      if (!prompt) {
        console.log(`Skipping ${slug} - no prompt defined`);
        results.push({ slug, success: false, error: 'No prompt defined' });
        continue;
      }

      console.log(`Generating image for ${slug}...`);

      try {
        // Generate image using Lovable AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            modalities: ['image', 'text'],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
        }

        const aiData = await aiResponse.json();
        const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData || !imageData.startsWith('data:image')) {
          throw new Error('No image data in response');
        }

        console.log(`Image generated for ${slug}, uploading to storage...`);

        // Extract base64 data
        const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          throw new Error('Invalid base64 image format');
        }

        const [, imageType, base64Data] = base64Match;
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        // Upload to Supabase storage
        const fileName = `${slug}-cover.${imageType === 'jpeg' ? 'jpg' : imageType}`;
        const { error: uploadError } = await supabase.storage
          .from('challenge-images')
          .upload(fileName, binaryData, {
            contentType: `image/${imageType}`,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('challenge-images')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;
        console.log(`Uploaded ${slug} image: ${publicUrl}`);

        // Update challenge with image URL
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ image_url: publicUrl })
          .eq('id', challenge.id);

        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`);
        }

        console.log(`Updated ${slug} in database`);
        results.push({ slug, success: true, url: publicUrl });

      } catch (imageError) {
        console.error(`Error processing ${slug}:`, imageError);
        results.push({ 
          slug, 
          success: false, 
          error: imageError instanceof Error ? imageError.message : 'Unknown error' 
        });
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} challenges: ${successCount} successful, ${failCount} failed`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
