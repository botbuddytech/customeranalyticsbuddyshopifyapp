import { getSupabaseForShop } from "./supabase-jwt.server";

export interface UserPreferences {
  language: string;
}

interface UserPreferencesRow {
  id: string;
  shop: string;
  preferences: string | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function normalizePreferences(
  row: UserPreferencesRow | null | undefined,
  defaultLanguage: string,
): UserPreferences {
  if (!row || !row.preferences) return { language: defaultLanguage };

  try {
    const prefs =
      typeof row.preferences === "string"
        ? (JSON.parse(row.preferences) as Partial<UserPreferences>)
        : (row.preferences as Partial<UserPreferences>);

    return {
      language: prefs.language || defaultLanguage,
    };
  } catch (error) {
    console.error("[User Preferences] Error parsing preferences JSON:", error);
    return { language: defaultLanguage };
  }
}

export async function getUserPreferences(
  shop: string,
  defaultLanguage = "en",
): Promise<UserPreferences> {
  try {
    const supabase = getSupabaseForShop(shop);

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No preferences yet - return default silently
        return { language: defaultLanguage };
      }

      console.error(
        `[User Preferences] Supabase error for shop ${shop}:`,
        error,
      );
      return { language: defaultLanguage };
    }

    return normalizePreferences(data as UserPreferencesRow, defaultLanguage);
  } catch (error) {
    console.error(
      `[User Preferences] Error fetching preferences for shop ${shop}:`,
      error,
    );
    return { language: defaultLanguage };
  }
}

export async function saveUserPreferences(
  shop: string,
  prefs: UserPreferences,
): Promise<void> {
  try {
    const supabase = getSupabaseForShop(shop);
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("user_preferences")
      .select("id, createdAt")
      .single();

    const { error } = await supabase.from("user_preferences").upsert(
      {
        id: existing?.id || crypto.randomUUID(),
        shop,
        preferences: JSON.stringify(prefs),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      },
      {
        onConflict: "shop",
      },
    );

    if (error) {
      console.error(
        `[User Preferences] Supabase error saving for shop ${shop}:`,
        error,
      );
      throw error;
    }
  } catch (error) {
    console.error(
      `[User Preferences] Error saving preferences for shop ${shop}:`,
      error,
    );
    throw error;
  }
}


