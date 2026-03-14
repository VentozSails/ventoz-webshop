export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { supabaseAdmin, decryptFields } from "@/lib/supabase-admin";

interface ImapConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  last_fetched_uid?: number;
}

async function verifyStaffUser(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  // Try Supabase getUser first
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data?.user) return data.user.id;
  } catch { /* ignore */ }

  // Fallback: decode JWT payload (handles publishable key ES256 tokens)
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      if (payload.sub) return payload.sub;
    }
  } catch { /* ignore */ }

  return null;
}

async function loadImapConfig(): Promise<ImapConfig | null> {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "imap_order_config")
    .single();

  if (error || !data) return null;

  const raw = data.value as Record<string, unknown>;
  const decrypted = await decryptFields(raw, ["password"]);

  return {
    host: decrypted.host as string,
    port: (decrypted.port as number) || 993,
    username: decrypted.username as string,
    password: decrypted.password as string,
    last_fetched_uid: (decrypted.last_fetched_uid as number) || 0,
  };
}

async function handleTest(config: ImapConfig) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.port === 993,
    auth: { user: config.username, pass: config.password },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const mb = client.mailbox;
      const count = mb && typeof mb === "object" && "exists" in mb ? (mb as { exists: number }).exists : 0;
      return NextResponse.json({
        success: true,
        message: `Verbinding geslaagd! INBOX bevat ${count} berichten.`,
      });
    } finally {
      lock.release();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Verbindingsfout: ${msg}` }, { status: 500 });
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}

async function handleFetch(config: ImapConfig, lastUid: number) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.port === 993,
    auth: { user: config.username, pass: config.password },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const sinceDate = new Date(2026, 0, 1);

      const searchCriteria: Record<string, unknown> = { since: sinceDate };
      if (lastUid > 0) {
        searchCriteria.uid = `${lastUid + 1}:*`;
      }

      const uids: number[] = [];
      try {
        for await (const msg of client.fetch(searchCriteria, { uid: true })) {
          if (msg.uid > lastUid) uids.push(msg.uid);
        }
      } catch {
        // No messages found
      }

      uids.sort((a, b) => a - b);

      if (uids.length === 0) {
        return NextResponse.json({ emails: [], uids: [] });
      }

      const emails: Array<{ uid: number; raw: string }> = [];
      for (const uid of uids) {
        try {
          const download = await client.download(String(uid), undefined, { uid: true });
          const chunks: Buffer[] = [];
          for await (const chunk of download.content) {
            chunks.push(Buffer.from(chunk));
          }
          const raw = Buffer.concat(chunks).toString("utf-8");
          emails.push({ uid, raw });
        } catch (e) {
          console.error(`Fetch UID ${uid} failed:`, e);
        }
      }

      return NextResponse.json({ emails, uids });
    } finally {
      lock.release();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `IMAP-fout: ${msg}` }, { status: 500 });
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyStaffUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify user is staff
    const { data: userRow } = await supabaseAdmin
      .from("ventoz_users")
      .select("is_owner, is_admin, user_type")
      .eq("auth_user_id", userId)
      .maybeSingle();

    const isStaff =
      userRow?.is_owner ||
      userRow?.is_admin ||
      ["owner", "admin", "medewerker"].includes(userRow?.user_type || "");

    if (!isStaff) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const mode = body.mode as string;

    const config = await loadImapConfig();
    if (!config) {
      return NextResponse.json({ error: "IMAP not configured" }, { status: 500 });
    }

    if (mode === "test") {
      return await handleTest(config);
    }

    if (mode === "fetch") {
      const lastUid = (body.last_fetched_uid as number) ?? config.last_fetched_uid ?? 0;
      return await handleFetch(config, lastUid);
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (e) {
    console.error("IMAP API error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
