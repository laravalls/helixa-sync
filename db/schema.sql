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
