import { describe, expect, it } from "vitest";
import {
  canonicalByteLength,
  encodeUule,
  normalizeCanonicalName,
  resolveCanonical,
  varint,
} from "./uule";
import { COUNTRIES, EU_COUNTRIES } from "./countries";
import { buildSearch } from "./serpUrl";
import { detectIncognitoHint, withArticle } from "./incognito";
import { MAX_KEYWORDS, parseKeywords } from "./keywords";
import { addHistory, HISTORY_LIMIT, type HistoryEntry } from "./history";

/**
 * Reference implementation of the widely copied shortcut. It is only correct
 * for canonical names up to 63 bytes, which is exactly what the tests below
 * pin down: agreement inside that range, divergence outside it.
 */
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function shortcutUule(name: string): string {
  const bytes = Buffer.from(name, "utf8");
  return `w+CAIQICI${B64_ALPHABET[bytes.length]}${bytes.toString("base64").replace(/=+$/, "")}`;
}

describe("encodeUule", () => {
  // Captured from live seoroast.com output on 2026-07-25, which is in turn
  // what Google accepts. These two are the ground truth for the format.
  it.each([
    ["Berlin,Berlin,Germany", "w+CAIQICIVQmVybGluLEJlcmxpbixHZXJtYW55"],
    [
      "New York,New York,United States",
      "w+CAIQICIfTmV3IFlvcmssTmV3IFlvcmssVW5pdGVkIFN0YXRlcw",
    ],
  ])("matches observed Google output for %s", (name, expected) => {
    expect(encodeUule(name)).toBe(expected);
  });

  it("agrees with the shortcut formula for every ASCII name up to 63 bytes", () => {
    const samples = [
      "Prague,Prague,Czechia",
      "Rome,Lazio,Italy",
      "Valletta,Malta",
      "Warsaw,Warsaw,Masovian Voivodeship,Poland",
      "Copenhagen,Capital Region of Denmark,Denmark",
      "Helsinki,Helsinki,Uusimaa,Finland",
    ];
    for (const name of samples) {
      expect(canonicalByteLength(name)).toBeLessThanOrEqual(63);
      expect(encodeUule(name)).toBe(shortcutUule(name));
    }
  });

  it("encodes non-ASCII names by UTF-8 byte length, not character count", () => {
    // A real canonical name from the geotargets dataset.
    const name = "Saint-Pierre-de-l'Île-d'Orléans,Quebec,Canada";
    expect(name.length).toBe(45);
    expect(canonicalByteLength(name)).toBe(47);

    const payload = Buffer.from(encodeUule(name).slice("w+".length), "base64");
    expect([...payload.subarray(0, 5)]).toEqual([0x08, 0x02, 0x10, 0x20, 0x22]);
    expect(payload[5]).toBe(47);
    expect(payload.subarray(6).toString("utf8")).toBe(name);
  });

  it("stays correct past 63 bytes, where the shortcut formula breaks", () => {
    // The longest name in the dataset, and it is an EU one (Greece).
    const long =
      "Loutraki-Agioi Theodoroi Municipality,Decentralized Administration of Peloponnese, Western Greece and the Ionian,Greece";
    expect(canonicalByteLength(long)).toBe(119);

    const payload = Buffer.from(encodeUule(long).slice("w+".length), "base64");
    expect(payload[5]).toBe(119);
    expect(payload.subarray(6).toString("utf8")).toBe(long);
    // And it is genuinely a different string than the shortcut would produce.
    expect(encodeUule(long)).not.toBe(shortcutUule(long));
  });

  it("round-trips every EU capital", () => {
    for (const country of EU_COUNTRIES) {
      const payload = Buffer.from(encodeUule(country.capital).slice("w+".length), "base64");
      expect(payload.subarray(6).toString("utf8")).toBe(country.capital);
    }
  });

  it("returns an empty string for empty input", () => {
    expect(encodeUule("   ")).toBe("");
  });
});

