/**
 * Apple In-App Purchase service using RevenueCat via @revenuecat/purchases-capacitor.
 * Only active on iOS native builds; web falls through to Stripe.
 */
import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

const REVENUECAT_APPLE_API_KEY = "appl_WQBLYzsTnzzkgRfZZIyrHjGkYhS";
const ENTITLEMENT_ID = "premium";

/** Returns true when running inside the iOS Capacitor shell */
export function isNativeIOS(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

/** Configure RevenueCat — call once on app launch (iOS only) */
export async function initIAP(appUserId?: string): Promise<void> {
  if (!isNativeIOS()) return;
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

/** Race a promise against a timeout (ms). Throws Error("IAP_TIMEOUT") on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("IAP_TIMEOUT")), ms)
    ),
  ]);
}

/** Purchase the monthly subscription via Apple IAP. Returns true on success. */
export async function purchaseMonthlyPass(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isNativeIOS()) return { success: false, error: "Not on iOS" };

  const Purchases = await getPurchases();

  try {
    console.log("IAP: fetching offerings...");
    const offerings = await withTimeout(Purchases.getOfferings(), 15000);
    console.log("IAP: offerings received");
    const currentOffering = offerings.current;

    if (!currentOffering || !currentOffering.monthly) {
      return { success: false, error: "Monthly subscription not found in offerings." };
    }

    const monthlyPackage = currentOffering.monthly;

    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: monthlyPackage,
    });

    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isActive };
  } catch (err: unknown) {
    return handlePurchaseError(err);
  }
}

/**
 * Purchase the one-time digital access product via Apple IAP.
 * Requires "legacyfit.digital" to be registered in App Store Connect and RevenueCat.
 */
export async function purchaseDigitalAccess(): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log("IAP: purchaseDigitalAccess called");
  console.log("IAP: isNativeIOS =", isNativeIOS());
  if (!isNativeIOS()) return { success: false, error: "Not on iOS" };

  const Purchases = await getPurchases();
  console.log("IAP: getPurchases complete");

  try {
    console.log("IAP: fetching offerings...");
    const offerings = await withTimeout(Purchases.getOfferings(), 15000);
    console.log("IAP: offerings received");
    const currentOffering = offerings.current;

    if (!currentOffering) {
      return { success: false, error: "No offerings available." };
    }

    // Look for a package with the digital access product
    const allPackages = currentOffering.availablePackages || [];
    const digitalPkg = allPackages.find(
      (pkg) => pkg.product?.identifier === "legacyfit.digital"
    );

    if (!digitalPkg) {
      // Fall back to monthly subscription if digital product not yet configured
      return purchaseMonthlyPass();
    }

    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: digitalPkg,
    });

    const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: isActive };
  } catch (err: unknown) {
    return handlePurchaseError(err);
  }
}

function handlePurchaseError(err: unknown): { success: false; error: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === "IAP_TIMEOUT") {
    return { success: false, error: "Purchase timed out. Please check your connection and try again." };
  }
  if (msg.includes("cancelled") || msg.includes("canceled") || msg.includes("PURCHASE_CANCELLED")) {
    return { success: false, error: "Purchase cancelled." };
  }
  return { success: false, error: msg };
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
