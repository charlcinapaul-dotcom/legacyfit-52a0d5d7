import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UnlockRequest {
  userId: string;
  challengeId: string;
  totalMiles: number;
  isFirstMile?: boolean;
}

interface UnlockedStamp {
  milestoneId: string;
  title: string;
  stampTitle: string;
  stampCopy: string;
  milesRequired: number;
  locationName: string;
  stampImageUrl: string | null;
  audioUrl: string | null;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Preserve original auth header for forwarding to other edge functions
    const originalAuthHeader = req.headers.get("Authorization");

    if (!originalAuthHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Verify the authenticated user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: originalAuthHeader } },
    });
    const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();

    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { userId, challengeId, totalMiles, isFirstMile = false }: UnlockRequest = await req.json();

    if (!userId || !challengeId || totalMiles === undefined) {
      throw new Error("Missing required fields: userId, challengeId, totalMiles");
    }

    if (userId !== authUser.id) {
      console.warn(`BLOCKED: Auth user ${authUser.id} tried to act as ${userId}`);
      return new Response(
        JSON.stringify({ error: "Unauthorized - user ID mismatch" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // ── FREE FIRST-MILE PATH ──────────────────────────────────────────────────
    // Award only the 1-mile milestone stamp. Intentionally skips user_milestones
    // to preserve the preview-to-enrollment distinction.
    if (isFirstMile) {
      console.log(`Free first-mile stamp for user ${userId}, challenge ${challengeId}`);

      const { data: firstMilestone, error: msError } = await supabase
        .from("milestones")
        .select("id, title, stamp_title, stamp_copy, miles_required, location_name, stamp_image_url, audio_url")
        .eq("challenge_id", challengeId)
        .eq("miles_required", 1)
        .maybeSingle();

      if (msError) {
        console.error("Error fetching first milestone:", msError);
        throw msError;
      }

      if (!firstMilestone) {
        return new Response(
          JSON.stringify({ unlockedStamps: [], message: "No 1-mile milestone found for this challenge" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Guard: don't double-insert if stamp already exists
      const { data: existing } = await supabase
        .from("user_passport_stamps")
        .select("id")
        .eq("user_id", userId)
        .eq("milestone_id", firstMilestone.id)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ unlockedStamps: [], message: "First-mile stamp already awarded" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const { error: insertError } = await supabase
        .from("user_passport_stamps")
        .insert({ user_id: userId, milestone_id: firstMilestone.id });

      if (insertError) {
        console.error("Error inserting first-mile stamp:", insertError);
        throw insertError;
      }

      const unlockedStamp: UnlockedStamp = {
        milestoneId: firstMilestone.id,
        title: firstMilestone.title,
        stampTitle: firstMilestone.stamp_title || firstMilestone.title,
        stampCopy: firstMilestone.stamp_copy || "",
        milesRequired: Number(firstMilestone.miles_required),
        locationName: firstMilestone.location_name || "",
        stampImageUrl: firstMilestone.stamp_image_url,
        audioUrl: firstMilestone.audio_url || null,
      };

      return new Response(
        JSON.stringify({ unlockedStamps: [unlockedStamp], message: "First-mile stamp unlocked!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── PAID ENROLLMENT PATH ─────────────────────────────────────────────────
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("user_challenges")
      .select("id, payment_status")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (enrollmentError) {
      console.error("Error checking enrollment:", enrollmentError);
      throw new Error("Failed to verify enrollment");
    }

    if (!enrollment) {
      console.warn(`BLOCKED: User ${userId} not enrolled (paid) in challenge ${challengeId}`);
      return new Response(
        JSON.stringify({ error: "Not enrolled in this challenge", unlockedStamps: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log(`Checking milestone unlocks for user ${userId}, challenge ${challengeId}, total miles: ${totalMiles}`);

    // Get all milestones where miles_required <= totalMiles
    const { data: eligibleMilestones, error: milestonesError } = await supabase
      .from("milestones")
      .select("id, title, stamp_title, stamp_copy, miles_required, location_name, stamp_image_url, audio_url")
      .eq("challenge_id", challengeId)
      .lte("miles_required", totalMiles)
      .order("miles_required", { ascending: true });

    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError);
      throw milestonesError;
    }

    if (!eligibleMilestones || eligibleMilestones.length === 0) {
      return new Response(JSON.stringify({ unlockedStamps: [], message: "No new stamps unlocked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Filter out already-unlocked stamps
    const milestoneIds = eligibleMilestones.map((m) => m.id);
    const { data: existingStamps, error: existingError } = await supabase
      .from("user_passport_stamps")
      .select("milestone_id")
      .eq("user_id", userId)
      .in("milestone_id", milestoneIds);

    if (existingError) {
      console.error("Error fetching existing stamps:", existingError);
      throw existingError;
    }

    const existingMilestoneIds = new Set(existingStamps?.map((s) => s.milestone_id) || []);
    const newMilestones = eligibleMilestones.filter((m) => !existingMilestoneIds.has(m.id));

    if (newMilestones.length === 0) {
      return new Response(JSON.stringify({ unlockedStamps: [], message: "All stamps already unlocked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Found ${newMilestones.length} new stamps to unlock`);

    // Insert passport stamps
    const stampRecords = newMilestones.map((m) => ({ user_id: userId, milestone_id: m.id }));
    const { error: insertError } = await supabase.from("user_passport_stamps").insert(stampRecords);
    if (insertError) {
      console.error("Error inserting stamps:", insertError);
      throw insertError;
    }

    // Insert user_milestones
    const milestoneRecords = newMilestones.map((m) => ({ user_id: userId, milestone_id: m.id }));
    await supabase.from("user_milestones").insert(milestoneRecords).select();

    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;

    const unlockedStamps: UnlockedStamp[] = newMilestones.map((m) => ({
      milestoneId: m.id,
      title: m.title,
      stampTitle: m.stamp_title || m.title,
      stampCopy: m.stamp_copy || "",
      milesRequired: m.miles_required,
      locationName: m.location_name || "",
      stampImageUrl: m.stamp_image_url,
      audioUrl: m.audio_url || null,
    }));

    // Fire-and-forget stamp emails
    if (userEmail && originalAuthHeader) {
      const userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: originalAuthHeader } },
      });
      for (const stamp of unlockedStamps) {
        userScopedClient.functions.invoke("send-stamp-email", {
          body: {
            stampTitle: stamp.stampTitle,
            stampCopy: stamp.stampCopy,
            milesRequired: stamp.milesRequired,
            locationName: stamp.locationName,
            stampImageUrl: stamp.stampImageUrl,
          },
        }).catch((emailError) => {
          console.error(`Failed to send email for stamp ${stamp.stampTitle}:`, emailError);
        });
      }
    }

    return new Response(
      JSON.stringify({ unlockedStamps, message: `Unlocked ${unlockedStamps.length} new stamp(s)!` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in check-milestone-unlocks:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
