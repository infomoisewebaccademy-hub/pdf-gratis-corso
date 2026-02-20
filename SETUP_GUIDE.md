# Guida Integrazione Stripe & Supabase (VS Code)

Segui questa guida sequenziale per attivare i pagamenti e le funzionalità avanzate.

## 1. Prerequisiti
Apri il terminale di VS Code ed esegui:
```bash
npm install
```

## 2. Collegamento a Supabase
1.  **Login**:
    ```bash
    npx supabase login
    ```
2.  **Link al progetto cloud**:
    Trova il tuo Project ID su Supabase (es. `abcdefghijklm`) ed esegui:
    ```bash
    npx supabase link --project-ref IL_TUO_PROJECT_ID
    ```

## 3. Configurazione Segreti (Sicurezza)
Imposta le chiavi API di Stripe nel backend sicuro di Supabase.

1.  **Stripe Secret Key** (da [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)):
    ```bash
    npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
    ```

2.  **Stripe Webhook Secret** (Vedi punto 5):
    *Questo lo imposterai DOPO il deploy del webhook.*

## 4. Deploy del Backend (Edge Functions)
I file delle funzioni sono già nella cartella `supabase/functions`. Pubblicali con:

```bash
# Funzioni di Pagamento
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt

# Funzione per creazione utente gratuita
npx supabase functions deploy create-free-user --no-verify-jwt
```

## 5. Attivazione Webhook Stripe
1.  Copia l'URL del webhook ottenuto dal deploy.
2.  Vai su [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks).
3.  Crea un nuovo endpoint selezionando l'evento: `checkout.session.completed`.
4.  Salva e copia il "Signing Secret" (`whsec_...`).
5.  Impostalo su Supabase:
    ```bash
    npx supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
    ```

## 6. Configurazione Storage
Per poter caricare file, devi creare dei "contenitori" (bucket) su Supabase.

### Bucket per Guida PDF
1.  Vai sulla tua **Dashboard Supabase** > **Storage**.
2.  Clicca su **"Create a new bucket"**.
3.  Nome del bucket: `pdf-guides`
4.  Spunta la casella **"This bucket is public"**.
5.  Clicca su **"Create bucket"**.

### Bucket per Materiale Corsi
1.  Sempre nello **Storage**.
2.  Clicca su **"Create a new bucket"**.
3.  Nome del bucket: `course-resources`
4.  Spunta la casella **"This bucket is public"**.
5.  Clicca su **"Create bucket"**.


## 7. Configurazione Database (SQL)
Vai su Supabase Dashboard > SQL Editor ed esegui questi script in ordine.

### Script 1: Struttura Tabelle
Esegui questo script per creare o aggiornare le tabelle del database.
```sql
-- Tabella platform_settings
alter table public.platform_settings
  add column if not exists active_mode text default 'public' not null,
  add column if not exists pdf_guide_config jsonb;

-- Tabella waiting_list
alter table public.waiting_list
  add column if not exists source text default 'pre_launch';

-- Tabella courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS resource_file_url TEXT,
  ADD COLUMN IF NOT EXISTS resource_file_name TEXT;

-- Tabella purchases
create table if not exists purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  stripe_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella lesson_progress
create table if not exists lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  lesson_id text not null,
  completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Tabella community_messages
create table if not exists community_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  user_name text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Abilita Realtime sulla chat
alter publication supabase_realtime add table community_messages;
```

