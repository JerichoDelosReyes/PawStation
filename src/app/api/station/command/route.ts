import { NextResponse } from "next/server";
import { isAllowedStationCommand, isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";
import { queueStationCommand } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { command, host: hostParam, station_id } = body;

    if (!isAllowedStationCommand(command)) {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    const host =
      hostParam && isValidStationHost(hostParam)
        ? sanitizeStationHost(hostParam)
        : process.env.NEXT_PUBLIC_ESP32_HOST || "192.168.0.118";

    const cleanHost = host
      .replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/i, "")
      .replace(/:81$/, "")
      .replace(/\/+$/, "");

    let directOk = false;

    // 1. Try direct LAN connection first (works on localhost development)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`http://${cleanHost}/api/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, cmd: command, action: command }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);
      if (res && res.ok) {
        directOk = true;
      }
    } catch {
      // Local LAN not reachable (e.g. executing in Vercel Cloud)
    }

    // 2. Queue command in Supabase Cloud Relay (guaranteed execution across WAN/mobile)
    const queuedInCloud = await queueStationCommand(command, station_id);

    return NextResponse.json({
      status: "ok",
      command,
      mode: directOk ? "direct_lan" : "cloud_queued",
      queued: queuedInCloud,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute command";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
