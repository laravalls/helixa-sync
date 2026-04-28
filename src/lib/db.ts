import { supabase } from "@/integrations/supabase/client";
import type { DayPlan, WearableData } from "@/data/mockCycle";

const DEVICE_KEY = "helixa_device_id";

export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

const lsGet = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const lsSet = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
};

// ---------- USER CYCLE ----------

export interface UserCycle {
  device_id: string;
  last_period_date: string | null;
  cycle_length: number;
  active_mode: string;
}

const userCycleKey = (deviceId: string) => `helixa_user_cycle_${deviceId}`;

export const saveUserCycle = async (
  cycle: Omit<UserCycle, "device_id">,
): Promise<UserCycle> => {
  const device_id = getDeviceId();
  const row: UserCycle = { device_id, ...cycle };
  lsSet(userCycleKey(device_id), row);

  try {
    const { error } = await supabase
      .from("user_cycles")
      .upsert(row, { onConflict: "device_id" });
    if (error) console.warn("[db] saveUserCycle remote failed:", error.message);
  } catch (e) {
    console.warn("[db] saveUserCycle threw:", e);
  }
  return row;
};

export const getUserCycle = async (): Promise<UserCycle | null> => {
  const device_id = getDeviceId();
  try {
    const { data, error } = await supabase
      .from("user_cycles")
      .select("device_id, last_period_date, cycle_length, active_mode")
      .eq("device_id", device_id)
      .maybeSingle();
    if (!error && data) {
      lsSet(userCycleKey(device_id), data);
      return data as UserCycle;
    }
  } catch (e) {
    console.warn("[db] getUserCycle threw:", e);
  }
  return lsGet<UserCycle>(userCycleKey(device_id));
};

// ---------- PLAN CACHE ----------

const planKey = (deviceId: string, day: number, mode: string) =>
  `helixa_plan_${deviceId}_${day}_${mode}`;

export const savePlan = async (
  cycleDay: number,
  mode: string,
  plan: DayPlan,
): Promise<void> => {
  const device_id = getDeviceId();
  lsSet(planKey(device_id, cycleDay, mode), plan);

  try {
    const { error } = await supabase.from("cached_plans").upsert(
      [
        {
          device_id,
          cycle_day: cycleDay,
          mode,
          // jsonb column — cast through unknown to satisfy the generated Json type
          plan_json: plan as unknown as never,
        },
      ],
      { onConflict: "device_id,cycle_day,mode" },
    );
    if (error) console.warn("[db] savePlan remote failed:", error.message);
  } catch (e) {
    console.warn("[db] savePlan threw:", e);
  }
};

export const getPlan = async (
  cycleDay: number,
  mode: string,
): Promise<DayPlan | null> => {
  const device_id = getDeviceId();
  try {
    const { data, error } = await supabase
      .from("cached_plans")
      .select("plan_json")
      .eq("device_id", device_id)
      .eq("cycle_day", cycleDay)
      .eq("mode", mode)
      .maybeSingle();
    if (!error && data?.plan_json) {
      const plan = data.plan_json as unknown as DayPlan;
      lsSet(planKey(device_id, cycleDay, mode), plan);
      return plan;
    }
  } catch (e) {
    console.warn("[db] getPlan threw:", e);
  }
  return lsGet<DayPlan>(planKey(device_id, cycleDay, mode));
};

// ---------- WEARABLE READINGS ----------

export interface WearableReading {
  hrv: number | null;
  recovery_score: number | null;
  sleep_hours: number | null;
  recorded_at?: string;
}

const wearableKey = (deviceId: string) => `helixa_wearable_${deviceId}`;

export const saveWearableReading = async (
  reading: Omit<WearableReading, "recorded_at">,
): Promise<void> => {
  const device_id = getDeviceId();
  const row = { ...reading, recorded_at: new Date().toISOString() };
  lsSet(wearableKey(device_id), row);

  try {
    const { error } = await supabase.from("wearable_readings").insert({
      device_id,
      hrv: reading.hrv,
      recovery_score: reading.recovery_score,
      sleep_hours: reading.sleep_hours,
    });
    if (error)
      console.warn("[db] saveWearableReading remote failed:", error.message);
  } catch (e) {
    console.warn("[db] saveWearableReading threw:", e);
  }
};

export const getLatestWearable = async (): Promise<WearableReading | null> => {
  const device_id = getDeviceId();
  try {
    const { data, error } = await supabase
      .from("wearable_readings")
      .select("hrv, recovery_score, sleep_hours, recorded_at")
      .eq("device_id", device_id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      lsSet(wearableKey(device_id), data);
      return data as WearableReading;
    }
  } catch (e) {
    console.warn("[db] getLatestWearable threw:", e);
  }
  return lsGet<WearableReading>(wearableKey(device_id));
};

// Helper: cast a remote/local WearableReading into the WEARABLE_DATA shape used
// by mock components (keeps device label compatible with the empty-fallback UI).
export const toWearableData = (
  r: WearableReading | null,
  fallback: WearableData,
): WearableData => {
  if (!r) return fallback;
  return {
    ...fallback,
    hrv: r.hrv ?? fallback.hrv,
    recovery_score: r.recovery_score ?? fallback.recovery_score,
    sleep_hours: r.sleep_hours ?? fallback.sleep_hours,
  };
};