import type { SearchMode } from "./serpUrl";

/**
 * Watchlist: the keyword + market pairs someone wants to re-check over time.
 *
 * This is the honest version of "SERP tracking" for a tool without a backend.
 * GeoSERP never fetches Google itself, so it cannot record positions. What it
 * can do is remember exactly which SERP you looked at and when, and reopen the
 * identical unpersonalized URL in one click, so you compare it yourself.
 *
 * Same contract as history: localStorage only, nothing leaves the browser.
 */

export const WATCHLIST_KEY = "geoserp.watchlist.v1";
export const WATCHLIST_LIMIT = 50;
/** After this many days without a check, an entry is flagged as due. */
export const DUE_AFTER_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export type WatchEntry = {
  id: string;
  keyword: string;
  location: string;
  domain: string;
  gl: string;
  hl: string;
  mode: SearchMode;
  /** epoch ms */
  addedAt: number;
  /** epoch ms of the last "check again" click, equal to addedAt until then */
  checkedAt: number;
};

export type WatchTarget = Pick<WatchEntry, "keyword" | "location" | "domain" | "gl" | "hl" | "mode">;

function sameTarget(a: WatchTarget, b: WatchTarget): boolean {
  return (
    a.keyword.toLowerCase() === b.keyword.toLowerCase() &&
    a.location === b.location &&
    a.domain === b.domain &&
    a.gl === b.gl &&
    a.hl === b.hl &&
    a.mode === b.mode
  );
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function persist(entries: WatchEntry[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(entries));
  } catch {
    // A failed write must never break the search itself.
  }
}

function isWatchEntry(value: unknown): value is WatchEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.keyword === "string" &&
    typeof e.location === "string" &&
    typeof e.domain === "string" &&
    typeof e.gl === "string" &&
    typeof e.hl === "string" &&
    (e.mode === "organic" || e.mode === "local") &&
    typeof e.addedAt === "number" &&
    typeof e.checkedAt === "number"
  );
}

export function loadWatchlist(): WatchEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWatchEntry).slice(0, WATCHLIST_LIMIT);
  } catch {
    return [];
  }
}

export function isWatched(entries: WatchEntry[], target: WatchTarget): boolean {
  return entries.some((e) => sameTarget(e, target));
}

/** Adds a target once. Re-adding an existing one leaves the list untouched. */
export function addWatch(
  entries: WatchEntry[],
  target: WatchTarget,
  now: number,
  id: string,
): WatchEntry[] {
  if (isWatched(entries, target)) return entries;
  const next = [{ ...target, id, addedAt: now, checkedAt: now }, ...entries].slice(
    0,
    WATCHLIST_LIMIT,
  );
  persist(next);
  return next;
}

export function markChecked(entries: WatchEntry[], id: string, now: number): WatchEntry[] {
  const next = entries.map((e) => (e.id === id ? { ...e, checkedAt: now } : e));
  persist(next);
  return next;
}

export function removeWatch(entries: WatchEntry[], id: string): WatchEntry[] {
  const next = entries.filter((e) => e.id !== id);
  persist(next);
  return next;
}

/** Whole days since the last check, never negative. */
export function daysSinceCheck(entry: WatchEntry, now: number): number {
  return Math.max(0, Math.floor((now - entry.checkedAt) / DAY_MS));
}

export function isDue(entry: WatchEntry, now: number): boolean {
  return daysSinceCheck(entry, now) >= DUE_AFTER_DAYS;
}

export function formatSince(days: number): string {
  if (days === 0) return "checked today";
  if (days === 1) return "checked yesterday";
  return `checked ${days} days ago`;
}
