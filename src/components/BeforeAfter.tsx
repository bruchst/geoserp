/**
 * Illustration of the value: the same keyword at your desk versus in your target
 * market.
 *
 * Domains and their order come from a real measurement (2026-07-25, same
 * machine, same minute). Page titles and snippets are deliberately not
 * reproduced: the point is which domains rank, and inventing Google's copy would
 * make this a fake screenshot rather than an illustration.
 */

type Result = { host: string; unique?: boolean };

const PANELS: {
  tag: string;
  heading: string;
  flag: string;
  url: string;
  results: Result[];
}[] = [
  {
    tag: "Before",
    heading: "What you see at your desk",
    flag: "🇨🇿",
    url: "google.cz/search?q=project+management+software",
    results: [
      { host: "icagile.com" },
      { host: "project-management.com" },
      { host: "wrike.com" },
      { host: "microsoft.com" },
      { host: "asana.com" },
    ],
  },
  {
    tag: "After",
    heading: "What your German market sees",
    flag: "🇩🇪",
    url: "google.de/search?…&gl=de&hl=de&pws=0",
    results: [
      { host: "projektmagazin.de", unique: true },
      { host: "openproject.org", unique: true },
      { host: "asana.com" },
      { host: "fuer-gruender.de", unique: true },
      { host: "atlassian.com", unique: true },
    ],
  },
];

export default function BeforeAfter() {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        {PANELS.map((panel) => (
          <figure key={panel.tag} className="m-0">
            <figcaption className="mb-2 flex flex-wrap items-baseline gap-x-2">
              <span
                className={`label px-1.5 py-0.5 ${
                  panel.tag === "After" ? "bg-accent text-ink" : "bg-ink text-paper"
                }`}
              >
                {panel.tag}
              </span>
              <span aria-hidden className="text-base leading-none">
                {panel.flag}
              </span>
              <span className="font-display text-base font-bold">{panel.heading}</span>
            </figcaption>

            <div className="border border-ink/20 bg-white">
              {/* browser chrome */}
              <div className="flex items-center gap-2 border-b border-ink/10 bg-[#f4f4f5] px-3 py-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="block h-2 w-2 rounded-full bg-[#d4d4d8]" />
                  <span className="block h-2 w-2 rounded-full bg-[#d4d4d8]" />
                  <span className="block h-2 w-2 rounded-full bg-[#d4d4d8]" />
                </span>
                <span className="min-w-0 flex-1 truncate rounded-sm bg-white px-2 py-1 font-mono text-[10px] text-[#52525b]">
                  {panel.url}
                </span>
              </div>

              {/* results */}
              <ol className="divide-y divide-ink/5">
                {panel.results.map((result, i) => (
                  <li key={result.host} className="flex gap-3 px-3.5 py-3">
                    <span className="mt-0.5 w-3 shrink-0 font-mono text-[10px] text-[#a1a1aa]">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] text-[#3f6212]">
                        {result.host}
                      </span>
                      <span
                        className={`mt-1 block h-3 rounded-sm ${
                          result.unique ? "bg-accent" : "bg-[#dbeafe]"
                        }`}
                        style={{ width: `${58 + ((i * 13) % 34)}%` }}
                        aria-hidden
                      />
                      <span className="mt-1.5 block h-1.5 w-full rounded-sm bg-[#f1f1f3]" aria-hidden />
                      <span
                        className="mt-1 block h-1.5 rounded-sm bg-[#f1f1f3]"
                        style={{ width: `${64 + ((i * 9) % 26)}%` }}
                        aria-hidden
                      />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </figure>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        Four of the five German results never appear at your desk, highlighted in yellow. Two of them,
        projektmagazin.de and fuer-gruender.de, are German publishers you would never find by
        searching from Prague. Illustration: the domains and their order are from a real measurement
        on 2026-07-25, titles and snippets are not reproduced.
      </p>
    </div>
  );
}
