import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StampEmailRequest {
  stampTitle: string;
  stampCopy: string;
  milesRequired: number;
  locationName: string;
  stampImageUrl?: string;
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
    const userEmail = claimsData.claims.email as string;
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email on account" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email send");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { stampTitle, stampCopy, milesRequired, locationName, stampImageUrl }: StampEmailRequest = await req.json();

    if (!stampTitle) {
      throw new Error("Missing required fields: stampTitle");
    }

    console.log(`Sending stamp email to ${userEmail} for stamp: ${stampTitle}`);

    const stampImageHtml = stampImageUrl
      ? `<div style="text-align: center; margin: 30px 0;">
          <img src="${stampImageUrl}" alt="${stampTitle} Stamp" style="max-width: 300px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" />
        </div>`
      : "";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Earned a LegacyFit Passport Stamp!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: 'Georgia', serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #d4af37; font-size: 32px; margin: 0; letter-spacing: 2px;">🏅 PASSPORT STAMP EARNED!</h1>
      <p style="color: #8b7355; font-size: 14px; margin-top: 10px; text-transform: uppercase; letter-spacing: 3px;">LegacyFit Achievement Unlocked</p>
    </div>
    <div style="background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
      ${stampImageHtml}
      <div style="text-align: center;">
        <h2 style="color: #d4af37; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">${stampTitle}</h2>
        <p style="color: #a0a0a0; font-size: 16px; margin: 0 0 15px 0;">📍 ${locationName || "Journey Milestone"}</p>
        <div style="background: #d4af37; color: #1a1a2e; display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">${milesRequired} MILES ACHIEVED</div>
        ${stampCopy ? `<p style="color: #c0c0c0; font-size: 15px; margin-top: 20px; line-height: 1.6; font-style: italic;">"${stampCopy}"</p>` : ""}
      </div>
    </div>
    <div style="text-align: center; padding: 20px; background: rgba(212, 175, 55, 0.1); border-radius: 12px; margin-bottom: 30px;">
      <p style="color: #d4af37; font-size: 18px; margin: 0; font-style: italic;">"You're building your LegacyFit legacy, one mile at a time."</p>
    </div>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://legacyfit.com/passport" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #1a1a2e; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">VIEW YOUR PASSPORT →</a>
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
        from: "LegacyFit <stamps@legacyfit.com>",
        to: [userEmail],
        subject: `🏅 You Earned a Passport Stamp: ${stampTitle}`,
        html: emailHtml,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Stamp email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, emailId: responseData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in send-stamp-email:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
