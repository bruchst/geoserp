import { ImageResponse } from "next/og";

export const alt =
  "GeoSERP: see Google the way another country sees it. One keyword, three countries, different results.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f1e6cf";
const INK = "#141211";
const MUTED = "#4a4540";
const ACCENT = "#ffcf33";
const LINE = "#cfc0a0";

const COLUMNS = [
  {
    flag: "DE",
    country: "Germany",
    params: "google.de · hl=de",
    hosts: ["projektmagazin.de", "openproject.org", "asana.com"],
    unique: [true, true, false],
  },
  {
    flag: "PL",
    country: "Poland",
    params: "google.pl · hl=pl",
    hosts: ["project-management.com", "flexi-project.com", "asana.com"],
    unique: [false, true, false],
  },
  {
    flag: "US",
    country: "United States",
    params: "google.com · hl=en",
    hosts: ["project-management.com", "paymoapp.com", "microsoft.com"],
    unique: [false, true, true],
  },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>GEOSERP</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: ACCENT }}>.</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            sbruch.com
          </span>
        </div>

        <div style={{ height: 1, background: LINE, marginTop: 20, marginBottom: 40 }} />

        {/* Satori needs an explicit display on any element with several children */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          <div>See Google the way</div>
          <div>another country sees it.</div>
        </div>

        <div style={{ marginTop: 18, fontSize: 24, color: MUTED }}>
          One keyword, 44 countries, all 27 EU states. Free, no VPN.
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
          {COLUMNS.map((col) => (
            <div
              key={col.country}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${LINE}`,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{col.flag}</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{col.country}</span>
              </div>
              <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>{col.params}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
                {col.hosts.map((host, i) => (
                  <div key={host} style={{ display: "flex", fontSize: 15 }}>
                    <span
                      style={{
                        background: col.unique[i] ? ACCENT : "transparent",
                        color: col.unique[i] ? INK : MUTED,
                        padding: col.unique[i] ? "1px 5px" : "1px 0",
                        fontWeight: col.unique[i] ? 600 : 400,
                      }}
                    >
                      {host}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
