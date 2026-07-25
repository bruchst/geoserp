/**
 * Country -> search-locale mapping.
 *
 * Picking a country sets three things at once, which is what makes a SERP
 * look the way a local actually sees it:
 *   gl      - geolocation country code
 *   hl      - interface/host language, defaulted to the country's own
 *             primary official language (not English)
 *   domain  - the local google.<tld>
 *
 * All 27 EU member states are covered (`eu: true`) with a verified capital
 * canonical name from the Google Ads geotargets dataset, so an EU country
 * can be picked and searched in one click.
 */

export type Country = {
  code: string;
  name: string;
  flag: string;
  /** gl parameter (lowercase ISO 3166-1 alpha-2, matching Google's usage) */
  gl: string;
  /** hl parameter: the country's primary official language */
  hl: string;
  /** local Google domain, without protocol */
  domain: string;
  /** canonical name of the capital, verified present in the geotargets data */
  capital: string;
  eu: boolean;
};

export const COUNTRIES: Country[] = [
  // --- EU 27 -------------------------------------------------------------
  { code: "AT", name: "Austria", flag: "🇦🇹", gl: "at", hl: "de", domain: "google.at", capital: "Vienna,Vienna,Austria", eu: true },
  { code: "BE", name: "Belgium", flag: "🇧🇪", gl: "be", hl: "nl", domain: "google.be", capital: "Brussels,Brussels,Belgium", eu: true },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", gl: "bg", hl: "bg", domain: "google.bg", capital: "Sofia,Sofia City Province,Bulgaria", eu: true },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", gl: "cy", hl: "el", domain: "google.com.cy", capital: "Nicosia,Nicosia,Cyprus", eu: true },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", gl: "cz", hl: "cs", domain: "google.cz", capital: "Prague,Prague,Czechia", eu: true },
  { code: "DE", name: "Germany", flag: "🇩🇪", gl: "de", hl: "de", domain: "google.de", capital: "Berlin,Berlin,Germany", eu: true },
  { code: "DK", name: "Denmark", flag: "🇩🇰", gl: "dk", hl: "da", domain: "google.dk", capital: "Copenhagen,Capital Region of Denmark,Denmark", eu: true },
  { code: "EE", name: "Estonia", flag: "🇪🇪", gl: "ee", hl: "et", domain: "google.ee", capital: "Tallinn,Harju County,Estonia", eu: true },
  { code: "ES", name: "Spain", flag: "🇪🇸", gl: "es", hl: "es", domain: "google.es", capital: "Madrid,Community of Madrid,Spain", eu: true },
  { code: "FI", name: "Finland", flag: "🇫🇮", gl: "fi", hl: "fi", domain: "google.fi", capital: "Helsinki,Helsinki,Uusimaa,Finland", eu: true },
  { code: "FR", name: "France", flag: "🇫🇷", gl: "fr", hl: "fr", domain: "google.fr", capital: "Paris,Paris,Ile-de-France,France", eu: true },
  { code: "GR", name: "Greece", flag: "🇬🇷", gl: "gr", hl: "el", domain: "google.gr", capital: "Athens,Athens,Attica,Greece", eu: true },
  { code: "HR", name: "Croatia", flag: "🇭🇷", gl: "hr", hl: "hr", domain: "google.hr", capital: "Zagreb,City of Zagreb,Croatia", eu: true },
  { code: "HU", name: "Hungary", flag: "🇭🇺", gl: "hu", hl: "hu", domain: "google.hu", capital: "Budapest,Budapest,Hungary", eu: true },
  { code: "IE", name: "Ireland", flag: "🇮🇪", gl: "ie", hl: "en", domain: "google.ie", capital: "Dublin,County Dublin,Ireland", eu: true },
  { code: "IT", name: "Italy", flag: "🇮🇹", gl: "it", hl: "it", domain: "google.it", capital: "Rome,Lazio,Italy", eu: true },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", gl: "lt", hl: "lt", domain: "google.lt", capital: "Vilnius,Vilnius County,Lithuania", eu: true },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", gl: "lu", hl: "fr", domain: "google.lu", capital: "Luxembourg,Luxembourg,Luxembourg", eu: true },
  { code: "LV", name: "Latvia", flag: "🇱🇻", gl: "lv", hl: "lv", domain: "google.lv", capital: "Riga,Riga,Latvia", eu: true },
  { code: "MT", name: "Malta", flag: "🇲🇹", gl: "mt", hl: "mt", domain: "google.com.mt", capital: "Valletta,Malta", eu: true },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", gl: "nl", hl: "nl", domain: "google.nl", capital: "Amsterdam,North Holland,Netherlands", eu: true },
  { code: "PL", name: "Poland", flag: "🇵🇱", gl: "pl", hl: "pl", domain: "google.pl", capital: "Warsaw,Warsaw,Masovian Voivodeship,Poland", eu: true },
  { code: "PT", name: "Portugal", flag: "🇵🇹", gl: "pt", hl: "pt-PT", domain: "google.pt", capital: "Lisbon,Lisbon,Portugal", eu: true },
  { code: "RO", name: "Romania", flag: "🇷🇴", gl: "ro", hl: "ro", domain: "google.ro", capital: "Bucharest,Bucharest,Romania", eu: true },
  { code: "SE", name: "Sweden", flag: "🇸🇪", gl: "se", hl: "sv", domain: "google.se", capital: "Stockholm,Stockholm County,Sweden", eu: true },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", gl: "si", hl: "sl", domain: "google.si", capital: "Ljubljana,Ljubljana,Slovenia", eu: true },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", gl: "sk", hl: "sk", domain: "google.sk", capital: "Bratislava,Bratislava Region,Slovakia", eu: true },

  // --- Rest of the world (most requested markets) ------------------------
  { code: "US", name: "United States", flag: "🇺🇸", gl: "us", hl: "en", domain: "google.com", capital: "Washington,District of Columbia,United States", eu: false },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", gl: "uk", hl: "en", domain: "google.co.uk", capital: "London,England,United Kingdom", eu: false },
  { code: "CA", name: "Canada", flag: "🇨🇦", gl: "ca", hl: "en", domain: "google.ca", capital: "Ottawa,Ontario,Canada", eu: false },
  { code: "AU", name: "Australia", flag: "🇦🇺", gl: "au", hl: "en", domain: "google.com.au", capital: "Canberra,Australian Capital Territory,Australia", eu: false },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", gl: "nz", hl: "en", domain: "google.co.nz", capital: "Wellington,Wellington Region,New Zealand", eu: false },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", gl: "ch", hl: "de", domain: "google.ch", capital: "Bern,Canton of Bern,Switzerland", eu: false },
  { code: "NO", name: "Norway", flag: "🇳🇴", gl: "no", hl: "no", domain: "google.no", capital: "Oslo,Oslo,Norway", eu: false },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", gl: "ua", hl: "uk", domain: "google.com.ua", capital: "Kyiv,Kyiv city,Ukraine", eu: false },
  { code: "RS", name: "Serbia", flag: "🇷🇸", gl: "rs", hl: "sr", domain: "google.rs", capital: "Belgrade,Vojvodina,Serbia", eu: false },
  { code: "TR", name: "Türkiye", flag: "🇹🇷", gl: "tr", hl: "tr", domain: "google.com.tr", capital: "Ankara,Ankara,Turkiye", eu: false },
  { code: "BR", name: "Brazil", flag: "🇧🇷", gl: "br", hl: "pt-BR", domain: "google.com.br", capital: "Brasilia,Federal District,Brazil", eu: false },
  { code: "MX", name: "Mexico", flag: "🇲🇽", gl: "mx", hl: "es", domain: "google.com.mx", capital: "Mexico City,Mexico City,Mexico", eu: false },
  { code: "IN", name: "India", flag: "🇮🇳", gl: "in", hl: "en", domain: "google.co.in", capital: "New Delhi,Delhi,India", eu: false },
  { code: "JP", name: "Japan", flag: "🇯🇵", gl: "jp", hl: "ja", domain: "google.co.jp", capital: "Tokyo,Tokyo,Japan", eu: false },
  { code: "SG", name: "Singapore", flag: "🇸🇬", gl: "sg", hl: "en", domain: "google.com.sg", capital: "Singapore,Singapore", eu: false },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", gl: "ae", hl: "ar", domain: "google.ae", capital: "Dubai,Dubai,United Arab Emirates", eu: false },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", gl: "za", hl: "en", domain: "google.co.za", capital: "Cape Town,Western Cape,South Africa", eu: false },
];

