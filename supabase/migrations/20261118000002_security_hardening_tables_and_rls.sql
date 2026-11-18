-- Migration: Security Hardening Tables and Row Level Security (RLS) Policies
-- Implements specifications from Docs/Security Architecture and Hardening.md and Docs/Supabase and Backend Architecture.md

-- 1. Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Stations (Hardware Device Registry)
CREATE TABLE IF NOT EXISTS public.stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL DEFAULT 'PawStation Unit 1' CHECK (char_length(trim(device_name)) >= 1 AND char_length(device_name) <= 80),
    device_identifier TEXT NOT NULL UNIQUE CHECK (char_length(trim(device_identifier)) >= 1 AND char_length(device_identifier) <= 100),
    local_ip TEXT CHECK (local_ip IS NULL OR char_length(local_ip) <= 45),
    low_water_threshold INT NOT NULL DEFAULT 1500 CHECK (low_water_threshold >= 0 AND low_water_threshold <= 4095),
    cat_weight_threshold_g NUMERIC(6, 2) NOT NULL DEFAULT 500.0 CHECK (cat_weight_threshold_g >= 0 AND cat_weight_threshold_g <= 20000.0),
    dispense_portion_duration_ms INT NOT NULL DEFAULT 1200 CHECK (dispense_portion_duration_ms >= 100 AND dispense_portion_duration_ms <= 10000),
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_seen_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stations_owner_id ON public.stations (owner_id);

-- 3. Telemetry Logs (Time-series logs from IoT sensors)
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    weight_g NUMERIC(6, 2) NOT NULL CHECK (weight_g >= -50.0 AND weight_g <= 25000.0),
    scale_ok BOOLEAN NOT NULL DEFAULT true,
    cat_present BOOLEAN NOT NULL DEFAULT false,
    water_raw INT NOT NULL CHECK (water_raw >= 0 AND water_raw <= 4095),
    water_low BOOLEAN NOT NULL DEFAULT false,
    wifi_rssi INT CHECK (wifi_rssi IS NULL OR (wifi_rssi >= -120 AND wifi_rssi <= 0)),
    pump_state TEXT CHECK (pump_state IS NULL OR pump_state IN ('OFF', 'RUNNING', 'STOPPING'))
);

CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON public.telemetry_logs (station_id, recorded_at DESC);

-- 4. Feeding Events (Audit trail of dispenses)
CREATE TABLE IF NOT EXISTS public.feeding_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'voice', 'auto')),
    triggered_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'in_progress')),
    portion_count INT NOT NULL DEFAULT 1 CHECK (portion_count >= 1 AND portion_count <= 10)
);

CREATE INDEX IF NOT EXISTS idx_feeding_events_station_time ON public.feeding_events (station_id, triggered_at DESC);

-- 5. Cat Visits (Weight & Frequency Detection)
CREATE TABLE IF NOT EXISTS public.cat_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    visit_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    visit_end TIMESTAMPTZ,
    peak_weight_g NUMERIC(6, 2) NOT NULL CHECK (peak_weight_g >= 0 AND peak_weight_g <= 25000.0),
    duration_seconds INT CHECK (duration_seconds IS NULL OR (duration_seconds >= 0 AND duration_seconds <= 3600))
);

CREATE INDEX IF NOT EXISTS idx_cat_visits_user_time ON public.cat_visits (user_id, visit_start DESC);
CREATE INDEX IF NOT EXISTS idx_cat_visits_station_time ON public.cat_visits (station_id, visit_start DESC);

-- 6. Station Alerts
CREATE TABLE IF NOT EXISTS public.station_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_water', 'scale_tare_required', 'connection_lost', 'feeder_jam')),
    severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_station_alerts_station ON public.station_alerts (station_id, created_at DESC);

-- 7. Command Audit Log (Append-only security log for physical actuator operations)
CREATE TABLE IF NOT EXISTS public.command_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    executed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    command_name TEXT NOT NULL CHECK (command_name IN ('dispense', 'pump', 'tare')),
    parameters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_command_audit_station ON public.command_audit_log (station_id, created_at DESC);

-- =========================================================================
-- 8. DEFENSE-IN-DEPTH ROW LEVEL SECURITY (RLS) ACTIVATION
-- =========================================================================
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_audit_log ENABLE ROW LEVEL SECURITY;

-- 9. Revoke all permissions from anon, grant least privilege to authenticated
REVOKE ALL ON public.stations FROM anon, public;
REVOKE ALL ON public.telemetry_logs FROM anon, public;
REVOKE ALL ON public.feeding_events FROM anon, public;
REVOKE ALL ON public.cat_visits FROM anon, public;
REVOKE ALL ON public.station_alerts FROM anon, public;
REVOKE ALL ON public.command_audit_log FROM anon, public;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stations TO authenticated;
GRANT SELECT, INSERT ON public.telemetry_logs TO authenticated;
GRANT SELECT, INSERT ON public.feeding_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cat_visits TO authenticated;
GRANT SELECT, UPDATE ON public.station_alerts TO authenticated;
GRANT SELECT, INSERT ON public.command_audit_log TO authenticated;

-- =========================================================================
-- 10. GRANULAR ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Stations: Users can only view/manage stations they own
CREATE POLICY "Users can view their own stations"
ON public.stations FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own stations"
ON public.stations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own stations"
ON public.stations FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own stations"
ON public.stations FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- Telemetry Logs: Station owners can view telemetry
CREATE POLICY "Station owners can view telemetry"
ON public.telemetry_logs FOR SELECT TO authenticated
USING (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Station owners can insert telemetry"
ON public.telemetry_logs FOR INSERT TO authenticated
WITH CHECK (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

-- Feeding Events: Station owners can view and log feeding events
CREATE POLICY "Station owners can view feeding events"
ON public.feeding_events FOR SELECT TO authenticated
USING (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Station owners can log feeding events"
ON public.feeding_events FOR INSERT TO authenticated
WITH CHECK (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

-- Cat Visits: Users can view and manage their own cat visits
CREATE POLICY "Users can view their cat visits"
ON public.cat_visits FOR SELECT TO authenticated
USING (
    auth.uid() = user_id OR
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert cat visits"
ON public.cat_visits FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id OR
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid()) OR
    (user_id IS NULL AND station_id IS NULL)
);

CREATE POLICY "Users can update their cat visits"
ON public.cat_visits FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their cat visits"
ON public.cat_visits FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Station Alerts: Station owners can view and acknowledge alerts
CREATE POLICY "Station owners can view alerts"
ON public.station_alerts FOR SELECT TO authenticated
USING (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Station owners can resolve alerts"
ON public.station_alerts FOR UPDATE TO authenticated
USING (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
)
WITH CHECK (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

-- Command Audit Log: Append-only by station owners, strictly read-only
CREATE POLICY "Station owners can view command audit log"
ON public.command_audit_log FOR SELECT TO authenticated
USING (
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);

CREATE POLICY "Station owners can insert into command audit log"
ON public.command_audit_log FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = executed_by AND
    station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
);
