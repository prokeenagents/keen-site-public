/**
 * @typedef {{ exact: ReadonlySet<string>, prefixes: readonly string[] }} Denylist
 */
/**
 * Read and check the denylist. A file that is not the expected shape throws — the pre-process
 * would rather not start than apply secrets without the guard.
 * @param {string} text
 * @returns {Denylist}
 */
export function parseDenylist(text: string): Denylist;
/**
 * Why `name` may not be set by a secret, or null when it may.
 * @param {string} name
 * @param {Denylist} [list]
 * @returns {'shape' | 'denied' | null}
 */
export function secretNameRefusal(name: string, list?: Denylist): "shape" | "denied" | null;
/** The shape every environment name must have (the controller's `ENV_NAME`, the same rule Keen applies). */
export const SECRET_NAME: RegExp;
/** The denylist's file, next to this module (it ships in the image; the vectors do not). */
export const DENYLIST_FILE: URL;
/** @type {Denylist} */
export const DENYLIST: Denylist;
export type Denylist = {
    exact: ReadonlySet<string>;
    prefixes: readonly string[];
};
