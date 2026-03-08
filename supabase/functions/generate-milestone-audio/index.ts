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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!elevenLabsKey) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { milestoneId } = await req.json();

    if (!milestoneId) {
      throw new Error("Missing required field: milestoneId");
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
      return new Response(
        JSON.stringify({ message: "Audio already exists", audioUrl: milestone.audio_url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const textToSpeak = milestone.historical_event || milestone.title;
    if (!textToSpeak) {
      throw new Error("No text available for TTS");
    }

    console.log(`Generating audio for milestone: ${milestone.title}`);

    // Call ElevenLabs TTS - using "Matilda" voice (warm female)
    const voiceId = "XrExE9yKIg1WjnnlVkGX"; // Matilda
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
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`ElevenLabs API error [${ttsResponse.status}]: ${errorText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload to storage
    const fileName = `${milestone.challenge_id}/${milestoneId}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("milestone-audio")
      .upload(fileName, audioBytes, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("milestone-audio")
      .getPublicUrl(fileName);

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

    return new Response(
      JSON.stringify({ success: true, audioUrl, milestone: milestone.title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating milestone audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
