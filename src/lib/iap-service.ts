/**
 * Apple In-App Purchase service using RevenueCat via @capgo/capacitor-purchases.
 * Only active on iOS native builds; web falls through to Stripe.
 */
import { Capacitor } from "@capacitor/core";

// RevenueCat product / entitlement identifiers
const REVENUECAT_APPLE_API_KEY = "appl_WQBLYzsTnzzkgRfZZIyrHjGkYhS";
const ENTITLEMENT_ID = "premium";
const MONTHLY_PRODUCT_ID = "legacyfit.monthlypass";

/** Returns true when running inside the iOS Capacitor shell */
export function isNativeIOS(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

/** Lazy-load the Purchases plugin only on native iOS to avoid web import errors */
async function getPurchases() {
  const { CapacitorPurchases } = await import("@capgo/capacitor-purchases");
  return CapacitorPurchases;
}

/** Configure RevenueCat — call once on app launch (iOS only) */
export async function initIAP(appUserId?: string): Promise<void> {
  if (!isNativeIOS()) return;

  const Purchases = await getPurchases();
  await Purchases.configure({
    apiKey: REVENUECAT_APPLE_API_KEY,
    ...(appUserId ? { appUserID: appUserId } : {}),
  });
}

/** Identify the RevenueCat user (call after auth login) */
export async function identifyIAPUser(userId: string): Promise<void> {
  if (!isNativeIOS()) return;
  const Purchases = await getPurchases();
  await Purchases.logIn({ appUserID: userId });
}

/** Check if the user currently has the premium entitlement */
export async function hasActiveSubscription(): Promise<boolean> {
  if (!isNativeIOS()) return false;

  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  return !!entitlement;
}

/** Purchase the monthly subscription via Apple IAP. Returns true on success. */
export async function purchaseMonthlyPass(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isNativeIOS()) return { success: false, error: "Not on iOS" };

  const Purchases = await getPurchases();

  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: [MONTHLY_PRODUCT_ID],
    });

    if (!products || products.length === 0) {
      return { success: false, error: "Product not found in App Store." };
    }

    const { customerInfo } = await Purchases.purchaseProduct({
      productIdentifier: MONTHLY_PRODUCT_ID,
    });

    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isActive };
  } catch (err: unknown) {
    // User cancelled
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("cancelled") || msg.includes("canceled") || msg.includes("PURCHASE_CANCELLED")) {
      return { success: false, error: "Purchase cancelled." };
    }
    return { success: false, error: msg };
  }
}

/** Restore previous purchases. Returns true if premium is now active. */
export async function restorePurchases(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isNativeIOS()) return { success: false, error: "Not on iOS" };

  const Purchases = await getPurchases();

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isActive };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/** Get customer info for syncing to backend */
export async function getCustomerInfo() {
  if (!isNativeIOS()) return null;
  const Purchases = await getPurchases();
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}
