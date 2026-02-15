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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, challengeId, totalMiles }: UnlockRequest = await req.json();

    if (!userId || !challengeId || totalMiles === undefined) {
      throw new Error("Missing required fields: userId, challengeId, totalMiles");
    }

    // SERVER-SIDE ENROLLMENT VALIDATION
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

    // Get all milestones for this challenge where miles_required <= totalMiles
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

    // Get already unlocked stamps for this user
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

    const stampRecords = newMilestones.map((m) => ({
      user_id: userId,
      milestone_id: m.id,
    }));

    const { error: insertError } = await supabase.from("user_passport_stamps").insert(stampRecords);
    if (insertError) {
      console.error("Error inserting stamps:", insertError);
      throw insertError;
    }

    const milestoneRecords = newMilestones.map((m) => ({
      user_id: userId,
      milestone_id: m.id,
    }));
    await supabase.from("user_milestones").insert(milestoneRecords).select();

    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;

    const unlockedStamps = newMilestones.map((m) => ({
      milestoneId: m.id,
      title: m.title,
      stampTitle: m.stamp_title || m.title,
      stampCopy: m.stamp_copy || "",
      milesRequired: m.miles_required,
      locationName: m.location_name || "",
      stampImageUrl: m.stamp_image_url,
      audioUrl: m.audio_url || null,
    }));

    if (userEmail) {
      for (const stamp of unlockedStamps) {
        try {
          await supabase.functions.invoke("send-stamp-email", {
            body: {
              email: userEmail,
              stampTitle: stamp.stampTitle,
              stampCopy: stamp.stampCopy,
              milesRequired: stamp.milesRequired,
              locationName: stamp.locationName,
              stampImageUrl: stamp.stampImageUrl,
            },
          });
        } catch (emailError) {
          console.error(`Failed to send email for stamp ${stamp.stampTitle}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        unlockedStamps,
        message: `Unlocked ${unlockedStamps.length} new stamp(s)!`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error in check-milestone-unlocks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
