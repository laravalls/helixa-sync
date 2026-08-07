# HelixA Phase 0 — Mock Data Audit

> Branch: `phase-0-audit` | Audited: 2026-06-18

---

## Scope

All frontend files in `src/` were scanned for:
- Hardcoded numbers / strings used as user data
- Mock/demo data objects imported and rendered as real
- Integration cards shown as "Connected" without a real OAuth or sync flow
- Any component reading `cycle_day_plans` / `mockCycle.ts` data as if it were live

**Out of scope (intentional per spec):** `cycle_day_plans` fallback logic for Phase 3.

---

## Audit Table

| # | File | Line(s) | Hardcoded Value | Represents | Bucket |
|---|------|---------|-----------------|------------|--------|
| 1 | `src/pages/Today.tsx` | 36–37 | `CYCLE_DAY = 18`, `CYCLE_LENGTH = 28` | User's current cycle day and cycle length | A |
| 2 | `src/pages/Today.tsx` | 16–21 | `import WEARABLE_DATA from mockCycle` used for `hrv=38`, `recovery_score=72`, `sleep_hours=7.2`, `resting_hr=58`, `device="Oura"` | Live wearable reading for today | A |
| 3 | `src/pages/Today.tsx` | 476–479 | `HRV {WEARABLE_DATA.hrv}` · `RECOVERY {WEARABLE_DATA.recovery_score}` in wearable badge | Today's HRV and readiness score | A |
| 4 | `src/pages/Today.tsx` | 90–94 | `PLAN_BY_MODE` using `PERFORMANCE_DAY`, `CYCLE_SYNC_DAY_18`, `TTC_DAY_18` | Today's AI-generated day plan (movement, plate, stack, recovery, alert) | B |
| 5 | `src/pages/Today.tsx` | 595 | `<CycleRing today={CYCLE_DAY} />` with hardcoded `18` | User's live cycle day position in the ring | A |
| 6 | `src/pages/Profile.tsx` | 12 | `"Last period · Day 18"` in Cycle data row hint | User's last period date and current cycle day | A |
| 7 | `src/pages/Profile.tsx` | 13 | `"3 connected"` in Connections row hint | Number of live connected integrations | B |
| 8 | `src/pages/Profile.tsx` | 15 | `"Free plan"` in Subscription hint | User's current subscription tier | B |
| 9 | `src/pages/Profile.tsx` | 34–35 | `"Hello there"` and `"Performance · Recovery 72%"` | User's name and today's readiness label | A |
| 10 | `src/components/NotificationsPanel.tsx` | 24–42 | `ALERTS` array: 3 hardcoded alert objects (Phase Transition, Wearable Insight, Cycle Window) with fixed body text and times | Real AI-generated health alerts for the user | B |
| 11 | `src/components/NotificationsPanel.tsx` | 94 | `"Pop-ups for periods, ovulation, phase shifts and more."` | Manage-reminders CTA description — cycle-only framing | B |
| 12 | `src/components/NotificationsPanel.tsx` | 135 | `"Daily phase alerts and wearable triggers"` — locked premium row label | Lock row copy — cycle-only framing | B |
| 13 | `src/components/RemindersSheet.tsx` | 27–85 | `REMINDERS` array — `Period Window` and `Ovulation Day` shown as primary (default-on) reminders | Reminder templates — cycle-specific items as defaults for all users | B |
| 14 | `src/components/HormoneChart.tsx` | 33–38 | `HORMONE_CURVES` (28-day estrogen, progesterone, LH, FSH arrays) | User's actual cycle hormone curve over 28 days | B |
| 15 | `src/components/RecoveryChart.tsx` | 31–36 | `RECOVERY_TREND` (14-day HRV, resting HR, sleep arrays — all static) | User's last 14 days of wearable readings from Neon `health_metrics` | A |
| 16 | `src/data/mockCycle.ts` | 67–137 | `CYCLE_SYNC_DAY_18` — full `DayPlan` object (movement, plate, stack, practice, recovery for Day 18 luteal) | Today's AI-generated plan for Cycle Sync mode | B |
| 17 | `src/data/mockCycle.ts` | 139–215 | `TTC_DAY_18` — full `DayPlan` for TTC mode Day 18 | Today's AI-generated plan for TTC mode | B |
| 18 | `src/data/mockCycle.ts` | 217–250 | `WEARABLE_DATA` object (device, hrv, delta_pct, recovery_score, sleep, resting_hr) | Live wearable reading for today | A |
| 19 | `src/data/mockCycle.ts` | 269–285 | `HORMONE_CURVES` — 28 hardcoded arrays for estrogen/progesterone/LH/FSH | User's cycle hormone reference curve | B |
| 20 | `src/data/mockCycle.ts` | 300–305 | `RECOVERY_TREND` — 14-day HRV/resting_hr/sleep_hours arrays | Last 14 days of health metrics from Neon `health_metrics` | A |
| 21 | `src/data/mockCycle.ts` | 308–380 | `PERFORMANCE_DAY` — full `DayPlan` for performance mode | Today's AI-generated plan for Performance mode | B |
| 22 | `src/pages/Connections.tsx` | 63–70 | `oura` card: `status: "connected"`, `lastSynced: "2 min ago"` | Oura Ring OAuth connection — not wired to any real OAuth or sync API | B |
| 23 | `src/pages/Connections.tsx` | 363–369 | `handleConnect` sets status `"connected"` in local state only (no API call) | Toggling any integration to "connected" state without a real OAuth handshake | B |
| 24 | `src/pages/MovementDetail.tsx` | 11–20 | `CYCLE_SYNC_DAY_18` / `TTC_DAY_18` used as plan | Today's AI-generated movement plan | B |
| 25 | `src/pages/PlateDetail.tsx` | 4–10 | `CYCLE_SYNC_DAY_18` / `TTC_DAY_18` used as plan | Today's AI-generated plate plan | B |
| 26 | `src/pages/StackDetail.tsx` | 4–10 | `CYCLE_SYNC_DAY_18` / `TTC_DAY_18` used as plan | Today's AI-generated supplement stack | B |
| 27 | `src/pages/RecoveryDetail.tsx` | 4–10 | `CYCLE_SYNC_DAY_18` / `TTC_DAY_18` used as plan | Today's AI-generated recovery plan | B |