### Script 2: Imposta il tuo Utente come Admin
**AZIONE MANUALE RICHIESTA:**
1.  Crea il tuo account admin sulla piattaforma (se non l'hai già fatto).
2.  Vai in **Authentication** sulla Dashboard Supabase, trova il tuo utente e copia il suo **User ID**.
3.  Incolla l'ID nello script qui sotto e ESEGUILO.

```sql
-- Incolla il tuo User ID qui sotto.
-- Questo comando usa 'raw_app_meta_data', il nome corretto della colonna nel database.
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE id = 'INCOLLA_QUI_IL_TUO_USER_ID';
```

### Script 3: Regole di Sicurezza (Row-Level Security)
Questo script è FONDAMENTALE. Eseguilo dopo aver impostato il tuo utente come admin. Sostituisce tutte le versioni precedenti.
```sql
-- ==== FUNZIONE DI CONTROLLO RUOLO ADMIN ====
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT coalesce((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin'), 'false')::boolean
$$;

-- === PROFILES, COURSES, ETC. (SCHEMA PUBLIC) ===
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gli utenti possono vedere/aggiornare il proprio profilo" ON public.profiles;
CREATE POLICY "Gli utenti possono vedere/aggiornare il proprio profilo" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Public can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING ( auth.uid() = user_id );

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gli utenti possono gestire il proprio progresso" ON public.lesson_progress;
CREATE POLICY "Gli utenti possono gestire il proprio progresso" ON public.lesson_progress FOR ALL USING ( auth.uid() = user_id );

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tutti gli autenticati possono leggere i messaggi" ON public.community_messages;
DROP POLICY IF EXISTS "Gli utenti possono inviare messaggi" ON public.community_messages;
CREATE POLICY "Tutti gli autenticati possono leggere i messaggi" ON public.community_messages FOR SELECT USING ( auth.role() = 'authenticated' );
CREATE POLICY "Gli utenti possono inviare messaggi" ON public.community_messages FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- === STORAGE BUCKETS (CON CAMBIO DI PROPRIETÀ TEMPORANEO) ===
-- 1. Rendi 'postgres' proprietario temporaneo per poter modificare la tabella
ALTER TABLE storage.objects OWNER TO postgres;

-- 2. Abilita Row Level Security (ora funzionerà)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Crea le policy di sicurezza per lo storage
-- Policy per 'course-resources'
DROP POLICY IF EXISTS "Public read access for course resources" ON storage.objects;
CREATE POLICY "Public read access for course resources" ON storage.objects FOR SELECT USING ( bucket_id = 'course-resources' );
DROP POLICY IF EXISTS "Admin management for course resources" ON storage.objects;
CREATE POLICY "Admin management for course resources" ON storage.objects FOR ALL USING ( bucket_id = 'course-resources' AND is_admin() ) WITH CHECK ( bucket_id = 'course-resources' AND is_admin() );

-- Policy per 'pdf-guides'
DROP POLICY IF EXISTS "Public read access for pdf guides" ON storage.objects;
CREATE POLICY "Public read access for pdf guides" ON storage.objects FOR SELECT USING ( bucket_id = 'pdf-guides' );
DROP POLICY IF EXISTS "Admin management for pdf guides" ON storage.objects;
CREATE POLICY "Admin management for pdf guides" ON storage.objects FOR ALL USING ( bucket_id = 'pdf-guides' AND is_admin() ) WITH CHECK ( bucket_id = 'pdf-guides' AND is_admin() );

-- 4. Ripristina il proprietario originale per sicurezza
ALTER TABLE storage.objects OWNER TO supabase_storage_admin;
```

### Script 4: Trigger per Creazione Utente Automatica (Opzionale)
Serve solo se usi la modalità "Guida PDF". Assicurati di aver pubblicato la funzione `create-free-user` (passo 4).
```sql
create or replace function on_new_lead_for_pdf()
returns trigger language plpgsql security definer as $$
begin
  if new.source = 'pdf_guide' then
    perform net.http_post(
        -- 👇 SOSTITUISCI CON L'URL della tua Edge Function 'create-free-user'
        url:='https://zplcjlyqmcayprettmqd.supabase.co/functions/v1/create-free-user',
        -- 👇 SOSTITUISCI CON LA TUA 'service_role' key (da Supabase > Settings > API)
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TUO_SUPABASE_SERVICE_ROLE_KEY"}'::jsonb,
        body:=jsonb_build_object('record', row_to_json(new))
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_on_new_lead_for_pdf on public.waiting_list;
create trigger trigger_on_new_lead_for_pdf
after insert on public.waiting_list
for each row execute function on_new_lead_for_pdf();
```
**IMPORTANTE**: Nello script del trigger qui sopra, sostituisci `TUO_SUPABASE_SERVICE_ROLE_KEY` e l'URL con i tuoi dati reali prima di eseguirlo.