describe("varint", () => {
  it("encodes single-byte values below 128", () => {
    expect(varint(0)).toEqual([0x00]);
    expect(varint(21)).toEqual([0x15]);
    expect(varint(127)).toEqual([0x7f]);
  });

  it("encodes multi-byte values above 127", () => {
    expect(varint(128)).toEqual([0x80, 0x01]);
    expect(varint(300)).toEqual([0xac, 0x02]);
  });

  it("rejects negative input", () => {
    expect(() => varint(-1)).toThrow();
  });
});

describe("normalizeCanonicalName", () => {
  it("drops spaces around commas so pasted names still encode correctly", () => {
    expect(normalizeCanonicalName("Berlin, Berlin, Germany")).toBe("Berlin,Berlin,Germany");
    expect(normalizeCanonicalName("  Prague ,Prague , Czechia ")).toBe("Prague,Prague,Czechia");
  });

  it("leaves casing untouched, because Google's names are case sensitive", () => {
    expect(normalizeCanonicalName("berlin,Berlin,Germany")).toBe("berlin,Berlin,Germany");
  });
});

describe("countries table", () => {
  it("covers all 27 EU member states with gl, native hl and a local domain", () => {
    expect(EU_COUNTRIES).toHaveLength(27);
    const codes = new Set(EU_COUNTRIES.map((c) => c.code));
    for (const code of [
      "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
      "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
      "SE", "SI", "SK",
    ]) {
      expect(codes.has(code), `missing EU member state ${code}`).toBe(true);
    }
    for (const country of EU_COUNTRIES) {
      expect(country.gl, country.code).toMatch(/^[a-z]{2}$/);
      expect(country.hl, country.code).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      expect(country.domain, country.code).toMatch(/^google\.[a-z.]+$/);
      expect(country.capital.split(",").length, country.code).toBeGreaterThanOrEqual(2);
    }
  });

  it("defaults EU countries to their own language rather than English", () => {
    const nonEnglish = EU_COUNTRIES.filter((c) => c.hl !== "en");
    // Ireland and Malta are the only ones where English is a native default;
    // Malta ships hl=mt, so only Ireland should remain on English.
    expect(EU_COUNTRIES.length - nonEnglish.length).toBe(1);
  });

  it("has unique country codes", () => {
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
  });
});

describe("resolveCanonical", () => {
  const known = new Set([
    "Berlin,Berlin,Germany",
    "Loutraki-Agioi Theodoroi Municipality,Decentralized Administration of Peloponnese, Western Greece and the Ionian,Greece",
  ]);
  const isKnown = (candidate: string) => known.has(candidate);

  it("keeps a verbatim canonical name untouched, commas with spaces included", () => {
    const greek = [...known][1];
    expect(resolveCanonical(greek, isKnown)).toEqual({ canonical: greek, verified: true });
    // The naive normalization would have destroyed this name.
    expect(normalizeCanonicalName(greek)).not.toBe(greek);
  });

  it("normalizes a pasted name so it matches the canonical form", () => {
    expect(resolveCanonical("Berlin, Berlin, Germany", isKnown)).toEqual({
      canonical: "Berlin,Berlin,Germany",
      verified: true,
    });
  });

  it("falls back to normalized free text and flags it as unverified", () => {
    expect(resolveCanonical("Somewhere, Nowhere, Atlantis", isKnown)).toEqual({
      canonical: "Somewhere,Nowhere,Atlantis",
      verified: false,
    });
  });

  it("handles empty input", () => {
    expect(resolveCanonical("  ", isKnown)).toEqual({ canonical: "", verified: false });
  });
});

