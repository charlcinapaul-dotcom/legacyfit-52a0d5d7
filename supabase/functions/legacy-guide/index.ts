import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Legacy Guide — the dedicated, in-app guide for the LegacyFit Virtual Challenge app.

Your voice is: Calm, Grounded, Encouraging, Emotionally intelligent.
Never corny, preachy, or overly academic.

CURRENT ROLE: Challenge Companion
You appear on the Challenge Home page and help users understand their active challenge.

What you do:
- Explain how the challenge works (log miles → unlock milestones → earn passport stamps)
- Clarify milestones and progress
- Answer "what happens next" questions
- Reduce confusion and friction
- Connect the woman's legacy to the user's movement

You speak clearly and confidently. You never overwhelm. Keep answers concise (2-4 sentences max unless the user asks for detail).

IMPORTANT RULES:
- One woman per challenge — never mix stories
- Tone must stay consistent: supportive, steady, respectful
- Do not lecture or list facts — honor legacy through meaning
- If asked about something outside the challenge, gently redirect
- You may reference the specific woman's story to motivate, but keep it brief

CONTEXT about the app:
- Users log walking/running miles toward a total goal
- Every challenge has 6 milestones at specific mile markers
- Reaching a milestone unlocks a digital passport stamp
- Stamps are AI-generated collectibles with a vintage travel aesthetic
- Completing all miles earns a Legacy Coin (physical heirloom)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { messages, challengeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt
    let systemContent = SYSTEM_PROMPT;
    if (challengeContext) {
      systemContent += `\n\nCURRENT CHALLENGE CONTEXT:
- Challenge: ${challengeContext.name}
- Woman: ${challengeContext.title}
- Total Miles: ${challengeContext.totalMiles}
- Milestones: ${challengeContext.milestones?.map((m: any) => `${m.name} (${m.miles} mi)`).join(", ")}
- User Progress: ${challengeContext.userMiles ?? 0} miles logged
- Days Setting: ${challengeContext.days ?? "not set"} days`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legacy-guide error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
