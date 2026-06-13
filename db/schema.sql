-- Run this once in the Neon SQL editor after creating your project.

CREATE TABLE IF NOT EXISTS user_profiles (
  clerk_user_id           TEXT        PRIMARY KEY,
  email                   TEXT,
  name                    TEXT,
  date_of_birth           DATE,
  timezone                TEXT        NOT NULL DEFAULT 'UTC',
  last_period_date        DATE        NOT NULL,
  cycle_length            INT         NOT NULL DEFAULT 28,
  period_duration_days    INT         NOT NULL DEFAULT 5,
  active_mode             TEXT        NOT NULL DEFAULT 'cycle_sync',
  has_irregular_cycles    BOOLEAN     NOT NULL DEFAULT false,
  onboarding_completed    BOOLEAN     NOT NULL DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  preferences             JSONB       NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beta_signups (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT,
  interest      TEXT        NOT NULL,
  current_tools TEXT,
  want_most     TEXT,
  source        TEXT        NOT NULL DEFAULT 'app_modal',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user secret token used to authenticate the Apple Health auto-export
-- webhook (e.g. the "Health Auto Export" iOS app). The token is opaque and
-- has no relation to the Clerk session — it's used by an unauthenticated
-- POST from the user's phone.
CREATE TABLE IF NOT EXISTS health_sync_tokens (
  clerk_user_id TEXT        PRIMARY KEY REFERENCES user_profiles(clerk_user_id),
  token         TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily health metrics pulled from Apple Health (HRV, resting heart rate,
-- sleep, steps, active energy, etc). One row per user/date/metric/source so
-- multiple data sources can coexist without clobbering each other.
CREATE TABLE IF NOT EXISTS health_metrics (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT        NOT NULL REFERENCES user_profiles(clerk_user_id),
  date          DATE        NOT NULL,
  metric        TEXT        NOT NULL,
  value         NUMERIC     NOT NULL,
  unit          TEXT,
  source        TEXT        NOT NULL DEFAULT 'apple_health',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clerk_user_id, date, metric, source)
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date
  ON health_metrics(clerk_user_id, date DESC);

-- Daily readiness/optimization score derived from health_metrics (and, in
-- future, cycle phase). Recomputed whenever new health data arrives for a day.
CREATE TABLE IF NOT EXISTS daily_scores (
  clerk_user_id TEXT        NOT NULL REFERENCES user_profiles(clerk_user_id),
  date          DATE        NOT NULL,
  score         INT         NOT NULL,
  guidance      TEXT,
  inputs        JSONB       NOT NULL DEFAULT '{}',
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (clerk_user_id, date)
);
