import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CertificateEmailRequest {
  displayName: string;
  challengeName: string;
  totalMiles: number;
  certificateImageUrl?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Use authenticated user's email - never trust client-supplied email
    const userEmail = claimsData.claims.email as string;
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email on account" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping certificate email");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { displayName, challengeName, totalMiles, certificateImageUrl }: CertificateEmailRequest = await req.json();

    if (!challengeName) {
      throw new Error("Missing required fields: challengeName");
    }

    console.log(`Sending certificate email to ${userEmail} for challenge: ${challengeName}`);

    const certificateImageHtml = certificateImageUrl
      ? `<div style="text-align: center; margin: 30px 0;">
          <img src="${certificateImageUrl}" alt="Completion Certificate" style="max-width: 100%; border-radius: 8px; box-shadow: 0 8px 32px rgba(212,175,55,0.3); border: 2px solid #d4af37;" />
        </div>`
      : "";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations! Challenge Complete!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: 'Georgia', serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #d4af37; font-size: 32px; margin: 0; letter-spacing: 2px;">
        🏆 CHALLENGE COMPLETE!
      </h1>
      <p style="color: #8b7355; font-size: 14px; margin-top: 10px; text-transform: uppercase; letter-spacing: 3px;">
        LegacyFit Certificate of Completion
      </p>
    </div>
    <div style="background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: #e0e0e0; font-size: 22px; margin: 0 0 5px 0;">
        Congratulations, ${displayName || "Explorer"}!
      </h2>
      <p style="color: #a0a0a0; font-size: 16px; margin: 0 0 20px 0;">
        You've completed the
      </p>
      <h3 style="color: #d4af37; font-size: 28px; margin: 0 0 15px 0; font-weight: bold;">
        ${challengeName}
      </h3>
      <div style="background: #d4af37; color: #1a1a2e; display: inline-block; padding: 10px 24px; border-radius: 20px; font-weight: bold; font-size: 16px;">
        ${totalMiles} MILES COMPLETED
      </div>
    </div>
    ${certificateImageHtml}
    <div style="text-align: center; padding: 20px; background: rgba(212, 175, 55, 0.1); border-radius: 12px; margin-bottom: 30px;">
      <p style="color: #d4af37; font-size: 18px; margin: 0; font-style: italic;">
        "You didn't just walk miles — you walked through history."
      </p>
    </div>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://legacyfit.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #1a1a2e; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
        VIEW YOUR CERTIFICATE →
      </a>
    </div>
    <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px;">
      <p style="color: #666; font-size: 12px; margin: 0;">Keep moving. Every mile writes your story.</p>
      <p style="color: #555; font-size: 11px; margin-top: 10px;">© LegacyFit | Building Legacies Through Movement</p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LegacyFit <certificates@legacyfit.com>",
        to: [userEmail],
        subject: `🏆 Congratulations! You Completed ${challengeName}!`,
        html: emailHtml,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Certificate email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, emailId: responseData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in send-certificate-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
