export const ALLOWED_STATION_COMMANDS = ["dispense", "pump", "tare"] as const;
export type StationCommand = (typeof ALLOWED_STATION_COMMANDS)[number];

export function isAllowedStationCommand(cmd: unknown): cmd is StationCommand {
  return typeof cmd === "string" && (ALLOWED_STATION_COMMANDS as readonly string[]).includes(cmd);
}

/**
 * Validates ESP32 station host to prevent SSRF, connection poisoning, and injection attacks.
 * Accepts IPv4 addresses (LAN/loopback), valid mDNS hostnames (.local), or localhost, with optional port 1-65535.
 */
export function isValidStationHost(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 253) return false;

  // Strip protocol prefix if provided
  const hostNoProto = trimmed.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/i, "");

  // Separate host and optional port
  const [hostPart, portPart, ...extra] = hostNoProto.split(":");
  if (extra.length > 0) return false;

  if (portPart !== undefined) {
    if (!/^\d{1,5}$/.test(portPart)) return false;
    const portNum = parseInt(portPart, 10);
    if (portNum < 1 || portNum > 65535) return false;
  }

  // Reject paths, query strings, fragments, userinfo, control chars
  if (/[\/\?\#\@\s\\'"<>]/.test(hostPart)) return false;

  // Check IPv4 format: 4 octets 0-255
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostPart.match(ipv4Regex);
  if (ipMatch) {
    const octets = [
      parseInt(ipMatch[1], 10),
      parseInt(ipMatch[2], 10),
      parseInt(ipMatch[3], 10),
      parseInt(ipMatch[4], 10),
    ];
    return octets.every((octet) => octet >= 0 && octet <= 255);
  }

  // Check standard hostname / mDNS domain (e.g. pawstation.local, localhost)
  const hostnameRegex =
    /^(?=.{1,253}$)(localhost|[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
  return hostnameRegex.test(hostPart);
}

export function sanitizeStationHost(input: string): string {
  const trimmed = input.trim();
  if (!isValidStationHost(trimmed)) {
    return "";
  }
  return trimmed.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/i, "").replace(/\/+$/, "");
}

/**
 * Validates feeding schedule string to prevent memory corruption or injection in ESP32 firmware parser.
 * Supports patterns like "08:00,18:00", "1|08:00,18:00", "0|08:00,18:00", or "0|".
 */
export function isValidScheduleString(schedule: string): boolean {
  if (!schedule || typeof schedule !== "string") return false;
  const trimmed = schedule.trim();
  if (trimmed.length > 80) return false;
  const pattern = /^(([01]\|)?([01]\d|2[0-3]):[0-5]\d(,\s*([01]\d|2[0-3]):[0-5]\d)*|0\|?)$/;
  return pattern.test(trimmed);
}
