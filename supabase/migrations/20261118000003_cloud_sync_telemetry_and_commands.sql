-- Migration: Cloud Sync Telemetry and Hardware Actuation Queue
-- Enables zero-PNA remote control from mobile devices and Vercel cloud deployments

ALTER TABLE public.stations 
  ADD COLUMN IF NOT EXISTS current_weight_g NUMERIC(6, 2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS current_water_raw INT DEFAULT 4095,
  ADD COLUMN IF NOT EXISTS is_water_low BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_cat_present BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pump_state TEXT DEFAULT 'OFF',
  ADD COLUMN IF NOT EXISTS wifi_rssi INT DEFAULT -60,
  ADD COLUMN IF NOT EXISTS current_schedule TEXT DEFAULT '08:00,18:00',
  ADD COLUMN IF NOT EXISTS pending_command TEXT,
  ADD COLUMN IF NOT EXISTS pending_command_payload JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_telemetry_at TIMESTAMPTZ;

-- Enable Supabase Realtime replication on stations table so frontend updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