---

## Bucket Summary

### Bucket A — Has a real source now
Real data already flows through the Neon DB via `health-ingest` / `wearable_readings` / `user_cycles`. These items just need a query instead of the hardcoded constant.

| # | Item | Real source |
|---|------|-------------|
| 1 | `CYCLE_DAY`, `CYCLE_LENGTH` | `user_cycles` table → `last_period_date` + `cycle_length` — already queried in `getUserCycle()` in `db.ts` but the result is only used for onboarding redirect, not for `CYCLE_DAY` |
| 2, 3, 18 | `WEARABLE_DATA` (hrv, recovery_score, sleep_hours, resting_hr) | `wearable_readings` table — `getLatestWearable()` already exists in `db.ts` but is never called in `Today.tsx`; `toWearableData()` helper exists but unused in UI |
| 5 | `CycleRing today={CYCLE_DAY}` | Same `user_cycles` derivation as row 1 |
| 6 | Profile → "Last period · Day 18" | `user_cycles.last_period_date` + derived cycle day |
| 9 | Profile → user name, "Recovery 72%" | Clerk `useUser().user.firstName` for name; latest `wearable_readings.recovery_score` for readiness |
| 15, 20 | `RECOVERY_TREND` (14-day arrays) | `health_metrics` table — populated by `health-ingest` API for rows with `metric IN ('hrv','resting_hr','sleep_hours')`, last 14 days per user |

### Bucket B — No real source yet
No live data pipeline exists. Keep the UI, show explicit locked/empty states.

| # | Item | Why no real source |
|---|------|-------------------|
| 4, 16, 17, 21, 24–27 | `DayPlan` objects (PERFORMANCE_DAY, CYCLE_SYNC_DAY_18, TTC_DAY_18) — used by Today, MovementDetail, PlateDetail, StackDetail, RecoveryDetail | Protocol generation requires Claude API integration (Phase 3). Out of scope here per spec. |
| 7 | Profile → "3 connected" | No live connection count query — connections are local-state only |
| 8 | Profile → "Free plan" | No subscription table or Clerk metadata for plan tier |
| 10 | NotificationsPanel ALERTS array | No alert-generation pipeline — requires wearable data + AI analysis |
| 11–12 | Notification CTA / lock copy — cycle-only framing | Copy issue, not data, but tied to same general framing sweep |
| 13 | RemindersSheet — Period Window + Ovulation defaulting on | Cycle reminders default-on for all users regardless of whether they opted into cycle tracking |
| 14, 19 | `HORMONE_CURVES` | No real hormone data ingestion pipeline |
| 22 | Oura Ring shown as `status: "connected"` | No Oura OAuth or Oura API integration built |
| 23 | `handleConnect` → fake local-state "connected" for all integrations | No OAuth handshake for any integration except Apple Health zip upload |

---

## Notes

- Items 4, 16, 17, 21, 24–27 (`DayPlan` objects) are explicitly out of scope per spec ("do not touch `cycle_day_plans` or its fallback logic, that's intentional for Phase 3"). These will not be locked or changed.
- Item 22 (Oura "connected") is the most misleading: it shows a live-pulsing "Connected" badge with `lastSynced: "2 min ago"` — no real data behind it. Needs lock treatment.
- Items 11–12 are copy fixes, not data — handled as part of the ongoing copy sweep (already scoped separately).
- `health_metrics` table existence assumed from `health-ingest.ts` METRIC_MAP + prior API work — confirm before Step 3 DB query.

---

_Awaiting approval to proceed to Step 3 (fix Bucket A) and Step 4 (lock Bucket B)._
