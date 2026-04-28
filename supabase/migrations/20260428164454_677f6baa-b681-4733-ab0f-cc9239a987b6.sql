-- USER CYCLES
CREATE TABLE public.user_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  last_period_date date,
  cycle_length int NOT NULL DEFAULT 28,
  active_mode text NOT NULL DEFAULT 'cycle_sync',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user_cycles"
  ON public.user_cycles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_cycles"
  ON public.user_cycles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_cycles"
  ON public.user_cycles FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX idx_user_cycles_device_id ON public.user_cycles(device_id);

-- CACHED PLANS
CREATE TABLE public.cached_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  cycle_day int NOT NULL,
  mode text NOT NULL,
  plan_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cached_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached_plans"
  ON public.cached_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cached_plans"
  ON public.cached_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cached_plans"
  ON public.cached_plans FOR UPDATE USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX idx_cached_plans_device_day_mode
  ON public.cached_plans(device_id, cycle_day, mode);

-- WEARABLE READINGS
CREATE TABLE public.wearable_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  hrv int,
  recovery_score int,
  sleep_hours numeric,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wearable_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wearable_readings"
  ON public.wearable_readings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert wearable_readings"
  ON public.wearable_readings FOR INSERT WITH CHECK (true);

CREATE INDEX idx_wearable_readings_device_recorded
  ON public.wearable_readings(device_id, recorded_at DESC);

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_cycles_updated_at
  BEFORE UPDATE ON public.user_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();