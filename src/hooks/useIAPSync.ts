import { useEffect } from "react";
import { isNativeIOS, initIAP, identifyIAPUser, getCustomerInfo } from "@/lib/iap-service";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to initialize RevenueCat on iOS app launch and sync subscription status.
 * Call this once in App.tsx or a top-level layout component.
 */
export function useIAPSync() {
  useEffect(() => {
    if (!isNativeIOS()) return;

    const setup = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Initialize RevenueCat
        await initIAP(user?.id);
        
        // If logged in, identify and sync
        if (user) {
          await identifyIAPUser(user.id);
          await syncSubscriptionStatus();
        }
      } catch (err) {
        console.error("IAP init error:", err);
      }
    };

    setup();

    // Re-sync when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          try {
            await identifyIAPUser(session.user.id);
            await syncSubscriptionStatus();
          } catch (err) {
            console.error("IAP identify error:", err);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}

/** Sync RevenueCat subscription status to the backend */
async function syncSubscriptionStatus() {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return;

    const premiumEntitlement = customerInfo.entitlements.active["premium"];
    const isActive = !!premiumEntitlement;

    await supabase.functions.invoke("sync-iap-subscription", {
      body: {
        isActive,
        expiresDate: premiumEntitlement?.expirationDate || null,
        productIdentifier: premiumEntitlement?.productIdentifier || null,
      },
    });
  } catch (err) {
    console.error("IAP sync error:", err);
  }
}
