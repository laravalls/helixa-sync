-- Run this once in the Neon SQL editor after creating your project.

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
