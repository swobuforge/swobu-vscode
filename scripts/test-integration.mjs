import { build } from "esbuild";
import { runTests } from "@vscode/test-electron";
import { mkdtempSync,rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
await build({entryPoints:["test/host/index.ts"],bundle:true,outfile:".out/host/index.js",platform:"node",format:"cjs",external:["vscode"]});
const extensionStarts=process.env.SWOBU_TEST_RUNTIME_MODE==="extension-start";
const runtimeHome=extensionStarts?mkdtempSync(`${tmpdir()}/swobu-extension-start-`):undefined;
try{
 await runTests({version:"1.136.1",extensionDevelopmentPath:process.env.SWOBU_INSTALLED_EXTENSION??resolve("."),extensionTestsPath:resolve(".out/host/index.js"),launchArgs:["--disable-gpu","--no-sandbox","--skip-welcome","--skip-release-notes","--disable-workspace-trust"],extensionTestsEnv:runtimeHome?{...process.env,SWOBU_HOME:runtimeHome,SWOBU_CONFIG_PATH:`${runtimeHome}/swobu.yaml`,SWOBU_TELEMETRY:"0",SWOBU_TEST_RUNTIME_HOME:runtimeHome}:process.env});
}finally{if(runtimeHome)rmSync(runtimeHome,{recursive:true,force:true,maxRetries:20,retryDelay:100});}
