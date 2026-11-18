import { NextResponse } from "next/server";
import { isValidScheduleString, isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schedule, host: hostParam } = body;

    if (!isValidScheduleString(schedule)) {
      return NextResponse.json({ error: "Invalid schedule" }, { status: 400 });
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
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`http://${cleanHost}/api/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule, sched: schedule }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: `ESP32 returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json().catch(() => ({ status: "ok", schedule }));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update schedule on ESP32";
    return NextResponse.json({ error: message }, { status: 504 });
  }
}
