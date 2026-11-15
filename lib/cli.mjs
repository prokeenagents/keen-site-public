import{existsSync as E,statSync as l}from"node:fs";import a from"node:path";const _=`Usage: keen-site [--dotenv <path>]

Runs in front of the Next.js site in the current folder: holds $PORT, keeps the signed link to
Keen, and starts / stops / restarts Next on Keen's word.

Options:
  --dotenv <path>  load this environment file first if it exists (a value already in the
                   environment wins); relative to the site's folder. Also: KEEN_SITE_ENV_FILE.
  -h, --help       this text
  -v, --version    the package version

Settings (environment): PORT, KEEN_HOST, KEEN_API_KEY_ID, KEEN_API_KEY_SECRET, KEEN_SITE_MODE,
KEEN_SITE_CHILD, KEEN_SITE_CHILD_PORT, KEEN_SITE_CHILD_NODE_OPTIONS, KEEN_SITE_PROTOCOL.`;function v(r,s){let o=null,t=!1;for(let n=0;n<r.length;n++){const e=r[n];if(e==="-h"||e==="--help")return{action:"help",envFile:null};if(e==="-v"||e==="--version")return{action:"version",envFile:null};let i;if(e==="--dotenv")i=r[++n];else if(e.startsWith("--dotenv="))i=e.slice(9);else throw/^--env-file(?:-if-exists)?(?:=|$)/.test(e)?new Error(`${e.split("=")[0]} is read by Node itself (anywhere on the command line) \u2014 use --dotenv <path>.`):new Error(`Unknown argument: ${e}`);if(!i||i.startsWith("-"))throw new Error("--dotenv needs a path.");if(t)throw new Error("--dotenv may be given once.");t=!0,o=i}return!t&&s.KEEN_SITE_ENV_FILE&&(o=s.KEEN_SITE_ENV_FILE),{action:"run",envFile:o}}function d(r,s,o=t=>process.loadEnvFile(t)){if(!r)return!1;const t=a.resolve(s,r);if(!E(t))return!1;if(!l(t).isFile())throw new Error(`The environment file ${r} is not a file.`);try{o(t)}catch(n){const e=n&&typeof n=="object"&&"code"in n?` (${n.code})`:"";throw new Error(`The environment file ${r} could not be read${e}.`)}return!0}export{_ as USAGE,d as loadEnvFileIfExists,v as parseArgs};
