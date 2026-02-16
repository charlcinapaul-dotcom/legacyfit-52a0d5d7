/**
 * Health Sync Abstraction Layer
 * 
 * Provides a unified interface for step data from multiple sources:
 * - Manual entry (web, always available)
 * - Apple HealthKit (future, requires Capacitor + native plugin)
 * - Google Health Connect (future, requires Capacitor + native plugin)
 * 
 * Architecture: Each provider implements HealthProvider interface.
 * The active provider is selected based on platform detection.
 */

export type HealthSource = "manual" | "apple_health" | "google_fit";

export interface StepEntry {
  steps: number;
  miles: number;
  source: HealthSource;
  date: string; // ISO date string
}

export interface HealthProvider {
  source: HealthSource;
  isAvailable: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  getTodaySteps: () => Promise<number>;
  disconnect: () => void;
}

// Conversion constant
export const STEPS_PER_MILE = 2000;

export function stepsToMiles(steps: number): number {
  return Math.round((steps / STEPS_PER_MILE) * 100) / 100;
}

export function milesToSteps(miles: number): number {
  return Math.round(miles * STEPS_PER_MILE);
}

/**
 * Manual provider — always available on all platforms.
 */
export const manualProvider: HealthProvider = {
  source: "manual",
  isAvailable: async () => true,
  requestPermissions: async () => true,
  getTodaySteps: async () => 0, // Manual entry doesn't auto-fetch
  disconnect: () => {},
};

/**
 * Placeholder for Apple HealthKit provider.
 * Will be implemented when Capacitor native build is ready.
 */
export const appleHealthProvider: HealthProvider = {
  source: "apple_health",
  isAvailable: async () => {
    // Will check for Capacitor + iOS + HealthKit plugin
    return false;
  },
  requestPermissions: async () => false,
  getTodaySteps: async () => 0,
  disconnect: () => {},
};

/**
 * Placeholder for Google Health Connect provider.
 * Will be implemented when Capacitor native build is ready.
 */
export const googleHealthProvider: HealthProvider = {
  source: "google_fit",
  isAvailable: async () => {
    // Will check for Capacitor + Android + Health Connect plugin
    return false;
  },
  requestPermissions: async () => false,
  getTodaySteps: async () => 0,
  disconnect: () => {},
};

/**
 * Detect platform and return available providers.
 */
export async function getAvailableProviders(): Promise<HealthProvider[]> {
  const providers: HealthProvider[] = [manualProvider];

  if (await appleHealthProvider.isAvailable()) {
    providers.push(appleHealthProvider);
  }
  if (await googleHealthProvider.isAvailable()) {
    providers.push(googleHealthProvider);
  }

  return providers;
}
