"use client";

import { supabase } from "./supabase";
import type { TelemetryData } from "./station";

export interface PendingSyncItem {
  id: string;
  type: "visit" | "profile" | "telemetry" | "command";
  payload: Record<string, unknown>;
  createdAt: string;
}

class DatabaseSyncService {
  private queue: PendingSyncItem[] = [];
  private isProcessing = false;
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private currentStationId: string | null = null;
  private listeners: Array<(isOnline: boolean, pendingCount: number) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;

      window.addEventListener("online", () => {
        this.isOnline = true;
        this.notifyListeners();
        this.flushQueue();
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        this.notifyListeners();
      });

      // Cleanup any legacy localStorage keys per user request
      try {
        localStorage.removeItem("pawstation-cat-profile");
      } catch {
        /* ignore */
      }
    }
  }

  public subscribe(fn: (isOnline: boolean, pendingCount: number) => void): () => void {
    this.listeners.push(fn);
    fn(this.isOnline, this.queue.length);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.isOnline, this.queue.length));
  }

  public getStationId(): string | null {
    return this.currentStationId;
  }

  public setStationId(stationId: string | null) {
    this.currentStationId = stationId;
  }

  /**
   * Fetches or ensures a default station record for the authenticated user in Supabase
   */
  public async ensureUserStation(userId: string, defaultHost?: string, stationName?: string): Promise<string | null> {
    try {
      const { data: existing, error } = await supabase
        .from("stations")
        .select("id, local_ip, device_name")
        .eq("owner_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existing && !error) {
        this.currentStationId = existing.id;
        return existing.id;
      }

      // Create new station record for user
      const identifier = `pawstation-${userId.slice(0, 8)}`;
      const { data: created, error: createError } = await supabase
        .from("stations")
        .insert({
          owner_id: userId,
          device_identifier: identifier,
          device_name: stationName || "PawStation Unit 1",
          local_ip: defaultHost || "192.168.30.98",
          is_online: true,
          last_seen_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!createError && created) {
        this.currentStationId = created.id;
        return created.id;
      }
    } catch {
      /* offline fallback */
    }
    return null;
  }

  /**
   * Records a cat visit directly to Supabase with in-memory offline queue fallback
   */
  public async recordVisit(visit: {
    id?: string;
    userId?: string | null;
    stationId?: string | null;
    visitStart: string;
    peakWeightG: number;
    durationSeconds?: number | null;
  }): Promise<boolean> {
    const payload = {
      user_id: visit.userId || null,
      station_id: visit.stationId || this.currentStationId || null,
      visit_start: visit.visitStart,
      peak_weight_g: visit.peakWeightG,
      duration_seconds: visit.durationSeconds ?? 30,
    };

    if (this.isOnline) {
      try {
        const { error } = await supabase.from("cat_visits").insert(payload);
        if (!error) {
          return true;
        }
      } catch {
        /* fall through to queue */
      }
    }

    // Queue in memory for later sync
    this.queue.push({
      id: visit.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      type: "visit",
      payload,
      createdAt: new Date().toISOString(),
    });
    this.notifyListeners();
    return false;
  }

  /**
   * Synchronizes cat profile to Supabase with in-memory offline fallback
   */
  public async syncProfile(userId: string, profile: { catName: string; catBreed: string; stationName: string }): Promise<boolean> {
    const payload = {
      user_id: userId,
      cat_name: profile.catName,
      cat_breed: profile.catBreed,
      station_name: profile.stationName,
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { error } = await supabase.from("cat_profiles").upsert(payload, { onConflict: "user_id" });
        if (!error) {
          return true;
        }
      } catch {
        /* fall through to queue */
      }
    }

    // Queue in memory
    this.queue.push({
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: "profile",
      payload,
      createdAt: new Date().toISOString(),
    });
    this.notifyListeners();
    return false;
  }

  /**
   * Periodically snapshots scale weight & telemetry to Supabase telemetry_logs
   */
  public async logTelemetrySnapshot(telemetry: TelemetryData, stationId?: string | null): Promise<void> {
    const targetStationId = stationId || this.currentStationId;
    if (!targetStationId || !this.isOnline) return;

    try {
      await supabase.from("telemetry_logs").insert({
        station_id: targetStationId,
        weight_g: telemetry.weight,
        scale_ok: telemetry.scaleOk,
        cat_present: telemetry.cat,
        water_raw: telemetry.water,
        water_low: telemetry.waterLow,
        wifi_rssi: telemetry.rssi,
        pump_state: telemetry.pump,
      });
    } catch {
      /* non-blocking telemetry log */
    }
  }

  /**
   * Audits commands and records feeding events
   */
  public async logCommandAudit(
    commandName: "dispense" | "pump" | "tare",
    userId: string,
    stationId?: string | null,
    success = true
  ): Promise<void> {
    const targetStationId = stationId || this.currentStationId;
    if (!targetStationId) return;

    if (this.isOnline) {
      try {
        await supabase.from("command_audit_log").insert({
          station_id: targetStationId,
          executed_by: userId,
          command_name: commandName,
          success,
        });

        if (commandName === "dispense") {
          await supabase.from("feeding_events").insert({
            station_id: targetStationId,
            trigger_type: "manual",
            triggered_by: userId,
            status: success ? "success" : "failed",
            portion_count: 1,
          });
        }
      } catch {
        /* non-blocking audit */
      }
    }
  }

  /**
   * Flushes in-memory queue to Supabase when reconnected
   */
  public async flushQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !this.isOnline) return;
    this.isProcessing = true;

    const remaining: PendingSyncItem[] = [];

    for (const item of this.queue) {
      try {
        if (item.type === "visit") {
          const { error } = await supabase.from("cat_visits").insert(item.payload);
          if (error) remaining.push(item);
        } else if (item.type === "profile") {
          const { error } = await supabase
            .from("cat_profiles")
            .upsert(item.payload, { onConflict: "user_id" });
          if (error) remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    this.queue = remaining;
    this.isProcessing = false;
    this.notifyListeners();
  }
}

export const dbSync = new DatabaseSyncService();
