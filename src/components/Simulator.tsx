"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRIES,
  EU_COUNTRIES,
  GOOGLE_DOMAINS,
  HOST_LANGUAGES,
  countryByCode,
  type Country,
} from "@/lib/countries";
import { createLocationIndex, type Location } from "@/lib/locations";
import { buildSearch, type SearchMode } from "@/lib/serpUrl";
import { currentIncognitoHint, withArticle, type IncognitoHint } from "@/lib/incognito";
import { resolveCanonical } from "@/lib/uule";
import {
  addHistory,
  clearHistory,
  loadHistory,
  removeHistory,
  type HistoryEntry,
} from "@/lib/history";

const CZ = countryByCode("CZ")!;

const POPULAR = [
  { label: "Prague", canonical: "Prague,Prague,Czechia", country: "CZ" },
  { label: "Berlin", canonical: "Berlin,Berlin,Germany", country: "DE" },
  { label: "Paris", canonical: "Paris,Paris,Ile-de-France,France", country: "FR" },
  { label: "Amsterdam", canonical: "Amsterdam,North Holland,Netherlands", country: "NL" },
  { label: "London", canonical: "London,England,United Kingdom", country: "GB" },
  { label: "New York", canonical: "New York,New York,United States", country: "US" },
];

export default function Simulator() {
  const [keyword, setKeyword] = useState("best seo agency");
  const [location, setLocation] = useState(CZ.capital);
  const [domain, setDomain] = useState(CZ.domain);
  const [hl, setHl] = useState(CZ.hl);
  const [gl, setGl] = useState(CZ.gl);
  const [mode, setMode] = useState<SearchMode>("organic");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [privateMode, setPrivateMode] = useState(false);
  const [handoffReady, setHandoffReady] = useState(false);
  const [hint, setHint] = useState<IncognitoHint | null>(null);

  useEffect(() => {
    setHint(currentIncognitoHint());
  }, []);

  const index = useMemo(() => createLocationIndex(), []);
  const [datasetTick, setDatasetTick] = useState(0);
  useEffect(() => {
    const unsubscribe = index.subscribe(() => setDatasetTick((t) => t + 1));
    void index.load();
    return () => {
      unsubscribe();
    };
  }, [index]);

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const locationBoxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () => (suggestOpen ? index.search(locationQuery, 8) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, locationQuery, suggestOpen, datasetTick],
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!locationBoxRef.current?.contains(event.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const { canonical: resolvedLocation, verified: isCanonical } = useMemo(
    () => resolveCanonical(location, (candidate) => index.has(candidate)),
    // datasetTick re-resolves once the location list has landed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, location, datasetTick],
  );

  const built = useMemo(
    () => buildSearch({ keyword, location: resolvedLocation, domain, gl, hl, mode }),
    [keyword, resolvedLocation, domain, gl, hl, mode],
  );

  const locationCountry = useMemo(() => {
    const tail = resolvedLocation.split(",").pop()?.trim().toLowerCase();
    if (!tail) return undefined;
    return COUNTRIES.find((c) => c.name.toLowerCase() === tail);
  }, [resolvedLocation]);

  const localeMismatch =
    locationCountry && (locationCountry.gl !== gl || locationCountry.domain !== domain);

  const ready = keyword.trim().length > 0 && resolvedLocation.length > 0;
  const datasetStatus = index.status;

  const applyCountry = useCallback((country: Country, withCapital = true) => {
    setGl(country.gl);
    setHl(country.hl);
    setDomain(country.domain);
    if (withCapital) {
      setLocation(country.capital);
      setLocationQuery("");
      setSuggestOpen(false);
    }
  }, []);

  const applyLocation = useCallback((canonical: string, countryCode?: string) => {
    setLocation(canonical);
    setLocationQuery("");
    setSuggestOpen(false);
    const country = countryByCode(countryCode);
    if (country) {
      setGl(country.gl);
      setHl(country.hl);
      setDomain(country.domain);
    }
  }, []);

  const copy = useCallback(async (value: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      window.setTimeout(() => setCopied((current) => (current === tag ? null : current)), 1600);
    } catch {
      setCopied(null);
    }
  }, []);

  const recordHistory = useCallback(() => {
    setHistory((current) =>
      addHistory(current, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        keyword: keyword.trim(),
        location: resolvedLocation,
        domain,
        gl,
        hl,
        mode,
        at: Date.now(),
      }),
    );
  }, [keyword, resolvedLocation, domain, gl, hl, mode]);

  const runSearch = useCallback(() => {
    if (!ready) return;
    recordHistory();
    if (privateMode) {
      // A page cannot open a private window, so hand the URL over instead.
      void navigator.clipboard.writeText(built.url).catch(() => {});
      setHandoffReady(true);
      return;
    }
    window.open(built.url, "_blank", "noopener,noreferrer");
  }, [ready, privateMode, built.url, recordHistory]);

  // Any change to the query invalidates a pending handoff.
  useEffect(() => {
    setHandoffReady(false);
  }, [built.url, privateMode]);

  return (
    <div className="space-y-8">
      <div className="border border-line bg-paper-raised p-5 sm:p-8">
        {/* keyword */}
        <StepLabel n="01" htmlFor="keyword">
          Keyword
        </StepLabel>
        <input
          id="keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") runSearch();
          }}
          placeholder="project management software"
          className="mt-2 w-full border border-ink/25 bg-white px-4 py-3 font-display text-xl font-bold tracking-tight outline-none placeholder:font-body placeholder:text-base placeholder:font-normal placeholder:text-muted/50 focus:border-ink focus-visible:outline-none sm:text-2xl"
        />

        {/* EU quick pick, the part Google actually honours */}
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <StepLabel n="02">Country</StepLabel>
            <span className="label text-muted/70">sets gl, its language, its domain</span>
          </div>
          <div className="mt-2 space-y-2">
            <CountryRow
              countries={EU_COUNTRIES}
              activeGl={gl}
              onPick={applyCountry}
              caption="EU 27"
            />
            <CountryRow
              countries={COUNTRIES.filter((c) => !c.eu)}
              activeGl={gl}
              onPick={applyCountry}
              caption="Rest"
            />
          </div>
        </div>

        {/* location */}
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <StepLabel n="03" htmlFor="location">
              City (uule), optional
            </StepLabel>
            <span className="label text-muted/70">
              {datasetStatus.ready
                ? `${(datasetStatus.eu + datasetStatus.world).toLocaleString("en-US")} locations`
                : "loading list"}
            </span>
          </div>

          <div ref={locationBoxRef} className="relative mt-2">
            <input
              id="location"
              value={suggestOpen ? locationQuery : location}
              onChange={(event) => {
                setLocationQuery(event.target.value);
                setLocation(event.target.value);
                setSuggestOpen(true);
                setActiveSuggestion(0);
              }}
              onFocus={(event) => {
                setLocationQuery(event.target.value);
                setSuggestOpen(true);
              }}
              onKeyDown={(event) => {
                if (!suggestions.length) {
                  if (event.key === "Enter") runSearch();
                  return;
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveSuggestion((i) => (i + 1) % suggestions.length);
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length);
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const picked: Location = suggestions[activeSuggestion];
                  applyLocation(picked.canonical, picked.country);
                } else if (event.key === "Escape") {
                  setSuggestOpen(false);
                }
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder="City,Region,Country"
              className="w-full border border-ink/25 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-ink focus-visible:outline-none"
            />
            {suggestOpen && suggestions.length > 0 && (
              <ul className="absolute z-20 max-h-72 w-full overflow-auto border border-ink bg-paper-raised">
                {suggestions.map((loc, i) => (
                  <li key={loc.canonical}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSuggestion(i)}
                      onClick={() => applyLocation(loc.canonical, loc.country)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-mono text-xs ${
                        i === activeSuggestion ? "bg-accent" : ""
                      }`}
                    >
                      <span className="truncate">{loc.canonical}</span>
                      <span className="shrink-0 text-muted">{loc.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Only the actionable state gets called out. A "this is fine" badge on
              every canonical pick was pure noise. */}
          {datasetStatus.ready && resolvedLocation.length > 0 && !isCanonical && (
            <p className="mt-2 border-l-2 border-accent pl-3 text-sm">
              Not one of Google&apos;s canonical names. It still encodes, but Google may not resolve
              it. Pick from the list to be sure.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {POPULAR.map((p) => {
              const active = resolvedLocation === p.canonical;
              return (
                <button
                  key={p.canonical}
                  type="button"
                  onClick={() => applyLocation(p.canonical, p.country)}
                  className={`text-sm underline decoration-line underline-offset-4 transition hover:decoration-ink ${
                    active ? "decoration-ink font-bold" : "text-muted"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted">
            Tested on 2026-07-25: Google ignored <span className="font-mono text-xs">uule</span> in a
            normal signed-in browser and used the IP address instead. Four different city values
            returned an identical top 10. Treat the city as best effort in the browser, and use the
            copied <span className="font-mono text-xs">uule</span> string with a SERP API when you
            need city level certainty. Country and language below do change results.
          </p>
        </div>

        {/* domain, language, mode */}
        <div className="mt-8">
          <StepLabel n="04">Fine tune</StepLabel>
        </div>
        <div className="mt-2 grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="domain" className="label block text-muted">
              Domain
            </label>
            <Select
              id="domain"
              value={domain}
              onChange={(value) => {
                setDomain(value);
                const match = COUNTRIES.find((c) => c.domain === value);
                if (match) setGl(match.gl);
              }}
              options={GOOGLE_DOMAINS.map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div>
            <label htmlFor="hl" className="label block text-muted">
              Language (hl)
            </label>
            <Select
              id="hl"
              value={hl}
              onChange={setHl}
              options={HOST_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            />
          </div>
          <div>
            <span className="label block text-muted">Results</span>
            <div className="mt-2 flex">
              {(
                [
                  { value: "organic", label: "Organic" },
                  { value: "local", label: "Google Maps" },
                ] as const
              ).map((option, i) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={`flex-1 border border-ink/25 px-1.5 py-2.5 font-mono text-[10px] whitespace-nowrap transition ${
                    i === 1 ? "border-l-0" : ""
                  } ${
                    mode === option.value
                      ? "border-ink bg-accent font-semibold text-ink"
                      : "bg-white text-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {localeMismatch && locationCountry && (
          <button
            type="button"
            onClick={() => applyCountry(locationCountry, false)}
            className="mt-6 w-full border border-ink bg-accent px-4 py-3 text-left text-sm"
          >
            This location is in {locationCountry.name}, but you are searching {domain} in {hl}. Click
            to switch to {locationCountry.domain} and {locationCountry.hl}.
          </button>
        )}

        {/* private window handoff */}
        <div className="mt-6 border border-ink/15 bg-paper-inset/60 p-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={privateMode}
              onChange={(event) => setPrivateMode(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--ink)]"
            />
            <span>
              <span className="label">
                Use {withArticle(hint?.modeName ?? "private window")}
              </span>
              <span className="mt-1 block text-sm text-muted">
                A page cannot open one for you, browsers block that on purpose. Switch this on and the
                button copies the URL and shows you the shortcut instead. It clears cookies and your
                signed in state, but not your IP address.
              </span>
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={runSearch}
          disabled={!ready}
          className="label mt-4 w-full border border-ink bg-accent px-4 py-4 transition hover:bg-ink hover:text-accent disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-muted"
        >
          {privateMode ? "Copy url for a private window" : "Open simulated google search →"}
        </button>

        {privateMode && handoffReady && hint && (
          <div className="mt-3 border border-ink bg-accent p-4">
            <p className="label">URL copied</p>
            <ol className="mt-2 space-y-1 text-sm">
              <li>
                1. Press{" "}
                <kbd className="border border-ink/40 bg-white px-1.5 py-0.5 font-mono text-xs">
                  {hint.shortcut}
                </kbd>{" "}
                to open {withArticle(hint.modeName)} in {hint.browser}.
              </li>
              <li>2. Paste and press Enter.</li>
            </ol>
            <p className="mt-2 text-xs text-ink/70">
              On {hint.otherPlatform} it is{" "}
              <kbd className="border border-ink/30 bg-white/60 px-1 py-0.5 font-mono text-[10px]">
                {hint.otherShortcut}
              </kbd>
              .
            </p>
          </div>
        )}

        {/* generated parameters */}
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="label text-muted">Generated URL</span>
            <span className="label text-muted/70">pws=0, personalization off</span>
          </div>
          <p className="mt-2 max-h-24 overflow-auto bg-paper-inset p-3 font-mono text-[11px] leading-relaxed break-all">
            {built.url}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <button
              type="button"
              onClick={() => copy(built.url, "url")}
              className="label text-muted underline decoration-line underline-offset-4 hover:text-ink"
            >
              {copied === "url" ? "copied" : "copy url"}
            </button>
            <button
              type="button"
              onClick={() => copy(built.uule, "uule")}
              className="label text-muted underline decoration-line underline-offset-4 hover:text-ink"
            >
              {copied === "uule" ? "copied" : "copy uule"}
            </button>
          </div>
        </div>
      </div>

      {/* history */}
      {history.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-2 border-b border-line pb-2">
            <span className="label text-muted">History, this browser only</span>
            <button
              type="button"
              onClick={() => setHistory(clearHistory())}
              className="label text-muted underline decoration-line underline-offset-4 hover:text-ink"
            >
              Clear
            </button>
          </div>
          <ul>
            {history.map((entry) => (
              <li
                key={entry.id}
                className="group flex items-baseline justify-between gap-4 border-b border-line/60 py-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setKeyword(entry.keyword);
                    setLocation(entry.location);
                    setDomain(entry.domain);
                    setGl(entry.gl);
                    setHl(entry.hl);
                    setMode(entry.mode);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="mr-2">{entry.keyword}</span>
                  <span className="font-mono text-xs text-muted">
                    {entry.location} · {entry.domain} · {entry.hl}
                    {entry.mode === "local" ? " · local" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => setHistory((current) => removeHistory(current, entry.id))}
                  className="label shrink-0 text-muted opacity-0 transition group-hover:opacity-100 hover:text-ink"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StepLabel({
  n,
  htmlFor,
  children,
}: {
  n: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <span className="mr-2 bg-ink px-1.5 py-0.5 text-paper">{n}</span>
      {children}
    </>
  );
  return htmlFor ? (
    <label htmlFor={htmlFor} className="label block text-muted">
      {content}
    </label>
  ) : (
    <span className="label block text-muted">{content}</span>
  );
}

function CountryRow({
  countries,
  activeGl,
  onPick,
  caption,
}: {
  countries: Country[];
  activeGl: string;
  onPick: (country: Country) => void;
  caption: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="label mt-1.5 w-12 shrink-0 text-muted/60">{caption}</span>
      <div className="flex flex-wrap gap-1">
        {countries.map((country) => {
          const active = activeGl === country.gl;
          return (
            <button
              key={country.code}
              type="button"
              title={`${country.name}: ${country.domain}, hl=${country.hl}`}
              onClick={() => onPick(country)}
              className={`flex items-center gap-1 border px-1.5 py-1 font-mono text-xs transition ${
                active
                  ? "border-ink bg-accent font-semibold text-ink"
                  : "border-transparent text-muted hover:border-ink/25 hover:text-ink"
              }`}
            >
              <span aria-hidden className="text-sm leading-none">
                {country.flag}
              </span>
              {country.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full appearance-none border border-ink/25 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-ink focus-visible:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
