// Phase 1-3 audio narration scripts for each woman's challenge
// Phase 1 = Beginning (milestones 1-2)
// Phase 2 = Consistency (milestones 3-4)
// Phase 3 = Resistance (milestones 5-6)

export interface PhaseScript {
  phase: number;
  label: string;
  text: string;
}

export const STORYTELLER_SCRIPTS: Record<string, PhaseScript[]> = {
  "ida": [
    { phase: 1, label: "Beginning", text: "This challenge begins with Ida B. Wells — who believed truth had to be pursued, not waited for. Starting this journey means choosing intention over silence." },
    { phase: 2, label: "Consistency", text: "Ida B. Wells knew that progress comes from showing up again and again. Your steady movement now reflects that same disciplined courage." },
    { phase: 3, label: "Resistance", text: "When resistance appeared, Ida B. Wells kept moving forward anyway. Your progress shows strength that doesn't depend on approval." },
  ],
  "sojourner": [
    { phase: 1, label: "Beginning", text: "Sojourner Truth began by claiming her voice in spaces that denied it. Starting this challenge honors the decision to stand fully in who you are." },
    { phase: 2, label: "Consistency", text: "Sojourner Truth understood the cost of persistence. Every step you take now reflects the strength to remain visible." },
    { phase: 3, label: "Resistance", text: "Long before recognition followed, Sojourner Truth kept speaking. Your continued effort shows the same resolve to keep going." },
  ],
  "fannie": [
    { phase: 1, label: "Beginning", text: "Fannie Lou Hamer began with belief, not privilege. Starting this challenge reflects faith in your ability to move forward." },
    { phase: 2, label: "Consistency", text: "Progress for Fannie Lou Hamer was never easy, but it was consistent. Your movement now honors that steady determination." },
    { phase: 3, label: "Resistance", text: "Fannie Lou Hamer pushed on when fatigue set in. Your progress shows the power of persistence." },
  ],
  "eleanor": [
    { phase: 1, label: "Beginning", text: "Eleanor Roosevelt believed courage begins with action. Starting this challenge reflects your willingness to grow." },
    { phase: 2, label: "Consistency", text: "Responsibility shaped Eleanor Roosevelt's leadership. Your consistency now reflects commitment over comfort." },
    { phase: 3, label: "Resistance", text: "Leadership required Eleanor Roosevelt to keep moving forward. Your progress shows strength built through choice." },
  ],
  "jane-addams": [
    { phase: 1, label: "Beginning", text: "Jane Addams believed meaningful change begins with care. Starting this challenge reflects intention rooted in compassion." },
    { phase: 2, label: "Consistency", text: "Service was never quick work for Jane Addams. Your steady movement honors progress built patiently." },
    { phase: 3, label: "Resistance", text: "Jane Addams stayed committed long after attention faded. Your progress reflects dedication to something larger than yourself." },
  ],
  "ruth-bader-ginsburg": [
    { phase: 1, label: "Beginning", text: "Ruth Bader Ginsburg prepared carefully before progress appeared. Starting this challenge reflects belief in long-term impact." },
    { phase: 2, label: "Consistency", text: "Change for Ruth Bader Ginsburg came through patience. Your consistency now mirrors that quiet persistence." },
    { phase: 3, label: "Resistance", text: "Ruth Bader Ginsburg remained steady when progress slowed. Your movement reflects strength built over time." },
  ],
  "maya": [
    { phase: 1, label: "Beginning", text: "Maya Angelou believed voice begins with presence. Starting this challenge honors the power of showing up." },
    { phase: 2, label: "Consistency", text: "Expression took courage for Maya Angelou. Your continued effort reflects confidence growing through action." },
    { phase: 3, label: "Resistance", text: "Maya Angelou learned strength through lived experience. Your progress shows growth shaped by consistency." },
  ],
  "toni": [
    { phase: 1, label: "Beginning", text: "Toni Morrison began with intention and discipline. Starting this challenge reflects purpose over urgency." },
    { phase: 2, label: "Consistency", text: "Depth mattered more than speed to Toni Morrison. Your steady movement honors thoughtful progress." },
    { phase: 3, label: "Resistance", text: "Toni Morrison trusted the process even when results were slow. Your progress reflects patience with purpose." },
  ],
  "wilma": [
    { phase: 1, label: "Beginning", text: "Wilma Rudolph began by believing possibility existed. Starting this challenge reflects belief in your own strength." },
    { phase: 2, label: "Consistency", text: "Training shaped Wilma Rudolph's success. Your consistency now builds resilience." },
    { phase: 3, label: "Resistance", text: "Wilma Rudolph trusted her preparation. Your progress shows belief earned through effort." },
  ],
  "malala": [
    { phase: 1, label: "Beginning", text: "Malala Yousafzai believed courage could begin young. Starting this challenge reflects belief in your voice." },
    { phase: 2, label: "Consistency", text: "Courage required repetition for Malala Yousafzai. Your continued movement honors conviction." },
    { phase: 3, label: "Resistance", text: "Malala Yousafzai stayed firm through uncertainty. Your progress reflects confidence built through action." },
  ],
  "katherine": [
    { phase: 1, label: "Beginning", text: "Katherine Johnson trusted precision and preparation. Starting this challenge reflects belief in steady progress." },
    { phase: 2, label: "Consistency", text: "Focus shaped Katherine Johnson's success. Your consistency now honors accuracy over rush." },
    { phase: 3, label: "Resistance", text: "Katherine Johnson relied on discipline through complexity. Your progress reflects trust in the process." },
  ],
  "jane-goodall": [
    { phase: 1, label: "Beginning", text: "Jane Goodall began with curiosity and compassion. Starting this challenge reflects a belief that observation can change the world." },
    { phase: 2, label: "Consistency", text: "Patience defined Jane Goodall's discoveries. Your steady movement honors the power of showing up, day after day." },
    { phase: 3, label: "Resistance", text: "Jane Goodall kept advocating when others looked away. Your progress reflects courage rooted in care." },
  ],
};

/**
 * Get the phase (1-3) for a milestone based on its order index (0-5).
 * Milestones 0-1 = Phase 1, 2-3 = Phase 2, 4-5 = Phase 3
 */
export function getMilestonePhase(milestoneIndex: number): number {
  if (milestoneIndex <= 1) return 1;
  if (milestoneIndex <= 3) return 2;
  return 3;
}

/**
 * Get the storyteller script for a specific challenge and milestone.
 */
export function getStorytellerScript(
  challengeSlug: string,
  milestoneIndex: number
): PhaseScript | null {
  const scripts = STORYTELLER_SCRIPTS[challengeSlug];
  if (!scripts) return null;
  const phase = getMilestonePhase(milestoneIndex);
  return scripts.find((s) => s.phase === phase) || null;
}
