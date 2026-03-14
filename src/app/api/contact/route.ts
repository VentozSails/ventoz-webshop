import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { naam, email, telefoon, onderwerp, bericht } = body;

    if (!naam?.trim() || !email?.trim() || !bericht?.trim()) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { data: smtpRow } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "smtp_config")
      .maybeSingle();

    if (!smtpRow?.value) {
      console.error("SMTP not configured");
      return NextResponse.json({ error: "Email service unavailable" }, { status: 500 });
    }

    const smtp = smtpRow.value as Record<string, unknown>;
    const toEmail = (smtp.from_email as string) || "info@ventoz.com";

    const { error: fnError } = await supabaseAdmin.functions.invoke("send-order-email", {
      body: {
        mode: "contact_form",
        to_email: toEmail,
        reply_to: email.trim(),
        subject: `Contact: ${onderwerp || "Vraag"} — ${naam.trim()}`,
        html_body: `
          <h2>Contactformulier ventoz.com</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee">Naam</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(naam.trim())}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee">E-mail</td><td style="padding:6px 12px;border-bottom:1px solid #eee"><a href="mailto:${escapeHtml(email.trim())}">${escapeHtml(email.trim())}</a></td></tr>
            ${telefoon ? `<tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee">Telefoon</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(telefoon.trim())}</td></tr>` : ""}
            ${onderwerp ? `<tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee">Onderwerp</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(onderwerp.trim())}</td></tr>` : ""}
            <tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Bericht</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(bericht.trim())}</td></tr>
          </table>
        `,
        plain_body: `Contactformulier ventoz.com\n\nNaam: ${naam.trim()}\nE-mail: ${email.trim()}\n${telefoon ? `Telefoon: ${telefoon.trim()}\n` : ""}${onderwerp ? `Onderwerp: ${onderwerp.trim()}\n` : ""}\nBericht:\n${bericht.trim()}`,
      },
    });

    if (fnError) {
      console.error("Contact email failed:", fnError);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
