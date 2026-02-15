import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 5; // Process 5 at a time to avoid timeout

    // Fetch milestones without audio
    const { data: milestones, error } = await supabase
      .from("milestones")
      .select("id, title, stamp_copy, challenge_id")
      .is("audio_url", null)
      .order("challenge_id")
      .order("order_index")
      .limit(limit);

    if (error) throw error;

    if (!milestones || milestones.length === 0) {
      return new Response(
        JSON.stringify({ message: "All milestones already have audio", generated: 0, remaining: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count total remaining
    const { count } = await supabase
      .from("milestones")
      .select("id", { count: "exact", head: true })
      .is("audio_url", null);

    console.log(`Processing ${milestones.length} of ${count} remaining milestones`);

    const voiceId = "XrExE9yKIg1WjnnlVkGX"; // Matilda
    const results: { id: string; title: string; success: boolean; error?: string }[] = [];

    for (const milestone of milestones) {
      try {
        const textToSpeak = milestone.stamp_copy || milestone.title;
        if (!textToSpeak) {
          results.push({ id: milestone.id, title: milestone.title, success: false, error: "No text" });
          continue;
        }

        console.log(`Generating audio for: ${milestone.title}`);

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
          const errText = await ttsResponse.text();
          throw new Error(`ElevenLabs [${ttsResponse.status}]: ${errText}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBytes = new Uint8Array(audioBuffer);

        const fileName = `${milestone.challenge_id}/${milestone.id}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from("milestone-audio")
          .upload(fileName, audioBytes, { contentType: "audio/mpeg", upsert: true });

        if (uploadError) throw new Error(`Upload: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from("milestone-audio").getPublicUrl(fileName);

        await supabase.from("milestones").update({ audio_url: urlData.publicUrl }).eq("id", milestone.id);

        results.push({ id: milestone.id, title: milestone.title, success: true });

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Failed for ${milestone.title}: ${msg}`);
        results.push({ id: milestone.id, title: milestone.title, success: false, error: msg });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const remaining = (count || 0) - succeeded;

    return new Response(
      JSON.stringify({
        message: `Generated ${succeeded}/${milestones.length} audio files`,
        generated: succeeded,
        remaining,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in batch audio generation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
