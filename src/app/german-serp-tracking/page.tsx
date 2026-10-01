import type { Metadata } from "next";
import Link from "next/link";
import BeforeAfter from "@/components/BeforeAfter";
import Simulator from "@/components/Simulator";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_URL } from "@/lib/site";

// Targets "german serp tracking" (US 700/mo, global 1,300, KD 17; source:
// Ahrefs Keywords Explorer, 2026-10-01). The #3 result had 0 referring
// domains, so an exact-match page can rank without links.
// Plan: CoS/docs/plans/2026-10-01-16-36-PER_GeoSerp-german-serp-tracking.md
const PATH = "/german-serp-tracking";
const PAGE_URL = `${SITE_URL}${PATH}`;
const title = "Free German SERP Tracking Tool: Check google.de Rankings | GeoSERP";
const description =
  "German SERP tracking without a VPN: open the unpersonalized google.de result page in German, save keywords to a watchlist and re-check the same SERP in one click. Free, no account.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
  keywords: [
    "german serp tracking",
    "german serp checker",
    "google.de rank check",
    "check google rankings in germany",
    "dach serp tracking",
  ],
  openGraph: {
    title: "German SERP tracking: see google.de the way Germany sees it",
    description,
    type: "website",
    siteName: "GeoSERP",
    url: PAGE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "German SERP tracking: see google.de the way Germany sees it",
    description,
  },
};

const FAQ = [
  {
    q: "Is GeoSERP a German rank tracker?",
    a: "It is a German SERP checker with a watchlist, not an automated rank tracker. It opens the live google.de result page for searchers in Germany and remembers which keywords you watch and when you last checked them. It does not fetch Google on a schedule or record positions for you, because it has no server. If you need daily positions for hundreds of keywords, use a rank tracker built on a SERP API.",
  },
  {
    q: "Do I need a German IP address or a VPN?",
    a: "Not for country level results. The country comes from the gl parameter, and in our tests on 2026-07-25 setting gl, hl and the local Google domain changed the results clearly and repeatably, with no VPN. A VPN would also move you to the exit node's city, usually a datacenter, which adds a city bias you did not ask for.",
  },
  {
    q: "Can I track rankings for Berlin or Munich specifically?",
    a: "Not reliably in a normal browser. Our test ran on google.cz, not google.de: on 2026-07-25 we sent uule values for Brno, Ostrava and Pilsen from one Prague connection and got an identical top 10, while Google's footer said the location came from the IP address. We have not repeated it with German cities, but the mechanism is the same, so do not trust a Berlin vs Munich comparison made in a browser. For city level German tracking, copy the uule string from the tool and pass it to a SERP API, where requests carry no browser location.",
  },
  {
    q: "What is the difference between google.de and google.com with gl=de?",
    a: "GeoSERP always sets both, the google.de domain and gl=de, plus hl=de for German. That combination is what we measured changing the results. We have not measured the domain and gl separately, so we do not claim that either one alone is enough.",
  },
  {
    q: "Should I track Austria and Switzerland separately?",
    a: "Yes. They share the language with Germany but not the country signal: Austria runs on google.at with gl=at, Switzerland on google.ch with gl=ch. GeoSERP sets hl=de for both, so one keyword list can be checked across all three markets by switching the country, and each combination gets its own watchlist entry.",
  },
  {
    q: "How do I know Google really applied Germany?",
    a: "Scroll to the bottom of the result page. Google prints the location it used and whether it came from your IP address. Searching a country you are not in, our tests showed the location as unknown, which is the clean case: national results without a city bias. If the footer names your own city, the country was not applied.",
  },
  {
    q: "Where is my watchlist stored?",
    a: "In localStorage in your browser, nowhere else. There is no account and no database, so the list stays on this device and clearing site data deletes it.",
  },
  {
    q: "Can I track German mobile rankings?",
    a: "Not through a URL. Google serves mobile results based on the user agent, which no URL parameter can change. Open the search, then switch on device emulation in your browser's developer tools.",
  },
];

