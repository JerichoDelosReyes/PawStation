import { NextResponse } from "next/server";
import { isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";
import { getStationRecord } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostParam = searchParams.get("host");
    const stationIdParam = searchParams.get("station_id") || undefined;

    const host =
      hostParam && isValidStationHost(hostParam)
        ? sanitizeStationHost(hostParam)
        : process.env.NEXT_PUBLIC_ESP32_HOST || "192.168.0.118";

    const cleanHost = host
      .replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/i, "")
      .replace(/:81$/, "")
      .replace(/\/+$/, "");

    // 1. Try direct HTTP LAN connection first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`http://${cleanHost}/api/telemetry`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);

      clearTimeout(timeout);

      if (res && res.ok) {
        const data = await res.json();
        return NextResponse.json(data, {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        });
      }
    } catch {
      // Local LAN unreachable (e.g. executing in Vercel Cloud)
    }

    // 2. Cloud Relay Fallback via Supabase
    const station = await getStationRecord(stationIdParam);
    if (station && station.last_seen_at) {
      const diffMs = Date.now() - new Date(station.last_seen_at).getTime();
      const isOnline = diffMs < 30000; // active within 30 seconds

      return NextResponse.json(
        {
          weight: Number(station.current_weight_g || 0),
          raw: Number(station.current_water_raw || 4095),
          scaleOk: true,
          cat: Boolean(station.is_cat_present),
          visits: 1,
          water: Number(station.current_water_raw || 4095),
          waterLow: Boolean(station.is_water_low),
          pump: station.pump_state || "OFF",
          dispensing: false,
          rssi: Number(station.wifi_rssi || -60),
          clock: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          timeOk: true,
          sched: station.current_schedule || "08:00,18:00",
          lastAuto: "--",
          isOnline,
          cloudRelay: true,
          stationId: station.id,
        },
        {
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        }
      );
    }

    return NextResponse.json(
      { error: "Could not reach station locally or via cloud" },
      { status: 504 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to station";
    return NextResponse.json({ error: message }, { status: 504 });
  }
}
