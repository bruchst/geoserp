/**
 * Incognito handoff.
 *
 * A page cannot open a private window. There is no web API for it and browsers
 * block it deliberately: a site being able to decide it runs in incognito would
 * defeat the point of the mode. `window.open` has no such flag, and only a
 * browser extension (chrome.windows.create with incognito: true) can do it,
 * which a static site is not.
 *
 * So the honest implementation is a two step handoff: copy the URL, then show
 * the exact shortcut for the browser the visitor is actually using. Detection
 * runs per visitor in their own browser, so a Windows visitor sees the Ctrl
 * shortcut and a Mac visitor sees the Cmd one. Because user agent sniffing can
 * always be wrong, `otherShortcut` carries the opposite platform's shortcut so
 * the UI can show a fallback rather than leaving anyone stuck.
 */

export type IncognitoHint = {
  /** e.g. "Shift + Cmd + N" */
  shortcut: string;
  /** the same browser's shortcut on the other platform family */
  otherShortcut: string;
  /** label for that other platform, e.g. "Windows and Linux" */
  otherPlatform: string;
  /** what that browser calls the mode */
  modeName: string;
  browser: string;
};

type BrowserProfile = { key: string; modeName: string; browser: string };

const PROFILES: { test: RegExp; profile: BrowserProfile }[] = [
  // Order matters: Edge, Opera and Brave all carry "chrome" in the UA.
  { test: /edg\//, profile: { key: "N", modeName: "InPrivate window", browser: "Edge" } },
  { test: /opr\//, profile: { key: "N", modeName: "private window", browser: "Opera" } },
  { test: /firefox\//, profile: { key: "P", modeName: "private window", browser: "Firefox" } },
  { test: /chrome\//, profile: { key: "N", modeName: "incognito window", browser: "Chrome" } },
  { test: /safari\//, profile: { key: "N", modeName: "private window", browser: "Safari" } },
];

const FALLBACK_PROFILE: BrowserProfile = {
  key: "N",
  modeName: "private window",
  browser: "your browser",
};

function build(profile: BrowserProfile, isApple: boolean): IncognitoHint {
  return {
    shortcut: `${isApple ? "Shift + Cmd" : "Ctrl + Shift"} + ${profile.key}`,
    otherShortcut: `${isApple ? "Ctrl + Shift" : "Shift + Cmd"} + ${profile.key}`,
    otherPlatform: isApple ? "Windows and Linux" : "macOS",
    modeName: profile.modeName,
    browser: profile.browser,
  };
}

/**
 * `platformHint` should be `navigator.userAgentData.platform` when available
 * ("macOS", "Windows", "Linux"), since it survives user agent reduction.
 * Falls back to the legacy `navigator.platform` string, then to the UA itself.
 */
export function detectIncognitoHint(
  userAgent: string,
  platformHint: string,
): IncognitoHint {
  const ua = userAgent.toLowerCase();
  const platform = platformHint.toLowerCase();
  const isApple =
    /mac|iphone|ipad|ios/.test(platform) ||
    (platform === "" && /mac os x|iphone|ipad/.test(ua));

  const match = PROFILES.find(({ test }) => test.test(ua));
  return build(match?.profile ?? FALLBACK_PROFILE, isApple);
}

/** "an incognito window" vs "a private window". */
export function withArticle(modeName: string): string {
  return `${/^[aeiou]/i.test(modeName) ? "an" : "a"} ${modeName}`;
}

export function currentIncognitoHint(): IncognitoHint {
  if (typeof navigator === "undefined") {
    return build(FALLBACK_PROFILE, false);
  }
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData;
  const platformHint = uaData?.platform ?? navigator.platform ?? "";
  return detectIncognitoHint(navigator.userAgent, platformHint);
}
