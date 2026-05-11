import { useEffect, useState } from "react";

interface Signup {
  id: string;
  created_at: string;
  name: string | null;
  email: string;
  interest: string;
  current_tools: string | null;
  want_most: string | null;
  source: string;
}

export default function Leads() {
  const [rows, setRows] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/signups")
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      (r.name ?? "").toLowerCase().includes(q)
    );
  });

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const interestLabel: Record<string, string> = {
    ttc: "TTC",
    cycle_sync: "Cycle Sync",
    pcos: "PCOS",
    exploring: "Exploring",
  };

  const mono: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  };

  return (
    <main
      style={{
        backgroundColor: "#0A0A0C",
        color: "#F2EDE4",
        minHeight: "100vh",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 300, fontSize: 28, marginBottom: 24 }}>
          Beta Leads
        </h1>

        {/* Stat cards */}
        <div
          style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}
        >
          <div
            style={{
              flex: "1 1 200px",
              padding: 20,
              backgroundColor: "#14141A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#8B8478",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
                ...mono,
              }}
            >
              Total signups
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, color: "#E8C16F" }}>
              {rows.length}
            </p>
          </div>
          {Object.entries(interestLabel).map(([key, label]) => (
            <div
              key={key}
              style={{
                flex: "1 1 160px",
                padding: 20,
                backgroundColor: "#14141A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#8B8478",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                  ...mono,
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: 32, fontWeight: 300, color: "#E8C16F" }}>
                {rows.filter((r) => r.interest === key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <input
          type="text"
          placeholder="Filter by name or email…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            height: 44,
            padding: "0 16px",
            backgroundColor: "#14141A",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: "#F2EDE4",
            fontSize: 14,
            outline: "none",
            marginBottom: 24,
          }}
        />

        {/* Table */}
        {loading ? (
          <p style={{ color: "#8B8478" }}>Loading…</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
            >
              <thead>
                <tr>
                  {[
                    "Date",
                    "Name",
                    "Email",
                    "Interest",
                    "Current Tools",
                    "Want Most",
                    "Source",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        color: "#E8C16F",
                        fontWeight: 500,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        whiteSpace: "nowrap",
                        ...mono,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        whiteSpace: "nowrap",
                        ...mono,
                      }}
                    >
                      {fmtDate(r.created_at)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>{r.name ?? "—"}</td>
                    <td style={{ padding: "10px 12px", ...mono }}>{r.email}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {interestLabel[r.interest] ?? r.interest}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.current_tools ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.want_most ?? "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#5A554E", ...mono }}>
                      {r.source}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#5A554E",
                      }}
                    >
                      {rows.length === 0 ? "No signups yet." : "No matches."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
