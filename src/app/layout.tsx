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

const title = "GeoSERP: see Google the way another country sees it";
const description =
  "Free tool that shows unpersonalized Google results on any country's own domain and in its own language. All 27 EU member states, plus a uule generator for SERP APIs. No VPN, no extension, runs in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "GeoSERP",
  // Self-referencing canonical: the app also answers on geoserp.vercel.app,
  // and the sbruch.com footer link carries a ?ref= param.
  alternates: { canonical: "./" },
  keywords: [
    "google location changer",
    "international serp checker",
    "uule generator",
    "check rankings in another country",
    "geo targeted google search",
    "gl hl parameters",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "GeoSERP",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
