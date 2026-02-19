
# Script SQL per Impostazioni Piattaforma

-- Esegui questo codice una sola volta nell'SQL Editor del tuo progetto Supabase
-- per creare e configurare correttamente la tabella delle impostazioni globali.

-- -----------------------------------------------------------------------------
-- SCRIPT DI CORREZIONE (esegui solo se hai già creato la tabella in passato)
-- Questo comando aggiunge le colonne mancanti se non esistono. È sicuro da eseguire.
-- -----------------------------------------------------------------------------
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS logo_offset_x integer DEFAULT 0;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS logo_offset_y integer DEFAULT 0;


-- -----------------------------------------------------------------------------
-- SCRIPT DI CREAZIONE COMPLETO (per nuove installazioni)
-- -----------------------------------------------------------------------------

-- 1. CREAZIONE DELLA TABELLA 'platform_settings'
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id smallint PRIMARY KEY,
    logo_url text,
    logo_height smallint DEFAULT 64,
    logo_offset_x integer DEFAULT 0,
    logo_offset_y integer DEFAULT 0,
    meta_pixel_id character varying,
    font_family text DEFAULT 'Inter',
    is_pre_launch boolean DEFAULT false,
    pre_launch_date timestamp with time zone,
    pre_launch_config jsonb,
    landing_page_config jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. INSERIMENTO DELLA RIGA DI CONFIGURAZIONE INIZIALE
-- Questo assicura che ci sia sempre una riga con id=1 da aggiornare.
INSERT INTO public.platform_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3. GESTIONE DELLA SICUREZZA (Row Level Security)
-- Per questa tabella specifica, disabilitiamo RLS per semplicità.
-- Questo previene problemi di salvataggio "silenziosi" in cui le modifiche non vengono
-- applicate perché manca una policy di UPDATE specifica.
ALTER TABLE public.platform_settings DISABLE ROW LEVEL SECURITY;

-- 4. CONCESSIONE PERMESSI A LIVELLO DI TABELLA
-- Anche con RLS disabilitato, dobbiamo concedere i permessi base.
ALTER TABLE public.platform_settings OWNER TO postgres;
GRANT ALL ON TABLE public.platform_settings TO anon;
GRANT ALL ON TABLE public.platform_settings TO authenticated;
GRANT ALL ON TABLE public.platform_settings TO service_role;

-- Messaggio di conferma che puoi ignorare:
-- "Success. No rows returned" è il risultato atteso.
