# V1 AI model and request policy

Research snapshot: 2026-08-29. Sources are official OpenAI documentation only.

## Decision

Use `gpt-5.6-terra` through the Responses API with Structured Outputs and a strict JSON Schema. Start with `reasoning.effort: "low"`; test `"medium"` later if representative journal examples show missed categories or poor grouping.

Terra fits Logger better than the flagship model because this is a bounded text-organization task, not open-ended professional analysis. It costs less than Sol while keeping the same 1.05M-token context window, 128K maximum output, and Structured Outputs support. This quality-versus-cost judgment is an inference from Logger's low-frequency, text-only workload and OpenAI's model descriptions. [Model catalog](https://developers.openai.com/api/docs/models), [model guidance](https://developers.openai.com/api/docs/guides/latest-model), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)

## Current model comparison

| Model | Intended fit | Input / output per 1M tokens | Context / max output | Structured Outputs | Tier 1 limits shown in model docs |
| --- | --- | ---: | --- | --- | --- |
| `gpt-5.6-sol` | Highest-quality complex work | $4 / $20 | 1.05M / 128K | Supported | 500 RPM, 500K TPM, 1.5M batch queue tokens |
| `gpt-5.6-terra` | Balance of intelligence and cost | $2 / $12 | 1.05M / 128K | Supported | 500 RPM, 500K TPM, 1.5M batch queue tokens |
| `gpt-5.6-luna` | Cost-sensitive, high-volume work | $0.20 / $1.20 | 1.05M / 128K | Supported | 500 RPM, 500K TPM, 5M batch queue tokens |

Prices are standard text-token prices. Actual limits depend on the project's usage tier and may vary by model. OpenAI defines limits at the organization and project level, not per end user, and recommends checking the developer console. [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [rate limits](https://developers.openai.com/api/docs/guides/rate-limits)

## Request policy

### Application limits

- Limit one raw organization input to 20,000 characters. This is an app limit, not the model's context limit, and should cover a normal full-day journal while preventing unexpectedly large requests.
- Set `max_output_tokens` to 4,096. A journal organization result should be much smaller than this in normal use; the limit prevents an accidental or malformed response from producing unbounded output.
- Allow at most 10 organization jobs per user in a rolling 24-hour period, with one active job per journal revision. Reject or defer additional jobs while preserving the raw notes.
- Keep `gpt-5.6-terra` as a server-side V1 setting. Do not expose model selection to users or add a second model path until evaluation data shows a need.
- Give each OpenAI request a 30-second network timeout. Give each organization job a five-minute overall deadline, then mark it failed and keep the raw notes available.
- Allow two retries after the initial attempt, with exponential backoff and jitter. Retry only transient failures. Do not retry validation failures, refusals, authentication errors, or other permanent 4xx responses.

### One job for each organization event

- When the user submits late notes for an earlier day, create one organization job immediately.
- At the user's local midnight, create one job for the day's unorganized notes.
- Send only the relevant raw notes, their stable IDs, the journal date, and any existing saved entries needed to avoid duplicates. Treat saved entries as read-only context.
- Store the raw notes unchanged. The model returns suggestions only. It must not directly update saved journal entries.
- Save the model result as a pending review. The user approves the suggestions before Logger adds them to the journal.

This keeps the one-journal-per-day rule and makes a failed or poor AI run recoverable.

### Output contract

Use Structured Outputs with `strict: true`. The schema should return:

- `suggested_entries`, each with a stable source-note ID, title, summary, category, status, and optional confidence;
- `unresolved_notes`, each with a source-note ID and a short reason;
- a short day summary, if the product wants one.

Do not ask the prompt to describe the JSON shape. Put the contract in the JSON Schema and validate the parsed result on the server. OpenAI says Structured Outputs makes responses adhere to the supplied JSON Schema and prevents missing required keys or invalid enum values. [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Responses API](https://developers.openai.com/api/docs/guides/text)

### Background processing and timeouts

Use `background: true` for the Responses request. The web request should enqueue the Logger job and return its status instead of waiting for model completion. A worker should persist the OpenAI response ID, poll while the response is `queued` or `in_progress`, retrieve the terminal response, validate it, and mark the job ready for user review. OpenAI documents background mode specifically for long-running work and shows polling the response object until it reaches a terminal state. [Background mode](https://developers.openai.com/api/docs/guides/background)

The worker should copy the final parsed result into Logger's database. OpenAI's background documentation says response data is stored temporarily to support polling, so the OpenAI response should not be treated as Logger's permanent record. [Background mode](https://developers.openai.com/api/docs/guides/background)

### Retries and rate limits

- Retry only transient failures such as connection errors, timeouts, HTTP 408, 409, 429, and 5xx responses.
- Use exponential backoff with random jitter, and cap application-level attempts so a stuck job cannot loop forever.
- Keep one Logger job ID and one active attempt per journal version. A retry must not create a second set of saved entries.
- Bound worker concurrency and record request IDs, status, attempts, and final error type. Do not log journal text or model output.

OpenAI recommends exponential backoff with jitter for rate-limit errors and notes that unsuccessful requests still count toward per-minute limits. Logger's expected traffic is far below the listed Tier 1 limits, but a midnight fan-out across many users could still create a burst because limits are shared at the project or organization level. [Rate limits](https://developers.openai.com/api/docs/guides/rate-limits), [error codes](https://developers.openai.com/api/docs/guides/error-codes)

### Batch API

Do not use Batch API for the V1 user path. It is 50% cheaper and has separate rate-limit capacity, but completion is allowed to take up to 24 hours. That does not fit immediate late-addition processing and gives Logger less predictable morning availability after midnight. Reconsider it only if Logger later processes many independent journals and can tolerate that delay. [Batch API](https://developers.openai.com/api/docs/guides/batch)

## V1 summary

```text
model: gpt-5.6-terra
api: Responses API
reasoning.effort: low
output: strict Structured Outputs JSON Schema
trigger: late-note submit or local midnight job
execution: durable worker with background=true and polling
write policy: AI creates pending suggestions; user approval writes journal entries
failure policy: preserve raw notes, show the job as failed, allow retry
```
