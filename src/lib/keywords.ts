/**
 * Comma separated keywords, one tab each.
 *
 * Splitting on commas means a keyword can never itself contain a comma, which
 * is fine: Google treats commas as separators anyway, so nobody searches for
 * one deliberately.
 */

/** Opening more than this at once is almost always a mistake, not a workflow. */
export const MAX_KEYWORDS = 10;

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
