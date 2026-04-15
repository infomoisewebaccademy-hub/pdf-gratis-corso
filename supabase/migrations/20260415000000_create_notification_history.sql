-- Creazione tabella per la cronologia delle notifiche
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilita RLS (opzionale, ma consigliato)
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli admin di leggere/scrivere (adatta alle tue esigenze)
-- Assumendo che esista una funzione isAdmin() o simile, altrimenti gestisci via dashboard
