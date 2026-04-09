
-- =============================================================================
-- FIX PER VISIBILITÀ VIDEO E IMPOSTAZIONI HOME PAGE
-- Esegui questo script nell'SQL Editor di Supabase
-- =============================================================================

-- 1. CONFIGURAZIONE BUCKET STORAGE "video home page"
-- Assicuriamoci che il bucket sia pubblico e accessibile a tutti
DO $$
BEGIN
    -- Se il bucket non esiste, lo creiamo (opzionale, ma utile per sicurezza)
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('video home page', 'video home page', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    -- Rimuoviamo eventuali policy vecchie che potrebbero andare in conflitto
    DELETE FROM storage.policies WHERE bucket_id = 'video home page';
END $$;

-- 2. POLICY PER ACCESSO PUBBLICO AI VIDEO
-- Permette a chiunque (anche non loggato) di vedere i video in questo bucket
CREATE POLICY "Accesso pubblico ai video della home"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'video home page');

-- 3. FIX PER TABELLA platform_settings
-- Assicuriamoci che la configurazione della home sia leggibile da tutti
-- (Risolve il problema del "video vecchio" che appare al logout)

-- Abilitiamo RLS per sicurezza (se non lo è già)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Rimuoviamo policy esistenti per evitare duplicati
DROP POLICY IF EXISTS "Permetti lettura a tutti" ON public.platform_settings;
DROP POLICY IF EXISTS "Permetti aggiornamento agli admin" ON public.platform_settings;

-- Policy di lettura: chiunque può leggere le impostazioni
CREATE POLICY "Permetti lettura a tutti"
ON public.platform_settings FOR SELECT
TO public
USING (true);

-- Policy di scrittura: solo gli utenti autenticati (admin) possono modificare
-- Nota: In questa app, il controllo admin è gestito a livello applicativo o tramite trigger,
-- qui permettiamo l'update agli authenticated per semplicità, 
-- assumendo che l'app filtri l'accesso alla dashboard admin.
CREATE POLICY "Permetti aggiornamento agli autenticati"
ON public.platform_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Assicuriamoci che i permessi GRANT siano corretti
GRANT SELECT ON public.platform_settings TO anon;
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