describe("buildSearch", () => {
  it("builds the Berlin reference URL", () => {
    const { url, uule } = buildSearch({
      keyword: "best seo agency",
      location: "Berlin,Berlin,Germany",
      domain: "google.de",
      gl: "de",
      hl: "de",
      mode: "organic",
    });
    expect(uule).toBe("w+CAIQICIVQmVybGluLEJlcmxpbixHZXJtYW55");
    expect(url).toBe(
      "https://www.google.de/search?q=best%20seo%20agency&gl=de&hl=de&pws=0" +
        "&uule=w%2BCAIQICIVQmVybGluLEJlcmxpbixHZXJtYW55",
    );
  });

  it("always disables personalization", () => {
    const { url } = buildSearch({
      keyword: "x",
      location: "Prague,Prague,Czechia",
      domain: "google.cz",
      gl: "cz",
      hl: "cs",
      mode: "organic",
    });
    expect(url).toContain("pws=0");
  });

  it("adds tbm=lcl only in local mode", () => {
    const base = {
      keyword: "coffee",
      location: "Prague,Prague,Czechia",
      domain: "google.cz",
      gl: "cz",
      hl: "cs",
    } as const;
    expect(buildSearch({ ...base, mode: "organic" }).url).not.toContain("tbm=");
    expect(buildSearch({ ...base, mode: "local" }).url).toContain("tbm=lcl");
  });

  it("omits uule when no location is given", () => {
    const { url, uule } = buildSearch({
      keyword: "x",
      location: "",
      domain: "google.com",
      gl: "us",
      hl: "en",
      mode: "organic",
    });
    expect(uule).toBe("");
    expect(url).not.toContain("uule=");
  });
});

describe("history", () => {
  const entry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
    id: Math.random().toString(36).slice(2),
    keyword: "seo",
    location: "Prague,Prague,Czechia",
    domain: "google.cz",
    gl: "cz",
    hl: "cs",
    mode: "organic",
    at: 1,
    ...overrides,
  });

  it("puts the newest entry first", () => {
    const list = addHistory(addHistory([], entry({ keyword: "a" })), entry({ keyword: "b" }));
    expect(list.map((e) => e.keyword)).toEqual(["b", "a"]);
  });

  it("dedupes identical simulations instead of piling them up", () => {
    const first = addHistory([], entry({ keyword: "same" }));
    const second = addHistory(first, entry({ keyword: "same" }));
    expect(second).toHaveLength(1);
  });

  it("caps the list", () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 10; i += 1) {
      list = addHistory(list, entry({ keyword: `q${i}` }));
    }
    expect(list).toHaveLength(HISTORY_LIMIT);
  });
});

describe("incognito hints", () => {
  const CHROME_MAC =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
  const CHROME_WIN =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
  const FIREFOX_WIN =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0";
  const EDGE_WIN =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0";
  const SAFARI_MAC =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";

  it("gives Mac visitors the Cmd shortcut", () => {
    expect(detectIncognitoHint(CHROME_MAC, "macOS")).toEqual({
      shortcut: "Shift + Cmd + N",
      otherShortcut: "Ctrl + Shift + N",
      otherPlatform: "Windows and Linux",
      modeName: "incognito window",
      browser: "Chrome",
    });
  });

  it("gives Windows visitors the Ctrl shortcut for the same browser", () => {
    expect(detectIncognitoHint(CHROME_WIN, "Windows")).toEqual({
      shortcut: "Ctrl + Shift + N",
      otherShortcut: "Shift + Cmd + N",
      otherPlatform: "macOS",
      modeName: "incognito window",
      browser: "Chrome",
    });
  });

  it("gives Linux visitors the Ctrl shortcut", () => {
    expect(detectIncognitoHint(CHROME_WIN, "Linux").shortcut).toBe("Ctrl + Shift + N");
  });

  it("uses the P key for Firefox, on both platforms", () => {
    expect(detectIncognitoHint(FIREFOX_WIN, "Windows").shortcut).toBe("Ctrl + Shift + P");
    expect(detectIncognitoHint(FIREFOX_WIN, "macOS").shortcut).toBe("Shift + Cmd + P");
  });

  it("detects Edge before Chrome, since Edge's UA contains both", () => {
    const hint = detectIncognitoHint(EDGE_WIN, "Windows");
    expect(hint.browser).toBe("Edge");
    expect(hint.modeName).toBe("InPrivate window");
    expect(hint.shortcut).toBe("Ctrl + Shift + N");
  });

  it("detects Safari", () => {
    expect(detectIncognitoHint(SAFARI_MAC, "macOS").browser).toBe("Safari");
  });

  it("falls back to the user agent when no platform hint is available", () => {
    expect(detectIncognitoHint(CHROME_MAC, "").shortcut).toBe("Shift + Cmd + N");
    expect(detectIncognitoHint(CHROME_WIN, "").shortcut).toBe("Ctrl + Shift + N");
  });

  it("never leaves a visitor without an alternative shortcut", () => {
    for (const [ua, platform] of [
      [CHROME_MAC, "macOS"],
      [CHROME_WIN, "Windows"],
      [FIREFOX_WIN, "Linux"],
      ["SomeUnknownBrowser/1.0", ""],
    ] as [string, string][]) {
      const hint = detectIncognitoHint(ua, platform);
      expect(hint.shortcut).not.toBe(hint.otherShortcut);
      expect(hint.otherShortcut).toMatch(/^(Ctrl \+ Shift|Shift \+ Cmd) \+ [NP]$/);
      expect(hint.otherPlatform.length).toBeGreaterThan(0);
    }
  });

  it("does not invent a browser name it cannot detect", () => {
    expect(detectIncognitoHint("SomeUnknownBrowser/1.0", "Linux").browser).toBe("your browser");
  });
});

