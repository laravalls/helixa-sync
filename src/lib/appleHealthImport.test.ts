import { describe, it, expect } from "vitest";
import { parseCsv, buildHealthIngestPayload } from "./appleHealthImport";

describe("parseCsv", () => {
  it("parses a simple CSV with headers", () => {
    const csv = "Date,Resting Heart Rate (bpm)\n2026-06-10,58\n2026-06-11,60\n";
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      ["Date", "Resting Heart Rate (bpm)"],
      ["2026-06-10", "58"],
      ["2026-06-11", "60"],
    ]);
  });

  it("handles quoted fields with embedded commas", () => {
    const csv = 'Date,Note\n2026-06-10,"a, b"\n';
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      ["Date", "Note"],
      ["2026-06-10", "a, b"],
    ]);
  });
});

describe("buildHealthIngestPayload", () => {
  it("maps known columns to the health-ingest metric names", () => {
    const csv = [
      "Date,Resting Heart Rate (bpm),Heart Rate Variability (ms),Sleep Analysis [Deep] (hr),Sleep Analysis [Total] (hr),Step Count (steps),VO2 Max (ml/kg/min),Active Energy (kJ),Apple Exercise Time (min),Unrelated Column",
      "2026-06-10,58,45.2,1.2,7.5,8000,42.1,1800,30,ignored",
    ].join("\n");

    const rows = parseCsv(csv);
    const payload = buildHealthIngestPayload(rows);

    const byName = Object.fromEntries(payload.data.metrics.map((m) => [m.name, m]));

    expect(byName.resting_heart_rate.data).toEqual([{ date: "2026-06-10", qty: 58 }]);
    expect(byName.heart_rate_variability.units).toBe("ms");
    expect(byName.sleep_analysis_deep.data[0].qty).toBe(1.2);
    expect(byName.sleep_analysis_total.data[0].qty).toBe(7.5);
    expect(byName.step_count.data[0].qty).toBe(8000);
    expect(byName.vo2_max.units).toBe("ml/kg/min");
    expect(byName.active_energy.units).toBe("kJ");
    expect(byName.apple_exercise_time.data[0].qty).toBe(30);
    expect(byName.unrelated_column).toBeUndefined();
  });

  it("throws when there is no Date column", () => {
    const rows = parseCsv("Foo,Bar\n1,2\n");
    expect(() => buildHealthIngestPayload(rows)).toThrow(/Date/);
  });
});
