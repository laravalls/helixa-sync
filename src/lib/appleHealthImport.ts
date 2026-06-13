import JSZip from "jszip";

export interface HealthIngestPayload {
  data: {
    metrics: {
      name: string;
      units?: string;
      data: { date: string; qty: number }[];
    }[];
  };
}

// Maps a CSV column (matched by a case-insensitive prefix on the header,
// before the trailing "(unit)") to the metric name expected by
// api/_health.ts's METRIC_MAP.
const COLUMN_METRICS: { prefix: string; name: string }[] = [
  { prefix: "resting heart rate", name: "resting_heart_rate" },
  { prefix: "heart rate variability", name: "heart_rate_variability" },
  { prefix: "sleep analysis [deep]", name: "sleep_analysis_deep" },
  { prefix: "sleep analysis [rem]", name: "sleep_analysis_rem" },
  { prefix: "sleep analysis [core]", name: "sleep_analysis_core" },
  { prefix: "sleep analysis [total]", name: "sleep_analysis_total" },
  { prefix: "step count", name: "step_count" },
  { prefix: "vo2 max", name: "vo2_max" },
  { prefix: "active energy", name: "active_energy" },
  { prefix: "apple exercise time", name: "apple_exercise_time" },
];

// Finds the HealthAutoExport-*.csv file inside the user's Apple Health
// export.zip, at any depth.
export const findHealthExportCsv = async (
  file: File,
): Promise<{ name: string; content: string }> => {
  const zip = await JSZip.loadAsync(file);
  const match = Object.values(zip.files).find(
    (entry) => !entry.dir && /HealthAutoExport.*\.csv$/i.test(entry.name),
  );
  if (!match) {
    throw new Error("No HealthAutoExport-*.csv file found in this zip.");
  }
  const content = await match.async("text");
  return { name: match.name, content };
};

// Minimal CSV parser supporting quoted fields (with embedded commas/quotes).
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
};

// Extracts the unit from a header like "Active Energy (kJ)" -> "kJ".
const unitFromHeader = (header: string): string | undefined => {
  const match = header.match(/\(([^)]+)\)\s*$/);
  return match?.[1];
};

const headerLabel = (header: string): string =>
  header.replace(/\([^)]*\)\s*$/, "").trim().toLowerCase();

// Converts the parsed CSV rows (header row first) into the JSON payload
// shape expected by /api/health-ingest.
export const buildHealthIngestPayload = (rows: string[][]): HealthIngestPayload => {
  if (rows.length < 2) {
    throw new Error("CSV file has no data rows.");
  }

  const header = rows[0];
  const dateIndex = header.findIndex((h) => h.trim().toLowerCase() === "date");
  if (dateIndex === -1) {
    throw new Error("CSV file is missing a Date column.");
  }

  const columns = header
    .map((h, index) => {
      if (index === dateIndex) return null;
      const label = headerLabel(h);
      const mapping = COLUMN_METRICS.find((c) => label.startsWith(c.prefix));
      if (!mapping) return null;
      return { index, name: mapping.name, units: unitFromHeader(h) };
    })
    .filter((c) => c !== null);

  const metrics = new Map<string, { units?: string; data: { date: string; qty: number }[] }>();

  for (const dataRow of rows.slice(1)) {
    const date = dataRow[dateIndex]?.trim();
    if (!date) continue;

    for (const col of columns) {
      const raw = dataRow[col.index];
      if (raw === undefined || raw.trim() === "") continue;
      const qty = Number(raw);
      if (!Number.isFinite(qty)) continue;

      const existing = metrics.get(col.name) ?? { units: col.units, data: [] };
      existing.data.push({ date, qty });
      metrics.set(col.name, existing);
    }
  }

  return {
    data: {
      metrics: Array.from(metrics.entries()).map(([name, { units, data }]) => ({
        name,
        units,
        data,
      })),
    },
  };
};

// End-to-end: reads the export.zip, locates the CSV, and returns the
// ready-to-POST payload plus a count of distinct days found.
export const parseAppleHealthExport = async (
  file: File,
): Promise<{ payload: HealthIngestPayload; csvFileName: string; days: number }> => {
  const { name, content } = await findHealthExportCsv(file);
  const rows = parseCsv(content);
  const payload = buildHealthIngestPayload(rows);

  const days = new Set<string>();
  for (const metric of payload.data.metrics) {
    for (const entry of metric.data) days.add(entry.date.slice(0, 10));
  }

  return { payload, csvFileName: name, days: days.size };
};
