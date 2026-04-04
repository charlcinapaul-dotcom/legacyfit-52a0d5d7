import { corsHeaders } from "@supabase/supabase-js/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, email, message } = await req.json();

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return new Response(JSON.stringify({ error: "Valid name is required (max 200 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Valid message is required (max 5000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedName = name.trim().slice(0, 200);
    const sanitizedEmail = email.trim().slice(0, 255);
    const sanitizedMessage = message.trim().slice(0, 5000);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `LegacyFit Contact <noreply@notify.legacyfitvirtual.com>`,
        to: ["support@legacyfitvirtual.com"],
        reply_to: sanitizedEmail,
        subject: `Contact Form: ${sanitizedName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <hr />
          <p>${sanitizedMessage.replace(/\n/g, "<br />")}</p>
        `,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Resend error:", errorBody);
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
