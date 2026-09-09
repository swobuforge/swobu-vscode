// Produce a private handover, never a distributable VSIX input. Git is read-only;
// callers must have repository permission to inspect revisions and diffs.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const extension=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const platform=resolve(extension,"..");
const out=resolve(extension,"checkpoint/010");
const groups=[
 {name:"platform",root:platform,paths:["swobucom/apps/ingest-api/contracts/product-report-v2.schema.json","swobucom/apps/ingest-api/contracts/product-report-v3.schema.json","swobucom/apps/ingest-api/contracts/product-report-v3.example.json","swobucom/apps/ingest-api/src/product_report_registry.ts","swobucom/apps/ingest-api/src/posthog_report_sink.ts","swobucom/apps/ingest-api/test/product_report_registry.test.ts","swobucom/apps/ingest-api/test/posthog_report_sink.test.ts","swobucli/internal/producttelemetry/vscode_report_test.go","swobucli/internal/producttelemetry/golden_current_test.go","swobucli/internal/producttelemetry/reducer_test.go","swobucli/internal/domain/trafficevidence/vscode_client_family_test.go"]},
 {name:"opencore",root:resolve(platform,"swobucli/opencore"),paths:["internal/domain/trafficevidence/client_family.go","internal/producttelemetry/report.go","internal/producttelemetry/reducer.go"]},
 {name:"swobu-vscode",root:extension,paths:["src","test","package.json","package-lock.json"]},
];
const manifest={generatedAt:new Date().toISOString(),publication:"Local working-tree checkpoint; HEAD IDs are bases, not commits containing all changes. No deployment or publication proven.",repositories:[],files:[],proofCommands:["npm --prefix swobu-vscode run verify","SWOBU_TEST_PACKAGES='./internal/domain/trafficevidence ./internal/producttelemetry' make -C swobucli test","npm --prefix swobucom/apps/ingest-api run typecheck","npm --prefix swobucom/apps/ingest-api test"]};
mkdirSync(out,{recursive:true});
for(const group of groups){
 const git=(...args)=>execFileSync("git",["-C",group.root,...args],{encoding:"utf8"});
 manifest.repositories.push({name:group.name,head:git("rev-parse","HEAD").trim(),selectedStatus:git("status","--short","--",...group.paths),patch:`${group.name}.patch`});
 writeFileSync(resolve(out,`${group.name}.patch`),git("diff","HEAD","--",...group.paths));
 if(group.name==="swobu-vscode")continue; // Extension source travels in its own archive.
 for(const file of group.paths){const source=resolve(group.root,file),target=resolve(out,"source",group.name,file);const content=readFileSync(source);mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target);manifest.files.push({path:`source/${group.name}/${file}`,sha256:createHash("sha256").update(content).digest("hex")});}
}
writeFileSync(resolve(out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(`Wrote ${out}; private platform evidence must not be published with the extension.`);
