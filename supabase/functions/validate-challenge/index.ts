import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── helpers ────────────────────────────────────────────────────────────────

/** Count sentences in a string using terminal punctuation (.  !  ?) */
function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;
  const matches = text.trim().match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : 0;
}

/** Slugify a string → lowercase-hyphenated */
function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── validation rules ────────────────────────────────────────────────────────

interface ValidationResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
  summary: Record<string, boolean>;
  challenge?: Record<string, unknown>;
  milestones?: Record<string, unknown>[];
}

interface Milestone {
  id: string;
  order_index: number;
  miles_required: number;
  title: string;
  stamp_title: string | null;
  stamp_copy: string | null;
  location_name: string | null;
  historical_event: string | null;
  audio_url: string | null;
  stamp_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  stamp_mileage_display: string | null;
}

function validateChallenge(
  challenge: Record<string, unknown>,
  milestones: Milestone[],
  allStampTitles: Set<string>,
  challengeId: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary: Record<string, boolean> = {};

  // ── Challenge-level checks ─────────────────────────────────────────────────

  // 1. slug
  const hasSlug = !!challenge.slug && String(challenge.slug).trim().length > 0;
  summary["challenge.slug_present"] = hasSlug;
  if (!hasSlug) errors.push("Challenge is missing a slug.");
  else {
    const expectedSlug = toSlug(String(challenge.slug));
    if (String(challenge.slug) !== expectedSlug)
      warnings.push(
        `Slug "${challenge.slug}" is not fully lowercase-hyphenated. Expected "${expectedSlug}".`
      );
  }

  // 2. edition
  const hasEdition =
    !!challenge.edition && String(challenge.edition).trim().length > 0;
  summary["challenge.edition_present"] = hasEdition;
  if (!hasEdition) errors.push("Challenge is missing an edition.");

  // 3. total_miles matches last milestone
  const sortedByMile = [...milestones].sort(
    (a, b) => a.miles_required - b.miles_required
  );
  const lastMileRequired =
    sortedByMile.length > 0
      ? sortedByMile[sortedByMile.length - 1].miles_required
      : null;
  const totalMilesMatch =
    lastMileRequired !== null &&
    Number(challenge.total_miles) === lastMileRequired;
  summary["challenge.total_miles_matches_last_milestone"] = totalMilesMatch;
  if (!totalMilesMatch)
    errors.push(
      `challenge.total_miles (${challenge.total_miles}) does not match the highest milestone miles_required (${lastMileRequired}).`
    );

  // 4. is_active should be false until verified (warn only)
  if (challenge.is_active === true) {
    warnings.push(
      "challenge.is_active is true — challenges should remain inactive until all validation passes."
    );
  }

  // ── Milestone count ────────────────────────────────────────────────────────

  const exactlySix = milestones.length === 6;
  summary["milestones.count_is_6"] = exactlySix;
  if (!exactlySix)
    errors.push(
      `Expected exactly 6 milestones, found ${milestones.length}.`
    );

  // ── First-mile gate ────────────────────────────────────────────────────────

  const hasOneMileGate = milestones.some(
    (m) => Number(m.miles_required) === 1
  );
  summary["milestones.first_mile_gate_at_1"] = hasOneMileGate;
  if (!hasOneMileGate)
    errors.push(
      "No milestone at miles_required = 1. The first-mile gate is required for every challenge."
    );

  // ── order_index sequential 1-6 ────────────────────────────────────────────

  const indices = milestones.map((m) => m.order_index).sort((a, b) => a - b);
  const validIndices =
    milestones.length === 6 &&
    indices.every((v, i) => v === i + 1);
  summary["milestones.order_index_sequential_1_to_6"] = validIndices;
  if (!validIndices)
    errors.push(
      `Milestone order_index values are not sequential 1–6. Found: [${indices.join(", ")}].`
    );

  // ── miles_required ascending ──────────────────────────────────────────────

  const ascending = sortedByMile.every(
    (m, i) => i === 0 || m.miles_required > sortedByMile[i - 1].miles_required
  );
  summary["milestones.miles_required_ascending"] = ascending;
  if (!ascending)
    errors.push("Milestone miles_required values are not strictly ascending.");

  // ── Per-milestone checks ───────────────────────────────────────────────────

  const seenStampTitlesThisChallenge = new Set<string>();

  for (const m of milestones) {
    const label = `Milestone ${m.order_index} (${m.miles_required} mi, "${m.title}")`;

    // stamp_title present & unique across platform
    if (!m.stamp_title || !m.stamp_title.trim()) {
      errors.push(`${label}: missing stamp_title.`);
      summary[`milestone_${m.order_index}.stamp_title_unique`] = false;
    } else {
      const normalised = m.stamp_title.trim().toLowerCase();
      const duplicateInPlatform = allStampTitles.has(normalised);
      const duplicateInChallenge = seenStampTitlesThisChallenge.has(normalised);
      const isUnique = !duplicateInPlatform && !duplicateInChallenge;
      summary[`milestone_${m.order_index}.stamp_title_unique`] = isUnique;
      if (!isUnique)
        errors.push(
          `${label}: stamp_title "${m.stamp_title}" is already used by another milestone. All stamp titles must be globally unique.`
        );
      seenStampTitlesThisChallenge.add(normalised);
    }

    // stamp_copy present
    const hasStampCopy = !!m.stamp_copy && m.stamp_copy.trim().length > 0;
    summary[`milestone_${m.order_index}.stamp_copy_present`] = hasStampCopy;
    if (!hasStampCopy) errors.push(`${label}: missing stamp_copy.`);

    // location_name present
    const hasLocation =
      !!m.location_name && m.location_name.trim().length > 0;
    summary[`milestone_${m.order_index}.location_name_present`] = hasLocation;
    if (!hasLocation) errors.push(`${label}: missing location_name.`);

    // coordinates present
    const hasCoords = m.latitude !== null && m.longitude !== null;
    summary[`milestone_${m.order_index}.coordinates_present`] = hasCoords;
    if (!hasCoords) errors.push(`${label}: missing latitude/longitude.`);

    // historical_event — exactly 3 sentences
    const sentenceCount = countSentences(m.historical_event ?? "");
    const exactlyThree = sentenceCount === 3;
    summary[`milestone_${m.order_index}.historical_event_3_sentences`] =
      exactlyThree;
    if (!m.historical_event || !m.historical_event.trim()) {
      errors.push(
        `${label}: historical_event is empty (required for ElevenLabs audio generation).`
      );
    } else if (!exactlyThree) {
      errors.push(
        `${label}: historical_event has ${sentenceCount} sentence(s) — exactly 3 are required for Matilda voice narration. Text: "${m.historical_event.substring(0, 80)}..."`
      );
    }

    // stamp_mileage_display present
    const hasDisplay =
      !!m.stamp_mileage_display && m.stamp_mileage_display.trim().length > 0;
    summary[`milestone_${m.order_index}.stamp_mileage_display_present`] =
      hasDisplay;
    if (!hasDisplay)
      errors.push(`${label}: missing stamp_mileage_display (e.g. "1 MILE").`);

    // audio_url — warn if still null (trigger should populate it)
    if (!m.audio_url) {
      warnings.push(
        `${label}: audio_url is null — ElevenLabs audio may not have generated yet. Check the generate-milestone-audio trigger.`
      );
    }

    // stamp_image_url — warn if still null
    if (!m.stamp_image_url) {
      warnings.push(
        `${label}: stamp_image_url is null — run the generate-stamp-image function before going live.`
      );
    }
  }

  const pass = errors.length === 0;
  return { pass, errors, warnings, summary };
}