describe("withArticle", () => {
  it("picks the article that matches the mode name", () => {
    expect(withArticle("incognito window")).toBe("an incognito window");
    expect(withArticle("private window")).toBe("a private window");
    expect(withArticle("InPrivate window")).toBe("an InPrivate window");
  });
});

describe("parseKeywords", () => {
  it("splits on commas and trims", () => {
    expect(parseKeywords("seo tool, jira alternative ,  crm").keywords).toEqual([
      "seo tool",
      "jira alternative",
      "crm",
    ]);
  });

  it("treats a single keyword as one search", () => {
    expect(parseKeywords("project management software").keywords).toEqual([
      "project management software",
    ]);
  });

  it("ignores empty segments from trailing or doubled commas", () => {
    expect(parseKeywords("a,,b,").keywords).toEqual(["a", "b"]);
    expect(parseKeywords("   ").keywords).toEqual([]);
  });

  it("collapses inner whitespace", () => {
    expect(parseKeywords("best   seo    agency").keywords).toEqual(["best seo agency"]);
  });

  it("dedupes case insensitively, keeping the first spelling", () => {
    const parsed = parseKeywords("SEO tool, seo tool, Seo Tool");
    expect(parsed.keywords).toEqual(["SEO tool"]);
    expect(parsed.entered).toBe(1);
  });

  it("caps the list and reports that it did", () => {
    const many = Array.from({ length: MAX_KEYWORDS + 4 }, (_, i) => `kw${i}`).join(",");
    const parsed = parseKeywords(many);
    expect(parsed.keywords).toHaveLength(MAX_KEYWORDS);
    expect(parsed.entered).toBe(MAX_KEYWORDS + 4);
    expect(parsed.truncated).toBe(true);
  });

  it("does not report truncation when the list fits", () => {
    expect(parseKeywords("a,b,c").truncated).toBe(false);
  });

  it("produces one distinct search URL per keyword, sharing the other settings", () => {
    const { keywords } = parseKeywords("alpha, beta");
    const urls = keywords.map(
      (kw) =>
        buildSearch({
          keyword: kw,
          location: "Berlin,Berlin,Germany",
          domain: "google.de",
          gl: "de",
          hl: "de",
          mode: "organic",
        }).url,
    );
    expect(urls[0]).toContain("q=alpha");
    expect(urls[1]).toContain("q=beta");
    expect(new Set(urls).size).toBe(2);
    for (const url of urls) {
      expect(url).toContain("gl=de");
      expect(url).toContain("hl=de");
      expect(url).toContain("pws=0");
      expect(url).toContain("uule=w%2BCAIQICIVQmVybGluLEJlcmxpbixHZXJtYW55");
    }
  });
});
