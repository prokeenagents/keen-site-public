/**
 * @param {number} code
 * @returns {{ name: string, kind: CloseKind }}
 */
export function classifyClose(code: number): {
    name: string;
    kind: CloseKind;
};
/** The `retry=<seconds>` of a 4429 reason (`too many attempts; retry=<s>`), else null. */
/** @param {string} reason */
export function retryAfterSeconds(reason: string): number | null;
/** The log line's words for the three terminal codes. */
/** @param {number} code */
export function terminalWords(code: number): "key rotated" | "key deleted" | "invalid signature";
/**
 * The reconnect delay after a close of `kind`. `attempt` counts the transport failures
 * since the last welcome (0 for the first); `random` is in [0, 1).
 *
 * @param {CloseKind} kind
 * @param {{ attempt: number, retrySec?: number | null, random?: () => number }} input
 * @returns {number} milliseconds
 */
export function reconnectDelayMs(kind: CloseKind, { attempt, retrySec, random }: {
    attempt: number;
    retrySec?: number | null;
    random?: () => number;
}): number;
/**
 * The channel's close codes (the 44xx family) and what
 * this pre-process does on each, plus the reconnect delays.
 *
 * Kinds:
 * - `terminal`  — never connect again until the process restarts with new values; Next stopped
 * - `legacy`    — Keen has no site control for this key: run on the container's KEEN_* env
 * - `parked`    — Next stopped, the unavailable page, reconnect after 60 s ± 20 %
 * - `capped`    — keep the current state, reconnect after 60 s ± 20 %
 * - `retry`     — keep the current state, reconnect after the `retry=<s>` Keen named + 0–10 %
 * - `restart`   — Keen's worker drains: reconnect elsewhere after 0–10 s
 * - `transport` — keep the current state, full jitter random(0, min(60 s, 1 s × 2^attempt))
 */
/** @typedef {'terminal' | 'legacy' | 'parked' | 'capped' | 'retry' | 'restart' | 'transport'} CloseKind */
/** @type {Readonly<Record<number, { name: string, kind: CloseKind }>>} */
export const CLOSE_CODES: Readonly<Record<number, {
    name: string;
    kind: CloseKind;
}>>;
export type CloseKind = "terminal" | "legacy" | "parked" | "capped" | "retry" | "restart" | "transport";
