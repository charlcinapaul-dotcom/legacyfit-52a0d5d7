import { STEPS_PER_MILE } from "@/lib/health-sync";

/** Maximum miles allowed in a single mile_entries row (matches DB validate_mile_entry trigger). */
export const MAX_SINGLE_ENTRY_MILES = 7;

/** Round to 2 decimals using standard half-up rounding. */
export function roundMiles(miles: number): number {
  return Math.round(miles * 100) / 100;
}

/**
 * Compute the miles to insert for a single day after:
 *   1. converting steps to miles
 *   2. subtracting miles already synced for that day
 *   3. capping the remainder at MAX_SINGLE_ENTRY_MILES (7)
 *
 * Returns 0 when there is nothing left to log (negative or zero remainder).
 */
export function capDailyRemainingMiles(
  steps: number,
  alreadySyncedMiles: number,
): number {
  const safeSteps = Number.isFinite(steps) && steps > 0 ? steps : 0;
  const safeAlready =
    Number.isFinite(alreadySyncedMiles) && alreadySyncedMiles > 0
      ? alreadySyncedMiles
      : 0;

  const milesForDay = roundMiles(safeSteps / STEPS_PER_MILE);
  const remaining = roundMiles(milesForDay - safeAlready);

  if (remaining <= 0) return 0;
  if (remaining > MAX_SINGLE_ENTRY_MILES) return MAX_SINGLE_ENTRY_MILES;
  return remaining;
}
