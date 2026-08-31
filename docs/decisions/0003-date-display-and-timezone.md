# V1 date display and timezone behavior

- Status: Accepted
- Scope: Wayfinder ticket 13, `Define V1 date display and timezone behavior`

Kept detects the browser or device locale and timezone when the account is set up, then saves them as account preferences. These values control display and journal-day boundaries, but they do not claim to identify the user's physical location.

## Display rules

- Use a clear, human-readable date format based on the saved locale. The journal card can show dates such as `August 29, 2026`, while the calendar stays compact.
- Format times using the saved locale's normal 12-hour or 24-hour style.
- Show local times on notes and entries. Keep full UTC timestamps internal.
- Let the calendar's week start follow the saved locale.

## Timezone rules

- Store an IANA timezone such as `Asia/Karachi`, not only a UTC offset.
- Midnight is evaluated in the journal day's stored timezone. Notes after local midnight belong to the new journal day.
- A timezone change applies only to new journal days. Existing journal days keep their timezone snapshot and dates.
- Travel or a device timezone change does not automatically change the account timezone. The user changes it in settings when they want to.
- Locale and timezone are separate preferences. Changing one does not change the other.
