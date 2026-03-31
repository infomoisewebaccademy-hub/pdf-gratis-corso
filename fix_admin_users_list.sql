-- Esegui questo script nell'SQL Editor di Supabase per permettere agli amministratori
-- di vedere tutti gli utenti, gli acquisti e i progressi.

-- 1. Aggiungi policy per permettere agli admin di leggere tutti i profili
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());

-- 2. Aggiungi policy per permettere agli admin di leggere tutti gli acquisti
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (is_admin());

-- 3. Aggiungi policy per permettere agli admin di leggere tutti i progressi delle lezioni
DROP POLICY IF EXISTS "Admins can view all lesson progress" ON public.lesson_progress;
CREATE POLICY "Admins can view all lesson progress" ON public.lesson_progress FOR SELECT USING (is_admin());

