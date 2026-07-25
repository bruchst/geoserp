/**
 * Comma separated keywords, one tab each.
 *
 * Splitting on commas means a keyword can never itself contain a comma, which
 * is fine: Google treats commas as separators anyway, so nobody searches for
 * one deliberately.
 */

/**
 * One call to action per keyword, so the limit is what still reads as a set of
 * buttons rather than a list.
 */
export const MAX_KEYWORDS = 3;

export type ParsedKeywords = {
  /** what will actually be opened, deduped and capped */
  keywords: string[];
  /** how many were entered before the cap was applied */
  entered: number;
  /** true when the cap dropped something, so the UI can say so */
  truncated: boolean;
};

export function parseKeywords(input: string): ParsedKeywords {
  const seen = new Set<string>();
  const all: string[] = [];

  for (const part of input.split(",")) {
    const keyword = part.trim().replace(/\s+/g, " ");
    if (!keyword) continue;
    // Case insensitive dedupe: "SEO tool" and "seo tool" are the same search.
    const fingerprint = keyword.toLowerCase();
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    all.push(keyword);
  }

  return {
    keywords: all.slice(0, MAX_KEYWORDS),
    entered: all.length,
    truncated: all.length > MAX_KEYWORDS,
  };
}
