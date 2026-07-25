/**
 * Which country the visitor is probably sitting in.
 *
 * This matters because of how Google resolves location, measured 2026-07-25:
 * the country comes from `gl`, but the city inside that country comes from the
 * IP, and Google only applies the IP city when the IP is in the country being
 * searched. Search your own country and you always get your own city mixed in
 * (footer: "Holešovice, Praha 7 - from your IP address"). Search a foreign one
 * and the footer reads "Unknown", which is actually cleaner: national results
 * with no city bias.
 *
 * So the UI needs to know whether the selected country is the visitor's own.
 * The time zone is the cheapest honest signal for that: no permission prompt,
 * no network request, nothing sent anywhere. It is a guess, not a lookup, so it
 * only ever drives a warning, never the search itself.
 */

const ZONE_TO_COUNTRY: Record<string, string> = {
  // EU 27
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "Europe/Sofia": "BG",
  "Asia/Nicosia": "CY",
  "Asia/Famagusta": "CY",
  "Europe/Prague": "CZ",
  "Europe/Berlin": "DE",
  "Europe/Busingen": "DE",
  "Europe/Copenhagen": "DK",
  "Europe/Tallinn": "EE",
  "Europe/Madrid": "ES",
  "Africa/Ceuta": "ES",
  "Atlantic/Canary": "ES",
  "Europe/Helsinki": "FI",
  "Europe/Paris": "FR",
  "Europe/Athens": "GR",
  "Europe/Zagreb": "HR",
  "Europe/Budapest": "HU",
  "Europe/Dublin": "IE",
  "Europe/Rome": "IT",
  "Europe/Vilnius": "LT",
  "Europe/Luxembourg": "LU",
  "Europe/Riga": "LV",
  "Europe/Malta": "MT",
  "Europe/Amsterdam": "NL",
  "Europe/Warsaw": "PL",
  "Europe/Lisbon": "PT",
  "Atlantic/Madeira": "PT",
  "Atlantic/Azores": "PT",
  "Europe/Bucharest": "RO",
  "Europe/Stockholm": "SE",
  "Europe/Ljubljana": "SI",
  "Europe/Bratislava": "SK",

  // Rest of the countries the tool offers
  "Europe/London": "GB",
  "Europe/Zurich": "CH",
  "Europe/Oslo": "NO",
  "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA",
  "Europe/Belgrade": "RS",
  "Europe/Istanbul": "TR",
  "America/New_York": "US",
  "America/Detroit": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/St_Johns": "CA",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Australia/Hobart": "AU",
  "Australia/Darwin": "AU",
  "Pacific/Auckland": "NZ",
  "America/Sao_Paulo": "BR",
  "America/Bahia": "BR",
  "America/Fortaleza": "BR",
  "America/Recife": "BR",
  "America/Manaus": "BR",
  "America/Mexico_City": "MX",
  "America/Tijuana": "MX",
  "America/Monterrey": "MX",
  "America/Cancun": "MX",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Tokyo": "JP",
  "Asia/Singapore": "SG",
  "Asia/Dubai": "AE",
  "Africa/Johannesburg": "ZA",
};

/** Returns an ISO country code, or undefined when the zone is not one we map. */
export function countryFromTimeZone(timeZone: string | undefined): string | undefined {
  if (!timeZone) return undefined;
  return ZONE_TO_COUNTRY[timeZone];
}

export function detectHomeCountry(): string | undefined {
  try {
    return countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return undefined;
  }
}
