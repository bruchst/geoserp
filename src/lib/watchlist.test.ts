import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  WATCHLIST_KEY,
  addWatch,
  daysSinceCheck,
  formatSince,
  isDue,
  isWatched,
  loadWatchlist,
  markChecked,
  removeWatch,
  type WatchTarget,
} from "./watchlist";

const DAY = 24 * 60 * 60 * 1000;

const target: WatchTarget = {
  keyword: "projektmanagement software",
  location: "Berlin,Berlin,Germany",
  domain: "google.de",
  gl: "de",
  hl: "de",
  mode: "organic",
};

function fakeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    store,
  };
}

let storage: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  storage = fakeStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("watchlist", () => {
  it("adds an entry with checkedAt equal to addedAt and persists it", () => {
    const list = addWatch([], target, 1000, "a");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ ...target, id: "a", addedAt: 1000, checkedAt: 1000 });
    expect(loadWatchlist()).toEqual(list);
  });

  it("does not add the same target twice, case-insensitive on the keyword", () => {
    const once = addWatch([], target, 1000, "a");
    const twice = addWatch(once, { ...target, keyword: "Projektmanagement Software" }, 2000, "b");
    expect(twice).toBe(once);
    expect(isWatched(twice, target)).toBe(true);
  });

  it("treats a different market as a different target", () => {
    const de = addWatch([], target, 1000, "a");
    const at = addWatch(de, { ...target, domain: "google.at", gl: "at" }, 2000, "b");
    expect(at.map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("markChecked only moves checkedAt of the matching entry", () => {
    let list = addWatch([], target, 1000, "a");
    list = addWatch(list, { ...target, keyword: "crm" }, 1000, "b");
    list = markChecked(list, "a", 9000);
    expect(list.find((e) => e.id === "a")).toMatchObject({ addedAt: 1000, checkedAt: 9000 });
    expect(list.find((e) => e.id === "b")?.checkedAt).toBe(1000);
  });

  it("removes an entry", () => {
    const list = removeWatch(addWatch([], target, 1000, "a"), "a");
    expect(list).toEqual([]);
    expect(loadWatchlist()).toEqual([]);
  });

  it("flags entries as due after 7 days and counts whole days", () => {
    const [entry] = addWatch([], target, 0, "a");
    expect(daysSinceCheck(entry, 6 * DAY + DAY - 1)).toBe(6);
    expect(isDue(entry, 6 * DAY)).toBe(false);
    expect(isDue(entry, 7 * DAY)).toBe(true);
    expect(daysSinceCheck(entry, -DAY)).toBe(0);
  });

  it("formats the last check", () => {
    expect(formatSince(0)).toBe("checked today");
    expect(formatSince(1)).toBe("checked yesterday");
    expect(formatSince(12)).toBe("checked 12 days ago");
  });

  it("survives corrupt or foreign storage content", () => {
    storage.setItem(WATCHLIST_KEY, "{not json");
    expect(loadWatchlist()).toEqual([]);
    storage.setItem(WATCHLIST_KEY, JSON.stringify([{ id: "x" }, null, 3]));
    expect(loadWatchlist()).toEqual([]);
  });

  it("returns an empty list without a window", () => {
    vi.unstubAllGlobals();
    expect(loadWatchlist()).toEqual([]);
  });
});
