import { encodeUule } from "./uule";

export type SearchMode = "organic" | "local";

export type SimulationInput = {
  keyword: string;
  /**
   * Google canonical location name, e.g. "Prague,Prague,Czechia", already
   * resolved by `resolveCanonical`. It is encoded verbatim: this function does
   * not reformat it, because some canonical names contain ", " inside a
   * component and rewriting them would break the lookup.
   */
  location: string;
  /** Google domain without protocol, e.g. "google.cz" */
  domain: string;
  /** gl parameter */
  gl: string;
  /** hl parameter */
  hl: string;
  mode: SearchMode;
  /** results per page; omitted when 10 (Google's default) */
  num?: number;
};

export type BuiltSearch = {
  url: string;
  uule: string;
  /** parameter list for the "generated parameters" panel */
  params: { key: string; value: string }[];
};

/**
 * Build the Google search URL that reproduces a SERP as seen from `location`.
 *
 * - `uule` carries the encoded canonical location
 * - `gl` sets the country of the search
 * - `hl` sets the interface language
 * - `pws=0` turns off personalization from the signed-in profile / history
 * - `tbm=lcl` switches to the local pack / Maps listing view
 *
 * Nothing is sent anywhere: this is a pure function and the resulting URL is
 * opened in the user's own browser.
 */
export function buildSearch(input: SimulationInput): BuiltSearch {
  const location = input.location.trim();
  const uule = location ? encodeUule(location) : "";

  const params: { key: string; value: string }[] = [
    { key: "q", value: input.keyword.trim() },
    { key: "gl", value: input.gl },
    { key: "hl", value: input.hl },
    { key: "pws", value: "0" },
  ];
  if (uule) params.push({ key: "uule", value: uule });
  if (input.mode === "local") params.push({ key: "tbm", value: "lcl" });
  if (input.num && input.num !== 10) params.push({ key: "num", value: String(input.num) });

  const query = params
    .map(({ key, value }) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return {
    url: `https://www.${input.domain}/search?${query}`,
    uule,
    params,
  };
}
