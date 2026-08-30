import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono, Libre_Caslon_Text } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Search title targets "serp by country keyword" (US 100/mo, KD 9,
// source: Ahrefs Keywords Explorer, 2026-08-30) and carries the brand so
// Google has a title signal for the site name. The narrative line stays on
// Open Graph, where it reads better than a keyword-led title.
const title = "Check SERP by Country for Any Keyword | GeoSERP";
const socialTitle = "GeoSERP: see Google the way another country sees it";
const description =
  "See the SERP by country for any keyword: unpersonalized Google results on that country's own domain, in its own language. All 27 EU member states, plus a uule generator for SERP APIs. No VPN, no extension, runs in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "GeoSERP",
  // Self-referencing canonical: the app also answers on geoserp.vercel.app,
  // and the sbruch.com footer link carries a ?ref= param.
  alternates: { canonical: "./" },
  keywords: [
    "serp by country keyword",
    "google location changer",
    "international serp checker",
    "uule generator",
    "check rankings in another country",
    "geo targeted google search",
    "gl hl parameters",
  ],
  openGraph: {
    title: socialTitle,
    description,
    type: "website",
    siteName: "GeoSERP",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: socialTitle, description },
  robots: { index: true, follow: true },
};

// Google picks the SERP site name from WebSite structured data, og:site_name
// and the home page title. Without it the subdomain inherits "Stanislav Bruch"
// from sbruch.com, so name the site explicitly on every page.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "GeoSERP",
  alternateName: "GeoSERP: SERP by country",
  url: `${SITE_URL}/`,
  description,
  inLanguage: "en",
  publisher: {
    "@type": "Person",
    name: "Stanislav Bruch",
    url: "https://sbruch.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${caslon.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
