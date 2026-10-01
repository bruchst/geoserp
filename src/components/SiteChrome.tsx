import Link from "next/link";
import stats from "@/lib/locations-stats.json";

/**
 * Masthead and footer shared by every page. The nav is plain links in the
 * server-rendered HTML, so crawlers reach every page from every other page.
 */

const NAV = [
  { href: "/", label: "SERP by country" },
  { href: "/german-serp-tracking", label: "German SERP tracking" },
];

export function SiteHeader({ current }: { current: string }) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
          GEOSERP<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === current ? "page" : undefined}
              className={`label underline-offset-4 hover:underline ${
                item.href === current ? "text-ink underline decoration-accent decoration-2" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-4 border-t border-line" />
    </header>
  );
}

export function SiteFooter() {
  const version = stats.source.replace("geotargets-", "").replace(".csv", "");
  return (
    <footer className="mt-12 border-t border-line pt-6">
      <p className="text-sm text-muted">
        GeoSERP builds Google search URLs in your browser. It does not scrape Google, store your
        queries, or use a paid SERP API. Locations from the Google Ads geotargets dataset, version{" "}
        {version}.
      </p>
      <p className="label mt-4 flex flex-wrap gap-x-5 gap-y-1 text-muted">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            {item.label}
          </Link>
        ))}
        <a
          href="https://sbruch.com"
          className="underline decoration-line underline-offset-4 hover:decoration-ink"
        >
          sbruch.com
        </a>
      </p>
    </footer>
  );
}
