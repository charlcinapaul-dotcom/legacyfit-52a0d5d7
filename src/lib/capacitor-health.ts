import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";
import type {
  AuthorizationStatus,
  HealthDataType,
} from "@capgo/capacitor-health";

export const HEALTH_READ_TYPES: HealthDataType[] = ["steps", "distance"];

export const HEALTH_PERMISSION_DENIED_MESSAGE =
  "Health access helps LegacyFit sync your walking data automatically. You can still log miles manually anytime.";

export function isNativeHealthPlatform() {
  if (!Capacitor.isNativePlatform()) return false;
  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android";
}

export function hasHealthReadAuthorization(status: AuthorizationStatus) {
  const result = HEALTH_READ_TYPES.every((dataType) => status.readAuthorized.includes(dataType));
  console.log("[HealthSync] hasHealthReadAuthorization:", result, JSON.stringify(status));
  return result;
}

export async function ensureHealthReadAuthorization(promptIfNeeded = true) {
  console.log("[HealthSync] ensureHealthReadAuthorization called");
  console.log("[HealthSync] isNativePlatform:", Capacitor.isNativePlatform());
  console.log("[HealthSync] platform:", Capacitor.getPlatform());

  if (!isNativeHealthPlatform()) {
    throw new Error("Health sync is only available on iOS or Android devices.");
  }

  console.log("[HealthSync] calling isAvailable...");
  const availability = await Health.isAvailable();
  console.log("[HealthSync] isAvailable result:", JSON.stringify(availability));

  if (!availability.available) {
    throw new Error(
      availability.reason ||
        (Capacitor.getPlatform() === "android"
          ? "Health Connect is not available on this device."
          : "Health data is not available on this device.")
    );
  }

  console.log("[HealthSync] calling checkAuthorization...");
  const existingStatus = await Health.checkAuthorization({
    read: HEALTH_READ_TYPES,
    write: [],
  });
  console.log("[HealthSync] checkAuthorization result:", JSON.stringify(existingStatus));

  if (hasHealthReadAuthorization(existingStatus)) {
    console.log("[HealthSync] already authorized, skipping prompt");
    return { Health, granted: true, prompted: false, status: existingStatus };
  }

  if (!promptIfNeeded) {
    return { Health, granted: false, prompted: false, status: existingStatus };
  }

  console.log("[HealthSync] calling requestAuthorization...");
  const requestedStatus = await Health.requestAuthorization({
    read: HEALTH_READ_TYPES,
    write: [],
  });
  console.log("[HealthSync] requestAuthorization result:", JSON.stringify(requestedStatus));

  return {
    Health,
    granted: hasHealthReadAuthorization(requestedStatus),
    prompted: true,
    status: requestedStatus,
  };
}
