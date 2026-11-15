/**
 * The HTML of every page: the site's own file when it ships one, else the default.
 * @param {string} dir the folder of the site's own pages (`sitePagesDir(root)`); a missing folder = every default
 * @returns {Record<PagePhase, string>}
 */
export function loadPages(dir: string): Record<PagePhase, string>;
/**
 * Answer one request with the page of `phase`: 503 + Retry-After; JSON under /api/.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {PagePhase} phase
 * @param {Record<PagePhase, string>} html
 */
export function sendPage(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, phase: PagePhase, html: Record<PagePhase, string>): void;
/** @typedef {'stopped' | 'starting' | 'unavailable'} PagePhase */
/** The folder of a site's own pages, relative to the site's root. */
export const SITE_PAGES_DIR: string;
export function sitePagesDir(root: string): string;
/** @type {Readonly<Record<PagePhase, { file: string, retryAfter: number, title: string, line: string, message: string }>>} */
export const PAGES: Readonly<Record<PagePhase, {
    file: string;
    retryAfter: number;
    title: string;
    line: string;
    message: string;
}>>;
export type PagePhase = "stopped" | "starting" | "unavailable";
