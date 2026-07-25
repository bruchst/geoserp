export type Location = {
  /** full Google canonical name, e.g. "Prague,Prague,Czechia" */
  canonical: string;
  /** ISO country code from the dataset */
  country: string;
  /** first segment of the canonical name, for display */
  city: string;
};

const FILES = {
  eu: "/locations-eu.txt",
  world: "/locations-world.txt",
} as const;

function parse(text: string): Location[] {
  const out: Location[] = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const sep = line.lastIndexOf("|");
    if (sep < 0) continue;
    const canonical = line.slice(0, sep);
    out.push({
      canonical,
      country: line.slice(sep + 1),
      city: canonical.slice(0, canonical.indexOf(",") === -1 ? undefined : canonical.indexOf(",")),
    });
  }
  return out;
}

/**
 * Loads the two location datasets. EU first, because full EU coverage is the
 * primary use case; the rest of the world streams in right after and search
 * simply widens once it lands. Both are plain static files on the CDN, so
 * there is no backend involved.
 */
export function createLocationIndex() {
  let eu: Location[] = [];
  let world: Location[] = [];
  const exact = new Set<string>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((fn) => fn());

  const load = async () => {
    try {
      const euRes = await fetch(FILES.eu);
      if (euRes.ok) {
        eu = parse(await euRes.text());
        for (const loc of eu) exact.add(loc.canonical);
        notify();
      }
    } catch {
      // Offline or blocked: free-text entry still works, so degrade quietly.
    }
    try {
      const worldRes = await fetch(FILES.world);
      if (worldRes.ok) {
        world = parse(await worldRes.text());
        for (const loc of world) exact.add(loc.canonical);
        notify();
      }
    } catch {
      /* same as above */
    }
  };

  return {
    load,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get status() {
      return { eu: eu.length, world: world.length, ready: eu.length > 0 };
    },
    /** True when the string is verbatim one of Google's canonical names. */
    has(canonical: string): boolean {
      return exact.has(canonical);
    },
    /**
     * Ranked prefix/substring search. Exact city matches first, then prefix
     * matches ordered by how much longer the city name is than the query
     * ("Krak" puts Krakow above Krakovany), then substring matches. EU rows
     * win ties, so "Ber" surfaces Berlin before Berlin, Maryland.
     */
    search(query: string, limit = 12, restrictToCountry?: string): Location[] {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      const scored: { loc: Location; score: number }[] = [];

      const consider = (list: Location[], euBonus: number) => {
        for (const loc of list) {
          if (restrictToCountry && loc.country !== restrictToCountry) continue;
          const city = loc.city.toLowerCase();
          let tier: number;
          if (city === q) tier = 0;
          else if (city.startsWith(q)) tier = 1;
          else if (loc.canonical.toLowerCase().includes(q)) tier = 2;
          else continue;
          // Closeness of the city name to the query dominates within a tier;
          // canonical length only breaks remaining ties, so the plain
          // "Rome,Lazio,Italy" beats "Rome,Rome,Lazio,Italy".
          const closeness = Math.min((city.length - q.length) / 20, 1);
          scored.push({
            loc,
            score: tier * 10 + closeness * 4 + euBonus * 0.5 + Math.min(loc.canonical.length / 500, 0.4),
          });
        }
      };

      consider(eu, 0);
      consider(world, 1);

      return scored
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map((s) => s.loc);
    },
  };
}

export type LocationIndex = ReturnType<typeof createLocationIndex>;
