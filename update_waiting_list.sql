-- Aggiungi colonna course_id alla tabella waiting_list
ALTER TABLE public.waiting_list 
ADD COLUMN IF NOT EXISTS course_id TEXT;

-- Aggiungi colonna has_waiting_list alla tabella courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS has_waiting_list BOOLEAN DEFAULT TRUE;

-- Aggiorna i commenti
COMMENT ON COLUMN public.waiting_list.course_id IS 'ID del corso per cui l''utente è in lista d''attesa';
COMMENT ON COLUMN public.courses.has_waiting_list IS 'Se abilitato, mostra il modulo di lista d''attesa quando il corso è pieno (status = full)';
