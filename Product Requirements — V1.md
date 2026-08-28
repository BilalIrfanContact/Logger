# Product Requirements — V1

## Product Overview

This application is a simple work journal for developers.

The main purpose of the application is to help developers keep track of what they worked on each day without requiring them to manually organize everything into structured fields.

A developer should be able to select a date, describe their day in natural language, and let AI organize that information into a clear project-based journal entry.

The application should make it easy to later answer questions such as:

* What did I work on on a specific day?
* What work have I done on a specific project?
* What meetings or discussions did I have related to a project?

The product should feel more like a personal developer journal than a time-tracking or project-management system.

## Daily Logging

The user should be able to select a date and describe what they worked on during that day using normal, unstructured text.

For example, the user could write that they worked on NexusLMS lesson management, had a client meeting about its dashboard, and also worked on quotation-related changes for Greenland.

The user should not be required to manually separate this information while entering it.

The AI should analyze the input and organize the work according to the projects mentioned.

A resulting entry could look conceptually like:

**NexusLMS**

* Worked on lesson management
* Fixed lesson submission emails
* Client meeting about dashboard changes

**Greenland**

* Worked on quotation workflow
* Fixed quotation permissions

The project name should act as a project tag that can later be used for filtering and browsing.

## AI Assistance

AI is used primarily to organize the user's unstructured daily description.

Its role is to identify projects and associate the relevant work, meetings, discussions, or other activities with the correct project.

AI should not be treated as the final source of truth.

Everything created by AI should remain editable by the user.

The user should be able to manually:

* Change project names or tags
* Edit generated entries
* Add new entries
* Remove incorrect entries
* Reorganize information if the AI categorizes something incorrectly

Users should also be able to create or edit journal information manually without relying on AI.

## Journal Structure

The application should remain intentionally simple.

At a high level, the data can be thought of as:

Day → Project → Work entries

A single day may contain work related to multiple projects.

The application does not currently need detailed task-management functionality such as:

* Time tracking
* Progress percentages
* Task statuses
* Priorities
* Estimates
* Detailed productivity metrics

The focus is simply on recording what happened and making it easy to retrieve later.

## Calendar View

The primary way of browsing previous daily entries should be a calendar.

Days containing journal entries should be visually identifiable.

The user should be able to select any date and view everything recorded for that day.

The selected day's journal should show the projects worked on and the corresponding entries associated with each project.

This allows the user to quickly answer:

"What did I work on that day?"

## Projects View

The application should also provide a project-based view.

The user should be able to see the projects that have appeared in their journal entries.

Selecting a project should display a chronological history of work recorded for that project.

For example:

**NexusLMS**

August 29

* Worked on lesson management
* Fixed submission email flow

August 28

* Client meeting regarding dashboard changes
* Reviewed deployment

August 26

* Worked on quiz attempt handling

This allows the user to quickly answer:

"What have I been doing on this project?"

## V1 Scope

This document describes only the first version of the product.

The goal of V1 is to validate the core idea and build a useful working application without turning it into a large project-management platform.

The main V1 experience is:

**Log a day → AI organizes it → user reviews it → save it → retrieve it later through calendar or project history.**

The requirements in this document are intentionally high level.

They are not considered final and may change as the application is implemented and used.

Detailed interface decisions, technical architecture, data structures, AI implementation, integrations, and smaller user interactions should be decided iteratively during development rather than fully specified before implementation.

Future versions may expand the product with additional features, but those should only be introduced when they clearly improve the core developer-journal experience.
