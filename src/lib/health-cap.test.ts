import { describe, it, expect } from "vitest";
import {
  capDailyRemainingMiles,
  MAX_SINGLE_ENTRY_MILES,
} from "@/lib/health-cap";
import { STEPS_PER_MILE } from "@/lib/health-sync";

describe("capDailyRemainingMiles", () => {
  it("converts steps to miles when nothing has been synced yet", () => {
    // 4000 steps / 2000 = 2 miles
    expect(capDailyRemainingMiles(4000, 0)).toBe(2);
  });

  it("subtracts miles already synced that same day", () => {
    // 6000 steps = 3 miles, 1 already synced -> 2 remaining
    expect(capDailyRemainingMiles(6000, 1)).toBe(2);
  });

  it("returns 0 when the day is already fully synced", () => {
    // 4000 steps = 2 miles, 2 already synced -> 0
    expect(capDailyRemainingMiles(4000, 2)).toBe(0);
  });

  it("returns 0 when already-synced exceeds today's miles", () => {
    expect(capDailyRemainingMiles(4000, 5)).toBe(0);
  });

  it("caps the remainder at the 7-mile single-entry limit", () => {
    // 30000 steps = 15 miles, nothing synced -> capped at 7
    expect(capDailyRemainingMiles(30000, 0)).toBe(MAX_SINGLE_ENTRY_MILES);
  });

  it("caps the remainder at 7 even after subtracting prior sync", () => {
    // 30000 steps = 15 miles, 2 already synced -> 13 remaining -> capped at 7
    expect(capDailyRemainingMiles(30000, 2)).toBe(MAX_SINGLE_ENTRY_MILES);
  });

  it("does not cap when remainder is exactly at the limit", () => {
    // 14000 steps = 7 miles, 0 already synced -> 7 (no cap needed)
    expect(capDailyRemainingMiles(7 * STEPS_PER_MILE, 0)).toBe(
      MAX_SINGLE_ENTRY_MILES,
    );
  });

  it("does not cap when remainder is just under the limit", () => {
    // 13998 steps -> 6.999 -> rounds to 7.00 -> equal to cap, returns 7
    const steps = 7 * STEPS_PER_MILE - 2;
    const result = capDailyRemainingMiles(steps, 0);
    expect(result).toBeLessThanOrEqual(MAX_SINGLE_ENTRY_MILES);
    expect(result).toBeGreaterThan(6.9);
  });

  it("rounds miles to 2 decimal places", () => {
    // 2345 steps / 2000 = 1.1725 -> 1.17
    expect(capDailyRemainingMiles(2345, 0)).toBe(1.17);
  });

  it("treats negative or invalid steps as zero", () => {
    expect(capDailyRemainingMiles(-100, 0)).toBe(0);
    expect(capDailyRemainingMiles(NaN, 0)).toBe(0);
  });

  it("treats negative already-synced miles as zero", () => {
    expect(capDailyRemainingMiles(4000, -5)).toBe(2);
  });

  it("returns 0 for a zero-step day", () => {
    expect(capDailyRemainingMiles(0, 0)).toBe(0);
  });
});
