import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ensureHealthReadAuthorization,
  HEALTH_PERMISSION_DENIED_MESSAGE,
  isNativeHealthPlatform,
} from "@/lib/capacitor-health";

export function useHealthPermissionPrompt() {
  const denialToastShownRef = useRef(false);

  useEffect(() => {
    if (!isNativeHealthPlatform()) return;

    let cancelled = false;

    const promptForLoggedInUser = async (userId?: string) => {
      if (!userId || cancelled) return;

      try {
        const result = await ensureHealthReadAuthorization(true);

        if (!result.granted && result.prompted && !denialToastShownRef.current) {
          denialToastShownRef.current = true;
          toast({
            title: "Health access not enabled",
            description: HEALTH_PERMISSION_DENIED_MESSAGE,
          });
        }
      } catch (error) {
        console.warn("Health permission prompt skipped:", error);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      void promptForLoggedInUser(user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        void promptForLoggedInUser(session.user.id);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
}