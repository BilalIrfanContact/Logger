# Logger glossary

## Journal day

The user's single journal for one calendar date. It is the parent record for that day's raw notes, AI reviews, and saved entries.

## Raw note

An unorganized piece of text added by the user. Raw notes remain unchanged and act as the source for AI organization.

## Organization job

An internal processing record for one AI organization event. It tracks the request, status, retries, and result without exposing that technical history to the user.

## AI review

The editable suggestions produced by an organization job. A review is not permanent journal data until the user approves and saves it.

## Review suggestion

One proposed activity produced by an AI review. A suggestion can be assigned to a project, kept uncategorized, edited, or deleted before it becomes a saved journal entry.

## Journal entry

One saved, user-editable activity in a journal day. It belongs to one project or is uncategorized.

## Entry origin

Whether a saved entry came from an AI review or was created manually. V1 records `ai` or `manual` internally.

## Project

A user-owned canonical entity that groups journal entries across days.

## Calendar date

The local date shown to the user, such as `2026-08-29`. It is separate from an exact UTC timestamp.

## Locale

The user's saved regional display preference, initially detected from the browser or device. It controls date and time formatting and which day starts the calendar week. It is not a physical-location tracker.

## Timezone snapshot

The IANA timezone saved on a journal day, such as `Asia/Karachi`. It determines that day's local date and midnight boundary even if the user later changes their account timezone.

## Calendar grid

The monthly view used to browse journal days. A marked date has raw notes or saved entries. Today is selected by default, empty past dates can be opened, and future dates are disabled.

## Journal card

The large overlay used to open a journal day while keeping the calendar visible behind it.

## Project history

The saved entries for one project, grouped by journal date with the newest date first. Archived projects keep their history, and uncategorized entries have their own history view.

## Uncategorized history

The history view for saved entries that do not belong to a project.
