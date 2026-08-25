
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public journeys visible to all authenticated" ON public.user_journeys;
DROP POLICY IF EXISTS "Users can create own journeys" ON public.user_journeys;
DROP POLICY IF EXISTS "Authors can update own journeys" ON public.user_journeys;
DROP POLICY IF EXISTS "Authors can delete own journeys" ON public.user_journeys;

DROP POLICY IF EXISTS "Steps visible if journey visible" ON public.user_journey_steps;
DROP POLICY IF EXISTS "Authors can manage steps" ON public.user_journey_steps;
DROP POLICY IF EXISTS "Authors can update steps" ON public.user_journey_steps;
DROP POLICY IF EXISTS "Authors can delete steps" ON public.user_journey_steps;

DROP POLICY IF EXISTS "Indicators visible if step visible" ON public.user_journey_step_indicators;
DROP POLICY IF EXISTS "Authors can manage indicators" ON public.user_journey_step_indicators;
DROP POLICY IF EXISTS "Authors can update indicators" ON public.user_journey_step_indicators;
DROP POLICY IF EXISTS "Authors can delete indicators" ON public.user_journey_step_indicators;

-- Create permissive policies for demo
CREATE POLICY "Allow all select on journeys" ON public.user_journeys FOR SELECT USING (true);
CREATE POLICY "Allow all insert on journeys" ON public.user_journeys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on journeys" ON public.user_journeys FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on journeys" ON public.user_journeys FOR DELETE USING (true);

CREATE POLICY "Allow all select on steps" ON public.user_journey_steps FOR SELECT USING (true);
CREATE POLICY "Allow all insert on steps" ON public.user_journey_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on steps" ON public.user_journey_steps FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on steps" ON public.user_journey_steps FOR DELETE USING (true);

CREATE POLICY "Allow all select on indicators" ON public.user_journey_step_indicators FOR SELECT USING (true);
CREATE POLICY "Allow all insert on indicators" ON public.user_journey_step_indicators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on indicators" ON public.user_journey_step_indicators FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on indicators" ON public.user_journey_step_indicators FOR DELETE USING (true);

-- Make author_id nullable so we can insert without auth
ALTER TABLE public.user_journeys ALTER COLUMN author_id DROP NOT NULL;
