import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
const pkg=JSON.parse(readFileSync("package.json"));
if(execFileSync("git",["status","--porcelain"],{encoding:"utf8"}).trim())throw new Error("Release requires a clean source tree");
const tag=process.env.GITHUB_REF_NAME??execFileSync("git",["describe","--tags","--exact-match"],{encoding:"utf8"}).trim();if(tag!==`v${pkg.version}`)throw new Error("Package version does not match release tag");
if(!readFileSync("CHANGELOG.md","utf8").includes(pkg.version))throw new Error("Missing changelog version");
for(const file of ["package.json","README.md"])if(/UNPINNED|TODO/.test(readFileSync(file,"utf8")))throw new Error(`Unfinished release input ${file}`);
console.log(JSON.stringify({extensionVersion:pkg.version,sourceCommit:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim()},null,2));
