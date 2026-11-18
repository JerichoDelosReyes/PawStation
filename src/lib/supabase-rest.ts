const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ztwmlfdyllevyxbgzokd.supabase.co";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  };
}

export interface StationTelemetryPayload {
  weight?: number;
  raw?: number;
  water?: number;
  waterLow?: boolean;
  scaleOk?: boolean;
  cat?: boolean;
  pump?: string;
  rssi?: number;
  sched?: string;
  clock?: string;
}

export interface StationRecord {
  id: string;
  owner_id: string;
  device_name: string;
  device_identifier: string;
  local_ip: string | null;
  is_online: boolean;
  last_seen_at: string | null;
  current_weight_g: number;
  current_water_raw: number;
  is_water_low: boolean;
  is_cat_present: boolean;
  pump_state: string;
  wifi_rssi: number;
  current_schedule: string;
  pending_command: string | null;
  pending_command_payload: Record<string, unknown> | null;
  last_telemetry_at: string | null;
}

/**
 * Fetch station by ID or first available station
 */
export async function getStationRecord(stationId?: string): Promise<StationRecord | null> {
  if (!SERVICE_KEY) return null;
  try {
    const url = stationId
      ? `${SUPABASE_URL}/rest/v1/stations?id=eq.${encodeURIComponent(stationId)}&limit=1`
      : `${SUPABASE_URL}/rest/v1/stations?order=created_at.asc&limit=1`;

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? (data[0] as StationRecord) : null;
  } catch {
    return null;
  }
}

/**
 * Updates station telemetry from device and returns any pending command
 */
export async function updateStationFromDevice(
  stationId: string,
  payload: StationTelemetryPayload
): Promise<{ command: string | null; payload: Record<string, unknown> | null }> {
  if (!SERVICE_KEY) return { command: null, payload: null };

  const nowIso = new Date().toISOString();
  const updateBody: Record<string, unknown> = {
    is_online: true,
    last_seen_at: nowIso,
    last_telemetry_at: nowIso,
  };

  if (typeof payload.weight === "number") updateBody.current_weight_g = payload.weight;
  if (typeof payload.water === "number") updateBody.current_water_raw = payload.water;
  if (typeof payload.waterLow === "boolean") updateBody.is_water_low = payload.waterLow;
  if (typeof payload.cat === "boolean") updateBody.is_cat_present = payload.cat;
  if (typeof payload.pump === "string") updateBody.pump_state = payload.pump;
  if (typeof payload.rssi === "number") updateBody.wifi_rssi = payload.rssi;
  if (typeof payload.sched === "string") updateBody.current_schedule = payload.sched;

  try {
    // 1. Update station row and return representation
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/stations?id=eq.${encodeURIComponent(stationId)}`,
      {
        method: "PATCH",
        headers: {
          ...getHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateBody),
      }
    );

    let command: string | null = null;
    let cmdPayload: Record<string, unknown> | null = null;

    if (patchRes.ok) {
      const records = await patchRes.json();
      if (Array.isArray(records) && records.length > 0) {
        const row = records[0] as StationRecord;
        if (row.pending_command) {
          command = row.pending_command;
          cmdPayload = row.pending_command_payload;

          // Clear the pending command so it executes once
          fetch(`${SUPABASE_URL}/rest/v1/stations?id=eq.${encodeURIComponent(stationId)}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({
              pending_command: null,
              pending_command_payload: {},
            }),
          }).catch(() => {});
        }
      }
    }

    // 2. Async background log into telemetry_logs
    if (typeof payload.weight === "number" && typeof payload.water === "number") {
      fetch(`${SUPABASE_URL}/rest/v1/telemetry_logs`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          station_id: stationId,
          weight_g: payload.weight,
          scale_ok: payload.scaleOk ?? true,
          cat_present: payload.cat ?? false,
          water_raw: payload.water,
          water_low: payload.waterLow ?? false,
          wifi_rssi: payload.rssi ?? -60,
          pump_state: payload.pump || "OFF",
        }),
      }).catch(() => {});
    }

    return { command, payload: cmdPayload };
  } catch {
    return { command: null, payload: null };
  }
}

/**
 * Queue a command for the station (Dispense, Pump, Tare, Schedule)
 */
export async function queueStationCommand(
  command: string,
  stationId?: string,
  payload: Record<string, unknown> = {}
): Promise<boolean> {
  if (!SERVICE_KEY) return false;
  try {
    const target = await getStationRecord(stationId);
    if (!target) return false;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/stations?id=eq.${encodeURIComponent(target.id)}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          pending_command: command,
          pending_command_payload: payload,
        }),
      }
    );

    return res.ok;
  } catch {
    return false;
  }
}
