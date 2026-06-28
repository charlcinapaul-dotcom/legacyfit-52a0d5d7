import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

    // Auth check - admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bearerToken = authHeader.replace("Bearer ", "").trim();
    const isServiceRole = bearerToken === supabaseServiceKey;

    if (!isServiceRole) {
      // Any authenticated user can trigger on-demand milestone audio generation.
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userError } = await userClient.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!elevenLabsKey) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let milestoneId: string | undefined;
    try {
      const body = await req.json();
      milestoneId = body?.milestoneId;
    } catch (e) {
      console.error("Invalid JSON body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON body", audioUrl: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!milestoneId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: milestoneId", audioUrl: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch milestone
    const { data: milestone, error: fetchError } = await supabase
      .from("milestones")
      .select("id, title, historical_event, audio_url, challenge_id")
      .eq("id", milestoneId)
      .single();

    if (fetchError || !milestone) {
      throw new Error(`Milestone not found: ${milestoneId}`);
    }

    if (milestone.audio_url) {
      return new Response(JSON.stringify({ message: "Audio already exists", audioUrl: milestone.audio_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const textToSpeak = milestone.historical_event || milestone.title;
    if (!textToSpeak) {
      throw new Error("No text available for TTS");
    }

    console.log(`Generating audio for milestone: ${milestone.title}`);

    // Call ElevenLabs TTS - using "Charlie P" voice (warm female)
    const voiceId = "DLvjJrjQopAT03aOblQr"; // Charlie P
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.95,
          },
        }),
      },
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      // Gracefully handle quota/auth errors — return null audioUrl instead of 500
      if (ttsResponse.status === 401 || ttsResponse.status === 429) {
        console.warn(`ElevenLabs quota/auth issue [${ttsResponse.status}]: ${errorText}`);
        return new Response(
          JSON.stringify({ audioUrl: null, warning: `ElevenLabs unavailable: ${ttsResponse.status}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`ElevenLabs API error [${ttsResponse.status}]: ${errorText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload to storage
    const fileName = `${milestone.challenge_id}/${milestoneId}.mp3`;
    const { error: uploadError } = await supabase.storage.from("milestone-audio").upload(fileName, audioBytes, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("milestone-audio").getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Save URL to milestones table
    const { error: updateError } = await supabase
      .from("milestones")
      .update({ audio_url: audioUrl })
      .eq("id", milestoneId);

    if (updateError) {
      throw new Error(`Failed to update milestone: ${updateError.message}`);
    }

    console.log(`Audio generated successfully for: ${milestone.title}`);

    return new Response(JSON.stringify({ success: true, audioUrl, milestone: milestone.title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating milestone audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
