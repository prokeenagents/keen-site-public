/**
 * @typedef {{ siteToKeen: Buffer, keenToSite: Buffer, payload: Buffer }} SiteKeys
 * @typedef {{ id: string, protocol: number, siteVersion: string, runtime: string }} Instance
 * @typedef {{ payload: string, ts: string, nonce: string, sig: string }} SignedFrameData
 * @typedef {{ ok: true, payload: Record<string, unknown>, version: number, hash: string } | { ok: false, reason: string }} Verdict
 */
/**
 * @param {Buffer} ikm
 * @param {string} info
 * @returns {Buffer}
 */
export function hkdf32(ikm: Buffer, info: string): Buffer;
/**
 * The three keys this site needs, from the whole API Key Secret ("kak_…"). The root R itself
 * is not kept.
 * @param {string} secret
 * @returns {SiteKeys}
 */
export function deriveSiteKeys(secret: string): SiteKeys;
/** @param {string} text */
export function sha256Hex(text: string): string;
/**
 * @param {{ op: string, keyId: string, ts: string, nonce: string, extra: string, payload: string }} parts
 * @returns {string}
 */
export function canonical({ op, keyId, ts, nonce, extra, payload }: {
    op: string;
    keyId: string;
    ts: string;
    nonce: string;
    extra: string;
    payload: string;
}): string;
/**
 * @param {Buffer} key
 * @param {string} text
 * @returns {string}
 */
export function signCanonical(key: Buffer, text: string): string;
/**
 * Constant-time string compare (false on a length difference without comparing).
 * @param {string} a
 * @param {string} b
 */
export function safeEqual(a: string, b: string): boolean;
/**
 * The hello's `extra` line: '<instanceId> <protocol> <siteVersion> <appliedHash or ->'.
 * @param {Instance} instance
 * @param {string | null} appliedHash
 */
export function helloExtra(instance: Instance, appliedHash: string | null): string;
/**
 * The signed hello: signed under K_sk over the empty payload.
 * @param {{ keys: SiteKeys, keyId: string, instance: Instance, appliedHash: string | null, nowMs?: number, nonce?: string }} input
 * @returns {{ v: 1, keyId: string, ts: string, nonce: string, sig: string, instance: Instance, appliedHash: string | null }}
 */
export function signHello({ keys, keyId, instance, appliedHash, nowMs, nonce }: {
    keys: SiteKeys;
    keyId: string;
    instance: Instance;
    appliedHash: string | null;
    nowMs?: number;
    nonce?: string;
}): {
    v: 1;
    keyId: string;
    ts: string;
    nonce: string;
    sig: string;
    instance: Instance;
    appliedHash: string | null;
};
/**
 * Verify one frame Keen sent (welcome / state / launch) under K_ks.
 *
 * Keen's frames carry no freshness window (a frame may wait minutes in an idle Cloud Run
 * instance's socket): the welcome is bound to the hello's nonce, a launch to its request's
 * nonce, and a state to its version, which the caller only ever lets grow.
 *
 * @param {{ keys: SiteKeys, keyId: string, op: 'welcome' | 'state' | 'launch', data: unknown, boundNonce?: string }} input
 * @returns {Verdict}
 */
export function verifyKeenFrame({ keys, keyId, op, data, boundNonce }: {
    keys: SiteKeys;
    keyId: string;
    op: "welcome" | "state" | "launch";
    data: unknown;
    boundNonce?: string;
}): Verdict;
/**
 * Open one `e1.<iv>.<tag>.<ct>` field (AES-256-GCM under K_enc, AAD
 * `keen-site-v1|<apiKeyId>|<bound nonce>|<field>`). Throws on any failure — the caller treats
 * a throw as a frame that failed verification.
 *
 * @param {{ keys: SiteKeys, keyId: string, boundNonce: string, field: string, blob: unknown }} input
 * @returns {string}
 */
export function openField({ keys, keyId, boundNonce, field, blob }: {
    keys: SiteKeys;
    keyId: string;
    boundNonce: string;
    field: string;
    blob: unknown;
}): string;
export const SCHEME: "keen-site-v1";
/**
 * The channel's protocol number, sent in the hello (`instance.protocol`). 2 = this pre-process
 * applies `launch.secrets` (the Secret Manager); 1 = no secrets.
 */
export const PROTOCOL: 2;
/** The HKDF infos — each distinct from every other key Keen derives. */
export const HKDF_INFO: Readonly<{
    root: "keen/site-root/v1";
    siteToKeen: "keen/site/site-to-keen/v1";
    keenToSite: "keen/site/keen-to-site/v1";
    payload: "keen/site/payload/v1";
}>;
export const UUID_V4: RegExp;
export const HASH_43: RegExp;
export const INSTANCE_ID: RegExp;
export type SiteKeys = {
    siteToKeen: Buffer;
    keenToSite: Buffer;
    payload: Buffer;
};
export type Instance = {
    id: string;
    protocol: number;
    siteVersion: string;
    runtime: string;
};
export type SignedFrameData = {
    payload: string;
    ts: string;
    nonce: string;
    sig: string;
};
export type Verdict = {
    ok: true;
    payload: Record<string, unknown>;
    version: number;
    hash: string;
} | {
    ok: false;
    reason: string;
};
