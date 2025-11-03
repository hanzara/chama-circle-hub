-- Ensure upsert in update_chama_metrics works by making chama_id unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.chama_metrics'::regclass 
      AND conname = 'chama_metrics_chama_id_key'
  ) THEN
    ALTER TABLE public.chama_metrics
    ADD CONSTRAINT chama_metrics_chama_id_key UNIQUE (chama_id);
  END IF;
END $$;