export const EU_COUNTRIES = COUNTRIES.filter((c) => c.eu);

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryByCode(code: string | undefined): Country | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.toUpperCase());
}

/** Every Google domain we offer, for the domain <select>. */
export const GOOGLE_DOMAINS = Array.from(
  new Map(COUNTRIES.map((c) => [c.domain, `${c.domain} (${c.code})`])).entries(),
).sort((a, b) => (a[0] === "google.com" ? -1 : b[0] === "google.com" ? 1 : a[0].localeCompare(b[0])));

/** Languages offered in the hl <select>, deduped from the country table plus extras. */
export const HOST_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English (en)" },
  { code: "cs", label: "Čeština (cs)" },
  { code: "sk", label: "Slovenčina (sk)" },
  { code: "de", label: "Deutsch (de)" },
  { code: "fr", label: "Français (fr)" },
  { code: "es", label: "Español (es)" },
  { code: "it", label: "Italiano (it)" },
  { code: "nl", label: "Nederlands (nl)" },
  { code: "pl", label: "Polski (pl)" },
  { code: "pt-PT", label: "Português (pt-PT)" },
  { code: "pt-BR", label: "Português do Brasil (pt-BR)" },
  { code: "da", label: "Dansk (da)" },
  { code: "sv", label: "Svenska (sv)" },
  { code: "fi", label: "Suomi (fi)" },
  { code: "no", label: "Norsk (no)" },
  { code: "et", label: "Eesti (et)" },
  { code: "lv", label: "Latviešu (lv)" },
  { code: "lt", label: "Lietuvių (lt)" },
  { code: "hu", label: "Magyar (hu)" },
  { code: "ro", label: "Română (ro)" },
  { code: "bg", label: "Български (bg)" },
  { code: "el", label: "Ελληνικά (el)" },
  { code: "hr", label: "Hrvatski (hr)" },
  { code: "sl", label: "Slovenščina (sl)" },
  { code: "mt", label: "Malti (mt)" },
  { code: "sr", label: "Srpski (sr)" },
  { code: "uk", label: "Українська (uk)" },
  { code: "tr", label: "Türkçe (tr)" },
  { code: "ru", label: "Русский (ru)" },
  { code: "ar", label: "العربية (ar)" },
  { code: "ja", label: "日本語 (ja)" },
  { code: "zh-CN", label: "中文 (zh-CN)" },
];
