export type AccountPreferences = {
  locale: string;
  timezone: string;
};

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeLocale(locale: string): string | null {
  try {
    const [canonicalLocale] = Intl.getCanonicalLocales(locale.trim());
    return canonicalLocale ?? null;
  } catch {
    return null;
  }
}

export function normalizePreferences(
  locale: string,
  timezone: string,
): AccountPreferences | null {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedTimezone = timezone.trim();

  if (!normalizedLocale || !isValidTimezone(normalizedTimezone)) {
    return null;
  }

  return { locale: normalizedLocale, timezone: normalizedTimezone };
}
