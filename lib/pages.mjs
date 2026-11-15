import{readFileSync as d}from"node:fs";import n from"node:path";const g=n.join("keen-site","pages"),u=e=>n.resolve(e,g),c=Object.freeze({stopped:{file:"maintenance",retryAfter:60,title:"We'll be right back",line:"We'll be right back. The site is under maintenance.",message:"The site is under maintenance."},starting:{file:"starting",retryAfter:5,title:"Starting up",line:"The site is starting up. This usually takes a few seconds.",message:"The site is starting up."},unavailable:{file:"unavailable",retryAfter:60,title:"Temporarily unavailable",line:"The service is temporarily unavailable",message:"The service is temporarily unavailable"}}),m=e=>e.replace(/[&<>"']/g,t=>`&#${t.charCodeAt(0)};`);function h({title:e,line:t}){return`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${m(e)}</title>
<style>
:root { color-scheme: light dark; --bg: #f7f7f8; --fg: #1d1d22; --muted: #5d5d66; }
@media (prefers-color-scheme: dark) { :root { --bg: #111114; --fg: #ececf1; --muted: #a0a0ab; } }
html, body { height: 100%; margin: 0; }
body { display: grid; place-items: center; background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; padding: 0 16px; }
main { max-width: 32rem; text-align: center; }
h1 { font-size: 1.375rem; font-weight: 600; margin: 0 0 .5rem; }
p { color: var(--muted); margin: 0; }
</style>
</head>
<body>
<main>
<h1>${m(t)}</h1>
<p>Please try again in a moment.</p>
</main>
</body>
</html>
`}function y(e){const t={};for(const[a,i]of Object.entries(c))try{t[a]=d(n.join(e,`${i.file}.html`),"utf8")}catch{t[a]=h(i)}return t}function b(e,t,a,i){const r=c[a],s=(e.url??"/").split("?")[0],o=s==="/api"||s.startsWith("/api/"),l=o?JSON.stringify({success:!1,status:503,message:r.message}):i[a];t.writeHead(503,{"Content-Type":o?"application/json; charset=utf-8":"text/html; charset=utf-8","Content-Length":Buffer.byteLength(l),"Cache-Control":"no-store","Retry-After":String(r.retryAfter)}),t.end(e.method==="HEAD"?void 0:l)}export{c as PAGES,g as SITE_PAGES_DIR,y as loadPages,b as sendPage,u as sitePagesDir};
