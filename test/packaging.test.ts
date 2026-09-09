import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { readFileSync } from "node:fs";
import { publisherArgs } from "../scripts/publish.mjs";
test("release surface has one portable package path and no runtime acquisition",()=>{
 const manifest=JSON.parse(readFileSync("package.json","utf8"));
 assert.equal(manifest.scripts["package:target"],undefined);
 assert.equal(manifest.scripts["release:package"],"node scripts/package-release.mjs");
 assert.doesNotMatch(manifest.scripts["release:package"],/target|runtime/);
 for(const file of ["src/runtime.ts",".github/workflows/ci.yml",".github/workflows/release.yml"]){const source=readFileSync(file,"utf8");assert.doesNotMatch(source,/fetch-runtime|package-platform|bundledExecutable|runtime-manifest/);}
 assert.match(readFileSync("scripts/check-vsix.mjs","utf8"),/Private Swobu runtime residue/);
 assert.doesNotMatch(readFileSync("scripts/check-vsix.mjs","utf8"),/assets\/screenshots\/agent-tool-loop\.png/);
 assert.match(readFileSync("scripts/package-release.mjs","utf8"),/`swobu-\$\{version\}\.vsix`/);
});
test("CI qualifies and release publishes the same manifest-derived VSIX",()=>{
 const ci=readFileSync(".github/workflows/ci.yml","utf8");
 const release=readFileSync(".github/workflows/release.yml","utf8");
 for(const workflow of [ci,release]){
  assert.match(workflow,/appendFileSync\(process\.env\.GITHUB_OUTPUT, 'vsix=swobu-' \+ require\('\.\/package\.json'\)\.version \+ '\.vsix\\\\n'\)/);
  assert.match(workflow,/https:\/\/swobu\.com\/install\.sh/);
  assert.match(workflow,/make release-smoke VSIX="\$\{\{ steps\.package\.outputs\.vsix \}\}"/);
  assert.doesNotMatch(workflow,/npm run (?:verify|test:integration|release:package|release:prepare|release:smoke|publish:)/);
 }
 assert.doesNotMatch(release,/swobu-0\.1\.0\.vsix/);
 assert.match(release,/name: vsix\s+path: \.out\/release/);
 assert.match(release,/make publish-marketplace VSIX=/);
 assert.match(release,/make release-prepare[\s\S]*make release-package/);
 assert.match(release,/windows-smoke:\s+needs: package\s+runs-on: windows-latest/);
 assert.match(release,/choco install make --no-progress -y/);
 assert.match(release,/install\.ps1 -OutFile/);
 assert.match(release,/SWOBU_TEST_BINARY: \$\{\{ runner\.temp \}\}\\swobu-bin\\swobu\.exe/);
 assert.match(release,/github-release:\s+needs: windows-smoke/);
 assert.match(release,/publish-marketplace:\s+needs: windows-smoke/);
 assert.match(release,/publish-openvsx:\s+needs: windows-smoke/);
 assert.match(release,/Get-FileHash -Algorithm SHA256/);
 assert.match(release,/public-smoke:\s+needs: \[github-release, publish-marketplace\]/);
 assert.doesNotMatch(release,/--clobber/);
 const smoke=readFileSync("scripts/release-smoke.mjs","utf8");
 assert.doesNotMatch(smoke,/let installed=/);
 assert.match(smoke,/source==="marketplace"\?30:1/);
 assert.match(smoke,/setTimeout\(resolve,30_000\)/);
 assert.match(smoke,/\["attach","extension-start"\]/);
 const preparation=readFileSync("scripts/release-prepare.mjs","utf8");
 assert.doesNotMatch(preparation,/assets\/screenshots\/agent-tool-loop\.png/);
});
test("pinned Marketplace publisher recognizes fail-closed OIDC authentication",()=>{
 const manifest=JSON.parse(readFileSync("package.json","utf8"));
 assert.equal(manifest.devDependencies["@vscode/vsce"],"3.9.3-12");
 const probe=spawnSync(process.execPath,["node_modules/@vscode/vsce/vsce","publish","--oidc","--pat","not-a-secret"],{encoding:"utf8",shell:false});
 assert.notEqual(probe.status,0);
 assert.match(`${probe.stdout}${probe.stderr}`,/option '--oidc' cannot be used with option '-p, --pat <token>'/);
 assert.deepEqual(publisherArgs("marketplace",["qualified.vsix"],true),["publish","--packagePath","qualified.vsix","--oidc"]);
 assert.deepEqual(publisherArgs("marketplace",["qualified.vsix"],false),["publish","--packagePath","qualified.vsix"]);
});
test("harness-owned runtime exits before its home is removed",()=>{
 const runtime=readFileSync("test/host/runtime.ts","utf8");
 assert.match(runtime,/child\.once\("exit",\(\)=>resolve\(\)\)/);
 assert.ok(runtime.indexOf("await exited")<runtime.indexOf("if(ownsHome)await rm"));
});
