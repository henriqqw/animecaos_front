import fs from "node:fs";
import path from "node:path";

import type { AnalyticsEvent } from "@/domain/events/types";

function resolveDataPath(): string {
  const configuredPath = process.env.DATABASE_PATH ?? "./data/events.ndjson";
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

function ensureDataFile(filePath: string): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf-8");
  }
}

function parseLine(line: string): AnalyticsEvent | null {
  if (!line.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(line) as Partial<AnalyticsEvent>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      eventId: parsed.eventId ?? "",
      eventName: parsed.eventName ?? "unknown_event",
      occurredAt: parsed.occurredAt ?? new Date(0).toISOString(),
      visitorId: parsed.visitorId ?? "",
      sessionId: parsed.sessionId ?? null,
      path: parsed.path ?? null,
      referrer: parsed.referrer ?? null,
      country: parsed.country ?? null,
      userAgent: parsed.userAgent ?? null,
      deviceType: parsed.deviceType ?? "unknown",
      isBot: parsed.isBot ?? false,
      metadata: parsed.metadata ?? {}
    };
  } catch {
    return null;
  }
}

export class EventFileStore {
  private readonly filePath: string;

  public constructor() {
    this.filePath = resolveDataPath();
    ensureDataFile(this.filePath);
  }

  public readAll(): AnalyticsEvent[] {
    const content = fs.readFileSync(this.filePath, "utf-8");
    const lines = content.split("\n");
    const events: AnalyticsEvent[] = [];

    for (const line of lines) {
      const event = parseLine(line);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  public append(event: AnalyticsEvent): void {
    fs.appendFileSync(this.filePath, `${JSON.stringify(event)}\n`, "utf-8");
  }
}
