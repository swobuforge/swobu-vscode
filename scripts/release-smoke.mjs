import {spawnSync} from "node:child_process";
import {readFileSync,mkdtempSync,rmSync,readdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {downloadAndUnzipVSCode,resolveCliArgsFromVSCodeExecutablePath} from "@vscode/test-electron";
const pkg=JSON.parse(readFileSync("package.json"));
const source=process.argv[2];if(!source)throw new Error("Pass a qualified VSIX path or marketplace");
if(!process.env.SWOBU_TEST_BINARY)throw new Error("Release smoke requires SWOBU_TEST_BINARY pointing to the compatible ordinary Swobu installation under test");
const profile=mkdtempSync(join(tmpdir(),"swobu-installed-"));
try{
 const code=await downloadAndUnzipVSCode("1.136.1"),[cli,...args]=resolveCliArgsFromVSCodeExecutablePath(code);
 const vsix=source==="marketplace"?`${pkg.publisher}.${pkg.name}`:resolve(source);
 const installArgs=[...args,"--user-data-dir",join(profile,"user"),"--extensions-dir",join(profile,"extensions"),"--install-extension",vsix,"--force"];
 let installSucceeded=false;
 const attempts=source==="marketplace"?30:1;
 for(let attempt=1;attempt<=attempts;attempt++){
  const install=spawnSync(cli,installArgs,{stdio:"inherit",shell:process.platform==="win32",env:{...process.env,DONT_PROMPT_WSL_INSTALL:"1"}});
  if(install.status===0){installSucceeded=true;break;}
  if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,30_000));
 }
 if(!installSucceeded)throw new Error("Clean-profile installation failed");
 const dir=readdirSync(join(profile,"extensions")).find(name=>name.startsWith(`${pkg.publisher}.${pkg.name}-${pkg.version}`));if(!dir)throw new Error("Expected installed extension not found");
 const installedExtension=join(profile,"extensions",dir);
 const runtimeEntries=readdirSync(installedExtension,{recursive:true}).filter(name=>/(?:^|[\\/])swobu(?:\.exe)?$/.test(String(name)));if(runtimeEntries.length)throw new Error("Installed VSIX contains a private Swobu runtime");
 for(const mode of ["attach","extension-start"]){
  const journey=spawnSync(process.execPath,["scripts/test-integration.mjs"],{stdio:"inherit",env:{...process.env,SWOBU_INSTALLED_EXTENSION:installedExtension,SWOBU_TEST_RUNTIME_MODE:mode}});
  if(journey.status!==0)throw new Error(`Installed extension ${mode} journey failed`);
 }
}finally{rmSync(profile,{recursive:true,force:true});}
