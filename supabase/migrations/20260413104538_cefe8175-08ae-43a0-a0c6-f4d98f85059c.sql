
-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Category enum
CREATE TYPE public.journey_category AS ENUM ('attention', 'explore', 'plan');

-- Insight type enum
CREATE TYPE public.journey_insight_type AS ENUM ('success', 'warning', 'danger', 'info');

-- Main journeys table
CREATE TABLE public.user_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question TEXT,
  subtitle TEXT,
  category journey_category NOT NULL DEFAULT 'explore',
  icon TEXT DEFAULT 'Route',
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journey steps
CREATE TABLE public.user_journey_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id UUID NOT NULL REFERENCES public.user_journeys(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  insight_text TEXT,
  insight_type journey_insight_type DEFAULT 'info'
);

-- Step indicators
CREATE TABLE public.user_journey_step_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.user_journey_steps(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL,
  custom_insight TEXT
);

-- Likes
CREATE TABLE public.user_journey_likes (
  journey_id UUID NOT NULL REFERENCES public.user_journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (journey_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_step_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_likes ENABLE ROW LEVEL SECURITY;

-- user_journeys policies
CREATE POLICY "Public journeys visible to all authenticated"
  ON public.user_journeys FOR SELECT TO authenticated
  USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create own journeys"
  ON public.user_journeys FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own journeys"
  ON public.user_journeys FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own journeys"
  ON public.user_journeys FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- user_journey_steps policies
CREATE POLICY "Steps visible if journey visible"
  ON public.user_journey_steps FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journeys j
    WHERE j.id = journey_id AND (j.is_public = true OR j.author_id = auth.uid())
  ));

CREATE POLICY "Authors can manage steps"
  ON public.user_journey_steps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_journeys j
    WHERE j.id = journey_id AND j.author_id = auth.uid()
  ));

CREATE POLICY "Authors can update steps"
  ON public.user_journey_steps FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journeys j
    WHERE j.id = journey_id AND j.author_id = auth.uid()
  ));

CREATE POLICY "Authors can delete steps"
  ON public.user_journey_steps FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journeys j
    WHERE j.id = journey_id AND j.author_id = auth.uid()
  ));

-- step_indicators policies
CREATE POLICY "Indicators visible if step visible"
  ON public.user_journey_step_indicators FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journey_steps s
    JOIN public.user_journeys j ON j.id = s.journey_id
    WHERE s.id = step_id AND (j.is_public = true OR j.author_id = auth.uid())
  ));

CREATE POLICY "Authors can manage indicators"
  ON public.user_journey_step_indicators FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_journey_steps s
    JOIN public.user_journeys j ON j.id = s.journey_id
    WHERE s.id = step_id AND j.author_id = auth.uid()
  ));

CREATE POLICY "Authors can update indicators"
  ON public.user_journey_step_indicators FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journey_steps s
    JOIN public.user_journeys j ON j.id = s.journey_id
    WHERE s.id = step_id AND j.author_id = auth.uid()
  ));

CREATE POLICY "Authors can delete indicators"
  ON public.user_journey_step_indicators FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_journey_steps s
    JOIN public.user_journeys j ON j.id = s.journey_id
    WHERE s.id = step_id AND j.author_id = auth.uid()
  ));

-- Likes policies
CREATE POLICY "Users can see likes"
  ON public.user_journey_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can like"
  ON public.user_journey_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike"
  ON public.user_journey_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_journey_usage(p_journey_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_journeys
  SET usage_count = usage_count + 1
  WHERE id = p_journey_id AND is_public = true;
$$;

-- Updated_at trigger
CREATE TRIGGER update_user_journeys_updated_at
  BEFORE UPDATE ON public.user_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
