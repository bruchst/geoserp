import Simulator from "@/components/Simulator";
import { EU_COUNTRIES } from "@/lib/countries";
import stats from "@/lib/locations-stats.json";

const FAQ = [
  {
    q: "Why is incognito mode not enough?",
    a: "Incognito drops your cookies and sign-in state, so it removes history based personalization. It does not change your IP address, and location is the stronger signal of the two. Google still assumes you are searching from wherever your connection is.",
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
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
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

      {/* intro */}
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
          See Google the way another country sees it.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Pick a keyword and a country. You get an unpersonalized Google SERP on that country&apos;s
          own domain, in its own language. All {EU_COUNTRIES.length} EU member states, no VPN, no
          extension, no account.
        </p>
        <p className="label mt-5 text-muted">
          {EU_COUNTRIES.length}/27 EU · {stats.total.toLocaleString("en-US")} cities for uule · runs in
          your browser
        </p>
        <p className="mt-6 max-w-xl border-l-2 border-accent pl-4 text-sm text-muted">
          <span className="font-bold text-ink">Honest about the city level.</span> Every tool in this
          category promises results from any city through the{" "}
          <span className="font-mono text-xs">uule</span> parameter. Tested on 2026-07-25 in a normal
          signed-in browser, Google ignored it and used the IP address instead: Brno, Ostrava, Pilsen
          and no city at all returned an identical top 10. Country and language do work, and they are
          verifiable. So that is what this tool leads with.
        </p>
      </section>

      <Simulator />

      {/* proof: what the same keyword returns in three countries */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">What this actually changes</h2>
        <p className="mt-2 max-w-2xl text-muted">
          One keyword, <span className="font-mono text-sm">project management software</span>, three
          countries, measured on 2026-07-25 from the same machine. Highlighted hosts appear in that
          country only.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              flag: "🇩🇪",
              country: "Germany",
              params: "google.de · gl=de · hl=de",
              hosts: [
                ["projektmagazin.de", true],
                ["openproject.org", true],
                ["asana.com", false],
                ["fuer-gruender.de", true],
                ["atlassian.com", false],
              ] as [string, boolean][],
            },
            {
              flag: "🇵🇱",
              country: "Poland",
              params: "google.pl · gl=pl · hl=pl",
              hosts: [
                ["icagile.com", false],
                ["project-management.com", false],
                ["flexi-project.com", true],
                ["asana.com", false],
                ["wrike.com", false],
              ] as [string, boolean][],
            },
            {
              flag: "🇺🇸",
              country: "United States",
              params: "google.com · gl=us · hl=en",
              hosts: [
                ["icagile.com", false],
                ["project-management.com", false],
                ["paymoapp.com", true],
                ["microsoft.com", true],
                ["wrike.com", false],
              ] as [string, boolean][],
            },
          ].map((col) => (
            <div key={col.country} className="border border-line bg-paper-raised p-4">
              <p className="font-display text-lg font-bold">
                <span aria-hidden className="mr-1.5">
                  {col.flag}
                </span>
                {col.country}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-wide text-muted">{col.params}</p>
              <ol className="mt-3 space-y-1.5">
                {col.hosts.map(([host, unique], i) => (
                  <li key={host} className="flex gap-2 font-mono text-[11px]">
                    <span className="w-3 shrink-0 text-muted/60">{i + 1}</span>
                    <span className={unique ? "bg-accent px-1 font-semibold" : "text-muted"}>
                      {host}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Three of five results differ between Germany and the United States for the same query. That
          is the gap between what you see at your desk and what your market sees.
        </p>
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

      {/* under the hood */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">Under the hood</h2>
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-muted">Google takes the search location from the URL itself:</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["gl", "country of the search, gl=cz. Works."],
                ["hl", "interface and results language, hl=cs. Works."],
                ["pws=0", "personalization off. Works, Google confirms it in the footer."],
                ["tbm=lcl", "local pack and Maps listings."],
                ["uule", "encoded city. Ignored by the browser, useful for SERP APIs."],
              ].map(([key, description]) => (
                <div key={key} className="flex gap-3">
                  <dt className="w-16 shrink-0 font-mono text-xs">{key}</dt>
                  <dd className="text-muted">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="label text-muted">The uule payload</p>
            <pre className="mt-2 overflow-x-auto bg-paper-inset p-3 font-mono text-[11px] leading-relaxed">
{`uule = "w+" + base64(
  0x08 0x02          role = 2
  0x10 0x20          producer = 32
  0x22 <varint len>
  utf8(canonical name)
)`}
            </pre>
            <p className="mt-3 text-sm text-muted">
              The shortcut copied around the web glues a fixed prefix onto a single length character,
              which only holds up to 63 bytes. Google&apos;s own list goes further: the longest Greek
              municipality name runs 119 bytes, and accented names need the length counted in UTF-8
              bytes. GeoSERP builds the real payload, so those work too.
            </p>
          </div>
        </div>
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
