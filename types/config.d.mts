/**
 * The protocol the hello announces: `KEEN_SITE_PROTOCOL` unset / empty → 2 (this build), `1` or `2`
 * as set; anything else throws (the process does not start).
 * @param {string | undefined} value
 * @returns {1 | 2}
 */
export function protocolOf(value: string | undefined): 1 | 2;
/** The boot line for the protocol, or null when nothing needs saying. @param {SiteConfig} config */
export function protocolNote(config: SiteConfig): "[keen-site] protocol 1 forced by KEEN_SITE_PROTOCOL — the API key's secrets are not applied." | null;
/**
 * `<K_REVISION or hostname>-<6 random base64url>` (one per process start), within ^[A-Za-z0-9._-]{1,64}$.
 * @param {Record<string, string | undefined>} env
 */
export function instanceId(env: Record<string, string | undefined>): string;
/** @param {Record<string, string | undefined>} env @returns {'cloud-run' | 'docker' | 'node'} */
export function runtimeOf(env: Record<string, string | undefined>): "cloud-run" | "docker" | "node";
/**
 * The site's package.json version (the SITE's, read from `rootDir` — never this package's): one word
 * of printable ASCII, at most 64 characters (Keen's hello shape).
 * @param {string} rootDir
 * @returns {string}
 */
export function siteVersion(rootDir: string): string;
/**
 * @param {Record<string, string | undefined>} env
 * @param {string} rootDir the site's root (the directory that holds package.json / server.js)
 * @returns {SiteConfig}
 */
export function readConfig(env: Record<string, string | undefined>, rootDir: string): SiteConfig;
/** The one line logged at boot when `KEEN_SITE_PROTOCOL=1` forces protocol 1 on a managed site. */
export const PROTOCOL_1_FORCED: "[keen-site] protocol 1 forced by KEEN_SITE_PROTOCOL \u2014 the API key's secrets are not applied.";
export type ChildKind = import("./child.mjs").ChildKind;
export type SiteConfig = {
    mode: "managed" | "legacy" | "off";
    /**
     * the one log line explaining the mode
     */
    why: string;
    port: number;
    childPort: number;
    childKind: ChildKind;
    childNodeOptions: string | undefined;
    keenHost: string;
    keyId: string;
    secret: string;
    instance: import("./signature.mjs").Instance;
};