// ─── handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth — admin only
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service-role client for DB reads so RLS doesn't block admin queries
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check admin role
  const userId = claimsData.claims.sub;
  const { data: roleRow } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return new Response(
      JSON.stringify({ error: "Forbidden — admin role required" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Parse body
  let challengeId: string | null = null;
  try {
    const body = await req.json();
    challengeId = body.challengeId ?? null;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body. Provide { challengeId }." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (!challengeId) {
    return new Response(
      JSON.stringify({ error: "Missing required field: challengeId" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Fetch the challenge
  const { data: challenge, error: challengeErr } = await adminClient
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .maybeSingle();

  if (challengeErr || !challenge) {
    return new Response(
      JSON.stringify({ error: `Challenge not found: ${challengeId}` }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Fetch milestones for this challenge
  const { data: milestones, error: milestonesErr } = await adminClient
    .from("milestones")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("order_index", { ascending: true });

  if (milestonesErr) {
    return new Response(
      JSON.stringify({ error: `Failed to fetch milestones: ${milestonesErr.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Collect all stamp_titles from every OTHER challenge to check uniqueness
  const { data: otherMilestones } = await adminClient
    .from("milestones")
    .select("stamp_title")
    .neq("challenge_id", challengeId);

  const allStampTitles = new Set<string>(
    (otherMilestones ?? [])
      .map((m: { stamp_title: string | null }) =>
        m.stamp_title?.trim().toLowerCase()
      )
      .filter(Boolean) as string[]
  );

  // Run validation
  const result = validateChallenge(
    challenge as Record<string, unknown>,
    (milestones ?? []) as Milestone[],
    allStampTitles,
    challengeId
  );

  // Attach challenge + milestone data to response for review
  result.challenge = challenge as Record<string, unknown>;
  result.milestones = (milestones ?? []) as unknown as Record<string, unknown>[];

  return new Response(JSON.stringify(result, null, 2), {
    status: result.pass ? 200 : 422,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
