# Kept domain

Kept is a personal work journal for developers. It turns the user's unstructured account of a day into editable, project-based journal entries while keeping the user in control of what gets saved.

## Core journal language

**User**:
The person who owns the journal, notes, entries, and projects.
_Avoid_: Account when referring to the person; account is reserved for preferences and access settings.

**Journal day**:
The user's single journal for one local calendar date. It contains that day's raw notes, AI review, and saved entries.
_Avoid_: Daily journal when naming the domain object; use journal day.

**Raw note**:
The user's original, unorganized text added to a journal day. It is preserved as the source of later AI organization.
_Avoid_: Entry or draft entry; a raw note is not saved journal output.

**AI review**:
An editable set of suggestions created by organizing one or more raw notes. It becomes permanent journal data only when the user approves and saves it.
_Avoid_: Final result or automatic entry; AI output is never final by itself.

**Review suggestion**:
One proposed activity inside an AI review. It may name a project, remain uncategorized, be edited, or be removed before saving.
_Avoid_: Journal entry until the user saves it.

**Journal entry**:
One saved, user-editable activity in a journal day. It belongs to one project or remains uncategorized.
_Avoid_: Note when referring to saved journal output.

**Uncategorized entry**:
A saved journal entry that has no project assigned. It remains part of the journal and appears in Uncategorized history.
_Avoid_: Unassigned project; no project exists for the entry.

**Project**:
A user-owned, reusable name for grouping related journal entries across journal days. A project can be renamed, archived, restored, merged, or deleted according to the project's rules.
_Avoid_: Tag; projects are the V1 categorization system.

## Time and retrieval language

**Calendar date**:
The local date used to identify a journal day, such as `2026-08-29`. It is different from an exact timestamp.
_Avoid_: UTC date when referring to the user's journal day.

**Locale**:
The user's saved regional display preference. It controls date and time formatting and which day starts the calendar week.
_Avoid_: Location; locale does not identify where the user physically is.

**Journal timezone**:
The timezone used to determine a journal day's local date and midnight boundary. A journal day keeps the timezone it was created with.
_Avoid_: Current device timezone when discussing an existing journal day.

**Calendar grid**:
The monthly view for browsing journal days. It marks dates with raw notes or saved entries and lets users open today or past dates.
_Avoid_: Calendar page when referring to the monthly date grid itself.

**Journal card**:
The large overlay that opens a journal day while leaving the calendar visible behind it.
_Avoid_: New page; the card is an overlay over the current browsing view.

**Project history**:
The saved entries for one project, grouped by journal date with the newest date first. Archived projects keep their history.
_Avoid_: Project report; Kept records work history, not project-management metrics.

**Uncategorized history**:
The retrieval view for saved entries that do not belong to a project.
_Avoid_: Uncategorized project; uncategorized is a view, not a project record.

## Relationships

- A user owns many journal days and projects.
- A journal day has many raw notes and saved journal entries.
- An AI review organizes raw notes into review suggestions. One suggestion can draw from several raw notes, and one raw note can produce several suggestions.
- A saved journal entry belongs to one journal day and optionally one project.
- A project groups entries across many journal days.
- The calendar grid retrieves journal days. Project history retrieves saved entries through a project or the Uncategorized history.

## Boundaries

- Raw notes are the user's source material. Journal entries are the saved result. They are different things.
- AI proposes organization. The user decides what becomes saved journal data.
- A journal day is based on the user's local date, while exact event times remain timestamps.
- Kept records what happened. It does not track task status, time spent, priorities, estimates, productivity scores, or collaboration.
