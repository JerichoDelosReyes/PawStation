import { NextResponse } from "next/server";
import { isAllowedStationCommand, isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, host: hostParam } = body;

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    // 1. Try primary REST endpoint with rich payload
    let res = await fetch(`http://${cleanHost}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, cmd: command, action: command }),
      signal: controller.signal,
    }).catch(() => null);

    // 2. Also trigger direct dedicated action endpoint (e.g. /dispense, /pump, /tare)
    // which has zero body-parsing requirements in the firmware
    if (!res || !res.ok) {
      res = await fetch(`http://${cleanHost}/${command}`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);
    } else {
      // Fire dedicated GET endpoint as well to guarantee execution
      fetch(`http://${cleanHost}/${command}`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => {});
    }

    clearTimeout(timeout);

    if (!res) {
      return NextResponse.json({ error: "Failed to reach ESP32" }, { status: 504 });
    }

    return NextResponse.json({ status: "ok", executed: command });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send command to ESP32";
    return NextResponse.json({ error: message }, { status: 504 });
  }
}
