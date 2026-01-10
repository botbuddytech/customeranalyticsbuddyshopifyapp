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

  try {
    // Use absolute URL to avoid React Router navigation issues
    // In React Router v7, app.api.user-preferences.tsx maps to /app/api/user-preferences
    const url = new URL("/app/api/user-preferences", window.location.origin);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as UserPreferences;
    const prefs: UserPreferences = {
      language: data.language || defaultLanguage,
    };
    writeCookie(prefs);
    notifyLanguageChanged(prefs.language);
    return prefs;
  } catch (error) {
    // Ignore abort errors - these are expected when navigation happens
    if (error instanceof Error && error.name === 'AbortError') {
      const fallback = { language: defaultLanguage };
      writeCookie(fallback);
      notifyLanguageChanged(fallback.language);
      return fallback;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      const fallback = { language: defaultLanguage };
      writeCookie(fallback);
      notifyLanguageChanged(fallback.language);
      return fallback;
    }
    
    // Silently fail if route doesn't exist or network error
    // Don't log to console to avoid spam - only log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[UserPreferences] Failed to load preferences:", error);
    }
    const fallback = { language: defaultLanguage };
    writeCookie(fallback); // Cache the fallback
    notifyLanguageChanged(fallback.language);
    return fallback;
  }

}

/**
 * Update preferences cookie (e.g. after user changes language in settings).
 */
export function saveUserPreferencesToCookie(prefs: UserPreferences): void {
  writeCookie(prefs);
  notifyLanguageChanged(prefs.language);
}