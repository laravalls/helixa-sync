import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "crypto";
import { verifyToken } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function getVerifiedUserId(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { sub } = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return sub;
  } catch {
    return null;
  }
}

// Returns (creating if needed) the current user's Apple Health sync token.
// POST regenerates it, invalidating the previous one.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getVerifiedUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  if (req.method === "GET") {
    const rows = await sql`
      SELECT token FROM health_sync_tokens WHERE clerk_user_id = ${userId}
    `;
    let token = (rows[0] as { token: string } | undefined)?.token;
    if (!token) {
      token = randomBytes(24).toString("hex");
      await sql`
        INSERT INTO health_sync_tokens (clerk_user_id, token)
        VALUES (${userId}, ${token})
      `;
    }
    return res.json({ token });
  }

  if (req.method === "POST") {
    const token = randomBytes(24).toString("hex");
    await sql`
      INSERT INTO health_sync_tokens (clerk_user_id, token)
      VALUES (${userId}, ${token})
      ON CONFLICT (clerk_user_id) DO UPDATE SET token = EXCLUDED.token, created_at = NOW()
    `;
    return res.json({ token });
  }

  return res.status(405).json({ error: "method not allowed" });
}
