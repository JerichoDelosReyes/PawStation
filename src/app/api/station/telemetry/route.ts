import { NextResponse } from "next/server";
import { isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostParam = searchParams.get("host");
    const host =
      hostParam && isValidStationHost(hostParam)
        ? sanitizeStationHost(hostParam)
        : process.env.NEXT_PUBLIC_ESP32_HOST || "192.168.0.118";

    if (!host) {
      return NextResponse.json({ error: "Host not configured" }, { status: 400 });
    }

    const cleanHost = host
      .replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/i, "")
      .replace(/:81$/, "")
      .replace(/\/+$/, "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    let res = await fetch(`http://${cleanHost}/api/telemetry`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    }).catch(() => null);

    // Fallback to legacy /data endpoint if /api/telemetry returned null or 404
    if (!res || res.status === 404) {
      res = await fetch(`http://${cleanHost}/data`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null);
    }

    clearTimeout(timeout);

    if (!res) {
      return NextResponse.json(
        { error: "Could not reach ESP32 at " + cleanHost },
        { status: 504 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `ESP32 returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to ESP32";
    return NextResponse.json({ error: message }, { status: 504 });
  }
}
