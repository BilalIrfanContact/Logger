# V1 journal export

- Status: Accepted
- Scope: Wayfinder ticket 12, `Define V1 journal import and export behavior`

V1 provides a complete export of the user's durable journal data. It does not provide import. Export gives users a usable backup while avoiding the merge and duplicate rules an import flow would require.

## Export format

- Download one JSON file with a top-level format version of `1` and the export timestamp.
- Include journal days that contain raw notes or saved entries. Each day includes its local calendar date and timezone.
- Include all raw notes, saved journal entries, and projects, including archived projects.
- Preserve stable project IDs. Each saved entry references its project ID, or uses `null` for an uncategorized entry.
- Store exact timestamps as ISO 8601 UTC values.
- Exclude temporary AI reviews, organization jobs, provider metadata, and deleted records.
- Do not include empty journal days.

## User interaction

The export downloads immediately as a file named like `kept-export-2026-08-29.json`. V1 does not offer date or project selection; the export always contains the complete journal.

## Consequences

Import, duplicate resolution, invalid-file handling, and selective exports are out of scope for V1. A later import feature can define those rules against this versioned format.