const CAN = [
  ["Results for searchers in Germany", "Yes", "google.de, gl=de"],
  ["German interface and snippets", "Yes", "hl=de"],
  ["Personalization off", "Yes", "pws=0, so your history does not reorder results"],
  ["Austria and Switzerland as separate markets", "Yes", "google.at and google.ch, both in German"],
  ["Re-check the same SERP over time", "Yes", "watchlist with last checked date, flagged after 7 days"],
  ["Local pack and Maps results", "Yes", "tbm=lcl"],
  ["City level, Berlin vs Munich", "No", "in a browser Google took the city from the IP. Measured on google.cz 2026-07-25, not yet on google.de"],
  ["Automatic daily positions", "No", "needs a server and a SERP API, which GeoSERP does not use"],
  ["Mobile SERP", "No", "set by the user agent, not by the URL"],
] as const;

const STEPS = [
  [
    "Type the keywords Germans type",
    "Enter them in German, comma separated, up to the tool's limit. The country is already set to Germany: google.de, gl=de, hl=de.",
  ],
  [
    "Open google.de and note the positions",
    "Each keyword gets its own button, so every search opens as a real link in a new tab. What you see is the live result page, not a cached copy.",
  ],
  [
    "Add them to your watchlist",
    "One click saves the exact keyword and market. Nothing leaves your browser.",
  ],
  [
    "Check again next week",
    "Entries older than 7 days are flagged as due. Check again reopens the identical unpersonalized SERP, so you compare like with like.",
  ],
] as const;

export default function GermanSerpTracking() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GeoSERP German SERP tracking",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web browser)",
    url: PAGE_URL,
    description,
    inLanguage: "en",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "GeoSERP", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "German SERP tracking", item: PAGE_URL },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <SiteHeader current={PATH} />

      <section className="grid items-start gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="lg:sticky lg:top-8">
          <p className="label text-muted">
            <span aria-hidden className="mr-1.5 text-base leading-none">
              🇩🇪
            </span>
            google.de · gl=de · hl=de
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl">
            German SERP tracking, without a VPN.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Free German SERP tracking: see how your keywords rank on google.de for searchers in
            Germany, unpersonalized, in German, on the German domain. Save them to a watchlist and re-check the same SERP next
            week in one click.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Germany preset: google.de, gl=de, hl=de, personalization off",
              "Austria and Switzerland one click away, both in German",
              "Watchlist with last checked date, flagged when a check is due",
              "Runs in your browser. No account, no database, free",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="text-accent">
                  ▸
                </span>
                <span className="text-muted">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-l-2 border-accent pl-4 text-sm">
            <p className="label">What tracking means here</p>
            <p className="mt-2 text-muted">
              GeoSERP never fetches Google itself, so it does not log positions for you. It
              remembers which German SERPs you watch and reopens each one exactly as before, so a
              weekly check takes one click per keyword. For hundreds of keywords with daily
              history, you want a rank tracker on a SERP API instead.
            </p>
          </div>
        </div>

        <Simulator initialCountry="DE" placeholder="projektmanagement software, crm" />
      </section>

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Your own Google is the wrong view of Germany
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          One query, <span className="font-mono text-sm">project management software</span>,
          measured on 2026-07-25 from the same machine one minute apart. Four of the five German
          results do not appear in the Czech top 5 at all. The same check works for every other
          country in the{" "}
          <Link href="/" className="underline decoration-line underline-offset-4 hover:decoration-ink">
            SERP by country checker
          </Link>
          .
        </p>
        <div className="mt-6">
          <BeforeAfter />
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          How to track German rankings with GeoSERP
        </h2>
        <ol className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([heading, body], i) => (
            <li key={heading}>
              <p className="label text-muted">{`0${i + 1}`}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{heading}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          German SERP tracking: what works and what does not
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink">
                <th className="label py-2 pr-4 font-normal text-muted">Check</th>
                <th className="label py-2 pr-4 font-normal text-muted">GeoSERP</th>
                <th className="label py-2 font-normal text-muted">How, or why not</th>
              </tr>
            </thead>
            <tbody>
              {CAN.map(([check, yes, how]) => (
                <tr key={check} className="border-b border-line/60">
                  <td className="py-2.5 pr-4">{check}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`label px-1.5 py-0.5 ${
                        yes === "Yes" ? "bg-accent text-ink" : "bg-ink text-paper"
                      }`}
                    >
                      {yes}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          German SERP tracking: questions
        </h2>
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

      <SiteFooter />

      {[softwareSchema, faqSchema, breadcrumbSchema].map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </div>
  );
}
