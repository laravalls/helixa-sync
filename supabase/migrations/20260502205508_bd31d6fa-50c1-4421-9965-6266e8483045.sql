
ALTER TABLE public.beta_signups ADD COLUMN IF NOT EXISTS interview_booked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.beta_signups ADD CONSTRAINT beta_signups_email_unique UNIQUE (email);
