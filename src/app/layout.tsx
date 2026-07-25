import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono, Libre_Caslon_Text } from "next/font/google";
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

const title = "GeoSERP: check Google rankings from any city";
const description =
  "Free tool that shows unpersonalized Google results from any city, in that country's own language. All 27 EU member states. No VPN, no extension, runs entirely in your browser.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "GeoSERP",
  keywords: [
    "google location changer",
    "local serp checker",
    "uule generator",
    "check rankings from another city",
    "geo targeted google search",
  ],
  openGraph: { title, description, type: "website", siteName: "GeoSERP" },
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
