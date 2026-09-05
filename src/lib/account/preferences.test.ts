import { describe, expect, it } from "vitest";

import { isValidTimezone, normalizeLocale, normalizePreferences } from "./preferences";

describe("account preferences", () => {
  it("accepts an IANA timezone and canonicalizes the locale", () => {
    expect(normalizePreferences(" en-gb ", "Europe/London")).toEqual({
      locale: "en-GB",
      timezone: "Europe/London",
    });
  });

  it("rejects invalid locales and timezones", () => {
    expect(normalizeLocale("not a locale")).toBeNull();
    expect(isValidTimezone("Not/A-Timezone")).toBe(false);
    expect(normalizePreferences("en-US", "Not/A-Timezone")).toBeNull();
  });
});
