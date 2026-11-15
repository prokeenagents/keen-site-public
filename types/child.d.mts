/**
 * The command for `kind` — argv carries the script, the port and the host, nothing else.
 *
 * `cwd` is the SITE's root (the bin passes `process.cwd()`), never this package's folder: the
 * standalone `server.js` is looked for there, and `next` is resolved from the site's own
 * `node_modules` (as `require` would from the site's package.json). The child runs in it too.
 * @param {ChildKind} kind
 * @param {{ cwd: string, port: number, host?: string }} where
 * @returns {ChildCommand}
 */
export function childCommand(kind: ChildKind, { cwd, port, host }: {
    cwd: string;
    port: number;
    host?: string;
}): ChildCommand;
/**
 * True when something accepts TCP on the loopback address on the given port.
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export function isPortOpen(port: number): Promise<boolean>;
/** @typedef {'auto' | 'standalone' | 'next-start' | 'dev'} ChildKind */
/** @typedef {'stopped' | 'starting' | 'ready' | 'gave-up'} ChildState */
/** @typedef {{ file: string, args: string[] }} ChildCommand */
/** @typedef {(file: string, args: string[], options: import('node:child_process').SpawnOptions) => import('node:child_process').ChildProcess} SpawnFn */
/**
 * @typedef {object} ChildOptions
 * @property {number} readyTimeoutMs
 * @property {number} readyPollMs
 * @property {number} stopGraceMs
 * @property {readonly number[]} crashDelaysMs
 * @property {number} crashWindowMs
 * @property {number} crashLimit
 */
/** @type {Readonly<ChildOptions>} */
export const CHILD_DEFAULTS: Readonly<ChildOptions>;
export class NextChild {
    /**
     * @param {object} opts
     * @param {ChildCommand} opts.command
     * @param {string} opts.cwd
     * @param {number} opts.port
     * @param {(state: ChildState) => void} [opts.onState]
     * @param {(line: string) => void} [opts.log]
     * @param {SpawnFn} [opts.spawn]
     * @param {(port: number) => Promise<boolean>} [opts.probe]
     * @param {() => number} [opts.now]
     * @param {Partial<ChildOptions>} [opts.options]
     */
    constructor(opts: {
        command: ChildCommand;
        cwd: string;
        port: number;
        onState?: ((state: ChildState) => void) | undefined;
        log?: ((line: string) => void) | undefined;
        spawn?: SpawnFn | undefined;
        probe?: ((port: number) => Promise<boolean>) | undefined;
        now?: (() => number) | undefined;
        options?: Partial<ChildOptions> | undefined;
    });
    command: ChildCommand;
    cwd: string;
    port: number;
    onState: (state: ChildState) => void;
    log: (line: string) => void;
    /** @type {SpawnFn} */
    spawn: SpawnFn;
    probe: (port: number) => Promise<boolean>;
    now: () => number;
    /** @type {ChildOptions} */
    options: ChildOptions;
    /** @type {ChildState} */
    state: ChildState;
    /** @type {import('node:child_process').ChildProcess | null} */
    proc: import("node:child_process").ChildProcess | null;
    /** @type {Record<string, string> | null} the env of the current run (kept for crash restarts) */
    env: Record<string, string> | null;
    /** @type {number[]} exit times inside the crash window */
    exits: number[];
    /** Bumped on every start / stop so the events of an older process are ignored. */
    generation: number;
    /** @type {ReturnType<typeof setTimeout> | null} */
    restartTimer: ReturnType<typeof setTimeout> | null;
    /** @type {Promise<void> | null} */
    exited: Promise<void> | null;
    /** How many processes were spawned (tests and diagnostics). */
    spawns: number;
    get ready(): boolean;
    /** True while a process runs or is about to (a crash restart is pending). */
    get alive(): boolean;
    /**
     * Start with `env` (stopping a running child first). Resolves true once the port answers.
     * @param {Record<string, string>} env
     * @returns {Promise<boolean>}
     */
    start(env: Record<string, string>): Promise<boolean>;
    /** Stop and start again with `env` — the restart. */
    /** @param {Record<string, string>} env */
    restart(env: Record<string, string>): Promise<boolean>;
    /** SIGTERM, 10 s, SIGKILL. Resolves once the process is gone. */
    stop(): Promise<void>;
    /** @private @param {ChildState} state */
    private setState;
    /** @private @returns {Promise<boolean>} */
    private launch;
    /**
     * @private
     * @param {number | null} code
     * @param {NodeJS.Signals | null} signal
     */
    private onCrash;
}
export type ChildKind = "auto" | "standalone" | "next-start" | "dev";
export type ChildState = "stopped" | "starting" | "ready" | "gave-up";
export type ChildCommand = {
    file: string;
    args: string[];
};
export type SpawnFn = (file: string, args: string[], options: import("node:child_process").SpawnOptions) => import("node:child_process").ChildProcess;
export type ChildOptions = {
    readyTimeoutMs: number;
    readyPollMs: number;
    stopGraceMs: number;
    crashDelaysMs: readonly number[];
    crashWindowMs: number;
    crashLimit: number;
};
