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

# NUOVA: Funzione per creazione utente gratuita
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

## 6. Configurazione Database (SQL)
Vai su Supabase Dashboard > SQL Editor ed esegui questi script:

### Tabella `platform_settings` (MODIFICATA)
```sql
-- Aggiunge la colonna per la modalità attiva e la configurazione PDF
alter table public.platform_settings
  add column if not exists active_mode text default 'public' not null,
  add column if not exists pdf_guide_config jsonb;

-- Rimuove la vecchia colonna booleana (opzionale, ma consigliato per pulizia)
-- alter table public.platform_settings drop column if exists is_pre_launch;
```

### Tabella `waiting_list` (MODIFICATA)
```sql
-- Aggiunge una colonna per tracciare da dove arriva l'iscritto
alter table public.waiting_list
  add column if not exists source text default 'pre_launch';
```

### Tabella Acquisti
```sql
create table purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  stripe_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table purchases enable row level security;
create policy "Users can view own purchases" on purchases for select using ( auth.uid() = user_id );
create policy "Service role inserts" on purchases for insert with check ( true );
```

### Tabella Progresso Lezioni
```sql
create table lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  lesson_id text not null,
  completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

alter table lesson_progress enable row level security;
create policy "Gli utenti possono gestire il proprio progresso" 
on lesson_progress for all 
using ( auth.uid() = user_id );
```

### Tabella Community Chat
```sql
create table community_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  user_name text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table community_messages enable row level security;
create policy "Tutti gli autenticati possono leggere i messaggi" on community_messages for select using ( auth.role() = 'authenticated' );
create policy "Gli utenti possono inviare messaggi" on community_messages for insert with check ( auth.uid() = user_id );

alter publication supabase_realtime add table community_messages;
```

### NUOVO: Trigger per Creazione Utente Automatica
```sql
-- 1. Definisci la funzione trigger
create or replace function on_new_lead_for_pdf()
returns trigger
language plpgsql
security definer -- Esegui con i privilegi dell'utente che ha creato la funzione
as $$
begin
  -- Chiama la Edge Function solo se l'iscrizione proviene dalla guida PDF
  if new.source = 'pdf_guide' then
    perform net.http_post(
        url:='https://zplcjlyqmcayprettmqd.supabase.co/functions/v1/create-free-user', -- INCOLLA QUI L'URL DELLE TUE FUNZIONI
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TUO_SUPABASE_SERVICE_ROLE_KEY"}'::jsonb, -- INCOLLA QUI LA TUA SERVICE_ROLE_KEY
        body:=jsonb_build_object('record', row_to_json(new))
    );
  end if;
  return new;
end;
$$;

-- 2. Applica il trigger alla tabella waiting_list
drop trigger if exists trigger_on_new_lead_for_pdf on public.waiting_list;
create trigger trigger_on_new_lead_for_pdf
after insert on public.waiting_list
for each row
execute function on_new_lead_for_pdf();
```
**IMPORTANTE**: Nello script del trigger, sostituisci `TUO_SUPABASE_SERVICE_ROLE_KEY` e l'URL con i tuoi dati reali.