DO $$
DECLARE
  tbl text;
  pol text;
BEGIN
  FOR tbl, pol IN
    SELECT DISTINCT p.tablename, p.policyname
    FROM pg_policies p
    WHERE p.tablename LIKE 'dw_%'
      AND p.cmd = 'SELECT'
      AND p.roles::text NOT LIKE '%anon%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated, anon USING (true)', pol, tbl);
  END LOOP;
END;
$$;