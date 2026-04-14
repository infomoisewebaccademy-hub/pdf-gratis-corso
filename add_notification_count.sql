ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_count integer DEFAULT 0;
