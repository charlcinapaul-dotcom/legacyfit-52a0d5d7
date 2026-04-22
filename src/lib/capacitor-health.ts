import { Capacitor } from "@capacitor/core";
import type {
  AuthorizationStatus,
  HealthDataType,
  HealthPlugin,
} from "@capgo/capacitor-health";

export const HEALTH_READ_TYPES: HealthDataType[] = ["steps", "distance"];

export const HEALTH_PERMISSION_DENIED_MESSAGE =
  "Health access helps LegacyFit sync your walking data automatically. You can still log miles manually anytime.";

export function isNativeHealthPlatform() {
  if (!Capacitor.isNativePlatform()) return false;

  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android";
}

export async function loadHealthPlugin(): Promise<HealthPlugin> {
  if (!isNativeHealthPlatform()) {
    throw new Error("Health sync is only available on iOS or Android devices.");
  }

  const plugin = await import("@capgo/capacitor-health");
  return plugin.Health;
}

export function hasHealthReadAuthorization(status: AuthorizationStatus) {
  return HEALTH_READ_TYPES.every((dataType) => status.readAuthorized.includes(dataType));
}

export async function ensureHealthReadAuthorization(promptIfNeeded = true) {
  const Health = await loadHealthPlugin();
  const availability = await Health.isAvailable();

  if (!availability.available) {
    throw new Error(
      availability.reason ||
        (Capacitor.getPlatform() === "android"
          ? "Health Connect is not available on this device."
          : "Health data is not available on this device.")
    );
  }

  const existingStatus = await Health.checkAuthorization({
    read: HEALTH_READ_TYPES,
    write: [],
  });

  if (hasHealthReadAuthorization(existingStatus)) {
    return {
      Health,
      granted: true,
      prompted: false,
      status: existingStatus,
    };
  }

  if (!promptIfNeeded) {
    return {
      Health,
      granted: false,
      prompted: false,
      status: existingStatus,
    };
  }

  const requestedStatus = await Health.requestAuthorization({
    read: HEALTH_READ_TYPES,
    write: [],
  });

  return {
    Health,
    granted: hasHealthReadAuthorization(requestedStatus),
    prompted: true,
    status: requestedStatus,
  };
}