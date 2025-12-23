import type { UserPreferences } from "../components/settings/types";

const COOKIE_NAME = "cab_user_prefs";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const LANGUAGE_EVENT = "cab:language-changed";

function parseCookie(): UserPreferences | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";").map((c) => c.trim());
  const prefCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!prefCookie) return null;

  const value = prefCookie.split("=")[1];
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as Partial<UserPreferences>;
    if (!parsed.language) return null;
    return { language: parsed.language };
  } catch {
    return null;
  }
}

function writeCookie(prefs: UserPreferences): void {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${encoded}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

function notifyLanguageChanged(language: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LANGUAGE_EVENT, { detail: { language } }),
  );
}

/**
 * Load user preferences, preferring cookie cache.
 * If not present in cookies, fetch from DB via API and cache in cookie.
 */
export async function loadUserPreferencesClient(
  defaultLanguage = "en",
): Promise<UserPreferences> {
  const fromCookie = parseCookie();
  if (fromCookie) {
    notifyLanguageChanged(fromCookie.language);
    return fromCookie;
  }

  const res = await fetch("/app/api.user-preferences");
  if (!res.ok) {
    const fallback = { language: defaultLanguage };
    notifyLanguageChanged(fallback.language);
    return fallback;
  }

  const data = (await res.json()) as UserPreferences;
  const prefs: UserPreferences = {
    language: data.language || defaultLanguage,
  };
  writeCookie(prefs);
  notifyLanguageChanged(prefs.language);
  return prefs;
}

/**
 * Update preferences cookie (e.g. after user changes language in settings).
 */
export function saveUserPreferencesToCookie(prefs: UserPreferences): void {
  writeCookie(prefs);
  notifyLanguageChanged(prefs.language);
}