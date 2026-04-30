CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  interest TEXT NOT NULL,
  current_tools TEXT,
  want_most TEXT,
  source TEXT DEFAULT 'app_modal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for beta"
  ON public.beta_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Block public reads of beta signups"
  ON public.beta_signups
  FOR SELECT
  USING (false);