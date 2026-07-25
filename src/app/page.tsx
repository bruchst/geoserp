import BeforeAfter from "@/components/BeforeAfter";
import Simulator from "@/components/Simulator";
import { EU_COUNTRIES } from "@/lib/countries";
import stats from "@/lib/locations-stats.json";

const FAQ = [
  {
    q: "Why is incognito mode not enough?",
    a: "Incognito drops your cookies and sign-in state, so it removes history based personalization. It does not change your IP address, and location is the stronger signal of the two. Google still assumes you are searching from wherever your connection is.",
  },
  {
    q: "Can the tool open the search in a private window for me?",
    a: "No, and neither can any other website. There is no web API for opening an incognito or private window, and browsers block it deliberately: if a page could decide it runs in private mode, the mode would be meaningless. Only a browser extension can do it. Switch on the private window option and the button copies the URL and shows the exact shortcut for your browser instead, which makes it two steps rather than one. Worth knowing what it buys you: it clears cookies and your signed in state, but it does not change your IP address, and the IP is what Google reported as the source of the location in our tests.",
  },
  {
    q: "Why is a VPN not enough either?",
    a: "A VPN moves you to the exit node's city, usually a datacenter in a capital, not the town your customer lives in. The uule parameter targets a named place directly, so you can compare Brno against Ostrava without touching your connection.",
  },
  {
    q: "Are these the real results?",
    a: "Yes. This tool only builds the URL and opens it in your own browser, so what you see is a live Google SERP. It is not a screenshot, a cache, or a scraped copy through somebody's proxy.",
  },
  {
    q: "Does the city level uule actually work?",
    a: "Not in a normal browser, as of a test on 2026-07-25. Searching the same query on google.cz from a Prague IP with uule values for Brno, Ostrava and Pilsen returned an identical top 10, and Google's own footer said the location came from the IP address. Both uule forms behaved the same, the named city form and the coordinate form. Country level targeting through gl, hl and the local domain does change results, clearly and repeatably. If you need city level certainty, copy the uule string and pass it to a SERP API, where requests carry no browser location state.",
  },
  {
    q: "How do I check what location Google used?",
    a: "Scroll to the bottom of the results page. Google prints the location it applied and whether it came from your IP address. If it names your own city while you asked for another one, the location was not applied. That footer line is the only reliable check, in this tool or any other.",
  },
  {
    q: "Does anything get stored or sent anywhere?",
    a: "No. Every calculation happens in your browser and history lives in localStorage on your machine. There is no database, no account, no analytics on your queries.",
  },
  {
    q: "Can I check mobile rankings?",
    a: "Mobile SERPs are served based on the user agent, which a URL parameter cannot change. Any tool offering a device switch through the URL alone is showing you desktop results with a mobile label. Open the search, then turn on device emulation in your browser's developer tools.",
  },
];

export default function Home() {
  const version = stats.source.replace("geotargets-", "").replace(".csv", "");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {/* masthead */}
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-display text-2xl font-extrabold tracking-tight">
            GEOSERP<span className="text-accent">.</span>
          </p>
          <p className="label text-muted">Local SERP checker by sbruch.com</p>
        </div>
        <div className="mt-4 border-t border-line" />
      </header>

      {/* hero: pitch left, tool right, both above the fold */}
      <section className="grid items-start gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="lg:sticky lg:top-8">
          <h1 className="font-display text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl">
            See Google the way another country sees it.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Pick a keyword and a country. You get an unpersonalized Google SERP on that
            country&apos;s own domain, in its own language. All {EU_COUNTRIES.length} EU member
            states, no VPN, no extension, no account.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              `All ${EU_COUNTRIES.length} EU member states, each in its own language`,
              `${stats.total.toLocaleString("en-US")} cities from Google's own location list`,
              "Personalization off, so you see the ranking, not your history",
              "Runs in your browser. No account, no database, no tracking",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="text-accent">
                  ▸
                </span>
                <span className="text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Simulator />
      </section>

      {/* before / after */}
      <section className="mt-8 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Same keyword, different country, different winners
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          One query, <span className="font-mono text-sm">project management software</span>, measured
          on 2026-07-25 from the same machine one minute apart.
        </p>
        <div className="mt-6">
          <BeforeAfter />
        </div>
      </section>

      {/* how it works */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-5 grid gap-6 sm:grid-cols-3">
          {[
            [
              "Keyword and country",
              "Choosing a country sets its local domain, its gl code and its own language, so a Poland check runs on google.pl in Polish.",
            ],
            [
              "City, if you need the uule",
              "Pick a city from Google's own canonical list. The uule string is built for you to copy into a SERP API, where city targeting is honoured.",
            ],
            [
              "Open and verify",
              "The URL goes to Google in a new tab. Check the footer line at the bottom to see which location Google actually applied.",
            ],
          ].map(([title, body], i) => (
            <li key={title}>
              <p className="label text-muted">{`0${i + 1}`}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* faq */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">Questions</h2>
        <div className="mt-4">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-line py-3">
              <summary className="cursor-pointer list-none font-bold marker:content-none">
                <span className="mr-2 inline-block text-accent transition group-open:rotate-90">
                  ▸
                </span>
                {item.q}
              </summary>
              <p className="mt-2 pl-6 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-line pt-6">
        <p className="text-sm text-muted">
          GeoSERP builds Google search URLs in your browser. It does not scrape Google, store your
          queries, or use a paid SERP API. Locations from the Google Ads geotargets dataset, version{" "}
          {version}.
        </p>
        <p className="label mt-4 text-muted">
          <a
            href="https://sbruch.com"
            className="underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            sbruch.com
          </a>
        </p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </div>
  );
}
