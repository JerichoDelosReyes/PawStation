import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isValidStationHost, sanitizeStationHost } from "@/lib/station-validation";

export const dynamic = "force-dynamic";

function updateEnvFile(filePath: string, key: string, value: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const keyRegex = new RegExp(`^${key}=.*$`, "m");
      let newContent: string;
      if (keyRegex.test(content)) {
        newContent = content.replace(keyRegex, `${key}=${value}`);
      } else {
        newContent = content.trimEnd() + `\n${key}=${value}\n`;
      }
      fs.writeFileSync(filePath, newContent, "utf-8");
      return true;
    } else {
      // Create file if it doesn't exist
      fs.writeFileSync(filePath, `${key}=${value}\n`, "utf-8");
      return true;
    }
  } catch (err) {
    console.warn(`[Env] Failed to update ${filePath}:`, err);
    return false;
  }
}

export async function GET() {
  const currentHost = process.env.NEXT_PUBLIC_ESP32_HOST || "192.168.0.118";
  return NextResponse.json({
    host: currentHost,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host } = body;

    if (!host || typeof host !== "string" || !isValidStationHost(host)) {
      return NextResponse.json(
        { error: "Invalid host address. Must be a valid IP or hostname." },
        { status: 400 }
      );
    }

    const cleanHost = sanitizeStationHost(host);
    if (!cleanHost) {
      return NextResponse.json(
        { error: "Invalid sanitized host address" },
        { status: 400 }
      );
    }

    // 1. Update in-memory environment variable for running Node server process
    process.env.NEXT_PUBLIC_ESP32_HOST = cleanHost;

    // 2. Persist to .env.local and .env files on disk (safe for local dev, gracefully caught if readonly in production)
    const rootDir = process.cwd();
    const envLocalPath = path.join(rootDir, ".env.local");
    const envPath = path.join(rootDir, ".env");

    const savedLocal = updateEnvFile(envLocalPath, "NEXT_PUBLIC_ESP32_HOST", cleanHost);
    const savedEnv = updateEnvFile(envPath, "NEXT_PUBLIC_ESP32_HOST", cleanHost);

    return NextResponse.json({
      success: true,
      host: cleanHost,
      savedToFile: savedLocal || savedEnv,
      filesUpdated: {
        envLocal: savedLocal,
        env: savedEnv,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update station host";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
