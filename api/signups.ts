import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    const rows = await sql`
      SELECT id, created_at, name, email, interest, current_tools, want_most, source
      FROM beta_signups
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  }

  if (req.method === "POST") {
    const { email, name, interest, current_tools, want_most, source } =
      req.body ?? {};

    if (!email || !interest) {
      return res.status(400).json({ error: "email and interest are required" });
    }

    const rows = await sql`
      INSERT INTO beta_signups (email, name, interest, current_tools, want_most, source)
      VALUES (
        ${String(email).trim().toLowerCase()},
        ${name ? String(name).trim() : null},
        ${interest},
        ${current_tools ? String(current_tools).trim() : null},
        ${want_most ? String(want_most).trim() : null},
        ${source ?? "app_modal"}
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id, created_at
    `;

    if (rows.length === 0) {
      return res.status(409).json({ error: "duplicate" });
    }

    return res.status(201).json(rows[0]);
  }

  return res.status(405).json({ error: "method not allowed" });
}
