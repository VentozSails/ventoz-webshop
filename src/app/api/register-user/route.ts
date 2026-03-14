import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    if (!user_id || !email) {
      return NextResponse.json({ error: "user_id and email required" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("ventoz_users")
      .select("id, auth_user_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      if (!existing.auth_user_id) {
        await supabaseAdmin
          .from("ventoz_users")
          .update({ auth_user_id: user_id, status: "geregistreerd" })
          .eq("id", existing.id);
      }
      return NextResponse.json({ ok: true, action: "linked" });
    }

    await supabaseAdmin.from("ventoz_users").insert({
      auth_user_id: user_id,
      email: email.toLowerCase(),
      user_type: "klant",
      status: "geregistreerd",
      is_particulier: true,
    });

    return NextResponse.json({ ok: true, action: "created" });
  } catch (err) {
    console.error("register-user error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
