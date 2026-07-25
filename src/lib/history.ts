import type { SearchMode } from "./serpUrl";

/**
 * Simulation history.
 *
 * Deliberately localStorage-only: there is no database and no server-side
 * persistence anywhere in this app. Nothing a user types leaves their browser.
 * Clearing site data clears the history, which is the intended contract.
 */

export const HISTORY_KEY = "geoserp.history.v1";
export const HISTORY_LIMIT = 25;

export type HistoryEntry = {
  id: string;
  keyword: string;
  location: string;
  domain: string;
  gl: string;
  hl: string;
  mode: SearchMode;
  /** epoch ms, set by the caller (kept out of this module so it stays pure-ish) */
  at: number;
};

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    // Safari in "block all cookies" mode throws on property access.
    return false;
  }
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.keyword === "string" &&
    typeof entry.location === "string" &&
    typeof entry.domain === "string" &&
    typeof entry.gl === "string" &&
    typeof entry.hl === "string" &&
    (entry.mode === "organic" || entry.mode === "local") &&
    typeof entry.at === "number"
  );
}

function persist(entries: HistoryEntry[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded or storage disabled: history is a convenience, not a
    // requirement, so a failed write must never break the search itself.
  }
}

/** Adds an entry, deduping identical simulations and keeping the newest first. */
export function addHistory(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const sameSimulation = (a: HistoryEntry, b: HistoryEntry) =>
    a.keyword === b.keyword &&
    a.location === b.location &&
    a.domain === b.domain &&
    a.gl === b.gl &&
    a.hl === b.hl &&
    a.mode === b.mode;

  const next = [entry, ...entries.filter((e) => !sameSimulation(e, entry))].slice(0, HISTORY_LIMIT);
  persist(next);
  return next;
}

export function removeHistory(entries: HistoryEntry[], id: string): HistoryEntry[] {
  const next = entries.filter((e) => e.id !== id);
  persist(next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* nothing to do */
    }
  }
  return [];
}
