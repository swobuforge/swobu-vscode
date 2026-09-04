import {readdir,readFile} from "node:fs/promises"; import path from "node:path";
const forbidden=[/createWebviewPanel/,/registerWebviewViewProvider/,/exec\s*\(/,/curl\b/,/\.claude\/settings\.json/,/\.codex\/config\.toml/,/api[_-]?key/i];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())await walk(p);else if(p.endsWith(".ts")){const text=await readFile(p,"utf8");for(const rule of forbidden)if(rule.test(text))throw new Error(`${p} violates boundary ${rule}`);}}} await walk("src");
