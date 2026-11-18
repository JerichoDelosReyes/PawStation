import { NextResponse } from "next/server";
import { getStationRecord, updateStationFromDevice } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { device_id, station_id, ...telemetry } = body;

    const station = await getStationRecord(station_id || device_id);
    if (!station) {
      return NextResponse.json({ error: "Station not registered" }, { status: 404 });
    }

    const { command, payload } = await updateStationFromDevice(station.id, telemetry);

    return NextResponse.json({
      status: "ok",
      station_id: station.id,
      command,
      payload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloud sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const station = await getStationRecord();
  if (!station) {
    return NextResponse.json({ status: "offline", error: "No station registered" }, { status: 404 });
  }

  const isOnline = station.last_seen_at
    ? Date.now() - new Date(station.last_seen_at).getTime() < 30000
    : false;

  return NextResponse.json({
    status: isOnline ? "online" : "offline",
    station_id: station.id,
    weight: station.current_weight_g,
    water: station.current_water_raw,
    waterLow: station.is_water_low,
    cat: station.is_cat_present,
    pump: station.pump_state,
    rssi: station.wifi_rssi,
    sched: station.current_schedule,
    last_seen_at: station.last_seen_at,
  });
}
