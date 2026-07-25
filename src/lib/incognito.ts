/**
 * Incognito handoff.
 *
 * A page cannot open a private window. There is no web API for it and browsers
 * block it deliberately: a site being able to decide it runs in incognito would
 * defeat the point of the mode. `window.open` has no such flag, and only a
 * browser extension (chrome.windows.create with incognito: true) can do it,
 * which a static site is not.
 *
 * So the honest implementation is a two step handoff: copy the URL, then tell
 * the user the exact shortcut for the browser they are actually using.
 */

export type IncognitoHint = {
  /** e.g. "Shift + Cmd + N" */
  shortcut: string;
  /** what that browser calls the mode */
  modeName: string;
  browser: string;
};

const DEFAULT: IncognitoHint = {
  shortcut: "Ctrl + Shift + N",
  modeName: "incognito window",
  browser: "your browser",
};

/**
 * Best effort detection from the user agent. Only used to show a keyboard
 * shortcut, so a wrong guess costs the user nothing but a glance.
 */
export function detectIncognitoHint(userAgent: string, platform: string): IncognitoHint {
  const ua = userAgent.toLowerCase();
  const isApple = /mac|iphone|ipad/.test(platform.toLowerCase()) || /mac os x/.test(ua);
  const mod = isApple ? "Shift + Cmd" : "Ctrl + Shift";

  // Order matters: Edge, Opera and Brave all contain "chrome" in the UA.
  if (/edg\//.test(ua)) {
    return { shortcut: `${mod} + N`, modeName: "InPrivate window", browser: "Edge" };
  }
  if (/opr\//.test(ua)) {
    return { shortcut: `${mod} + N`, modeName: "private window", browser: "Opera" };
  }
  if (/firefox\//.test(ua)) {
    return { shortcut: `${mod} + P`, modeName: "private window", browser: "Firefox" };
  }
  if (/chrome\//.test(ua)) {
    return { shortcut: `${mod} + N`, modeName: "incognito window", browser: "Chrome" };
  }
  if (/safari\//.test(ua)) {
    return { shortcut: `${mod} + N`, modeName: "private window", browser: "Safari" };
  }
  return { ...DEFAULT, shortcut: `${mod} + N` };
}

/** "an incognito window" vs "a private window". */
export function withArticle(modeName: string): string {
  return `${/^[aeiou]/i.test(modeName) ? "an" : "a"} ${modeName}`;
}

export function currentIncognitoHint(): IncognitoHint {
  if (typeof navigator === "undefined") return DEFAULT;
  return detectIncognitoHint(navigator.userAgent, navigator.platform ?? "");
}
