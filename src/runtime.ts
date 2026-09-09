import { access, chmod, mkdtemp, realpath, rm, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir, tmpdir } from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { CompatibilityError, ControlPlaneClient, requireCompatibleStatus, type StatusPayload } from "./controlPlane.js";
import { daemonAddress, endpoint, executable } from "./settings.js";

const INSTALLERS = { unix: "https://swobu.com/install.sh", windows: "https://swobu.com/install.ps1" } as const;
export interface InstallerPlan { url:string; file:string; shellPath:string; shellArgs:string[] }
export function officialInstallerPlan(platform:NodeJS.Platform,directory:string):InstallerPlan {const windows=platform==="win32",file=path.join(directory,windows?"install.ps1":"install.sh");return windows?{url:INSTALLERS.windows,file,shellPath:"powershell.exe",shellArgs:["-NoProfile","-ExecutionPolicy","Bypass","-File",file]}:{url:INSTALLERS.unix,file,shellPath:"/bin/sh",shellArgs:[file]};}
let pending: Promise<StatusPayload> | undefined;

/** Resolves the ordinary host installation shared by every Swobu client. */
export function canonicalExecutable(platform:NodeJS.Platform,home:string,localAppData?:string):string|undefined {return platform==="win32"?(localAppData?path.win32.join(localAppData,"Programs","swobu","bin","swobu.exe"):undefined):path.join(home,".local","bin","swobu");}
export function executableCandidates(configured:string|undefined,platform:NodeJS.Platform,home:string,localAppData?:string,pathValue=process.env.PATH??"",workspaceRoots:string[]=[]):string[]{const paths=platform==="win32"?path.win32:path.posix,isWorkspace=(candidate:string)=>workspaceRoots.some(root=>{const relative=paths.relative(root,candidate);return relative===""||!relative.startsWith(`..${paths.sep}`)&&relative!==".."&&!paths.isAbsolute(relative);});if(configured)return isWorkspace(configured)?[]:[configured];const name=platform==="win32"?"swobu.exe":"swobu",fromPath=pathValue.split(platform==="win32"?";":":").filter(entry=>paths.isAbsolute(entry)).map(entry=>paths.join(entry,name)),canonical=canonicalExecutable(platform,home,localAppData);return [...new Set([...fromPath,...canonical?[canonical]:[]])].filter(candidate=>!isWorkspace(candidate));}
export async function resolveSwobuCommand():Promise<string|undefined>{const workspaceRoots=vscode.workspace.workspaceFolders?.filter(folder=>folder.uri.scheme==="file").map(folder=>folder.uri.fsPath)??[],resolvedRoots=(await Promise.all(workspaceRoots.map(async root=>{try{return await realpath(root);}catch{return root;}})));for(const candidate of executableCandidates(executable(),process.platform,homedir(),process.env.LOCALAPPDATA,process.env.PATH,workspaceRoots))if(await commandExists(candidate,resolvedRoots))return candidate;return undefined;}
export async function openSwobu(context:vscode.ExtensionContext):Promise<void>{const client=new ControlPlaneClient(endpoint());if(await compatibleStatus(client)){const command=await resolveSwobuCommand();if(!command)throw new Error(vscode.l10n.t("Swobu is required to provide language models."));launchSwobu(command);return;}await ensureRuntime(context);}
// Initialization belongs to the runtime, not whichever VS Code operation first
// requested it. Each caller owns only its wait and cannot abort other waiters.
export async function ensureRuntime(context: vscode.ExtensionContext, signal?: AbortSignal): Promise<StatusPayload> {
  if (signal?.aborted) throw new vscode.CancellationError();
  pending ??= attachStartOrInstall(context).finally(()=>{pending=undefined;});
  const initialization = pending;
  if (!signal) return initialization;
  return new Promise<StatusPayload>((resolve,reject)=>{
    const cancel=()=>reject(new vscode.CancellationError());
    signal.addEventListener("abort",cancel,{once:true});
    void initialization.then(
      status=>{signal.removeEventListener("abort",cancel);resolve(status);},
      error=>{signal.removeEventListener("abort",cancel);reject(error);},
    );
  });
}
async function attachStartOrInstall(context: vscode.ExtensionContext): Promise<StatusPayload> {
  const client=new ControlPlaneClient(endpoint()), attached=await compatibleStatus(client);
  if(attached)return attached;
  const command=await resolveSwobuCommand();
  if(command){launchSwobu(command);return waitUntilReady(client,30_000);}
  const configured=executable();if(configured)throw new Error(vscode.l10n.t("The configured Swobu executable was not found: {0}",configured));
  const install=vscode.l10n.t("Install Swobu");
  const choice=await vscode.window.showInformationMessage(vscode.l10n.t("Swobu is not installed on this extension host."),{modal:true},install);
  if(choice!==install)throw new Error(vscode.l10n.t("Swobu is required to provide language models."));
  await runOfficialInstaller(context);
  return waitUntilReady(client,120_000);
}
async function compatibleStatus(client:ControlPlaneClient):Promise<StatusPayload|undefined>{try{const status=await client.status(AbortSignal.timeout(2_000));requireCompatibleStatus(status);return status;}catch(error){if(error instanceof CompatibilityError)throw error;return undefined;}}
async function commandExists(command:string,workspaceRoots:string[]):Promise<boolean>{try{if(!path.isAbsolute(command)||!(await stat(command)).isFile())return false;await access(command,constants.X_OK);const resolved=await realpath(command);if(workspaceRoots.some(root=>{const relative=path.relative(root,resolved);return relative===""||!relative.startsWith(`..${path.sep}`)&&relative!==".."&&!path.isAbsolute(relative);}))return false;return true;}catch{return false;}}
function launchSwobu(command:string):void{const terminal=vscode.window.createTerminal({name:"Swobu",shellPath:command,shellArgs:["--addr",daemonAddress(endpoint())]});terminal.show(true);}
async function runOfficialInstaller(context:vscode.ExtensionContext):Promise<void>{const directory=await mkdtemp(path.join(tmpdir(),"swobu-installer-")),plan=officialInstallerPlan(process.platform,directory);try{const response=await fetch(plan.url);if(!response.ok)throw new Error(vscode.l10n.t("Could not download the official Swobu installer (HTTP {0}).",response.status));await writeFile(plan.file,new Uint8Array(await response.arrayBuffer()),{mode:0o700});if(process.platform!=="win32")await chmod(plan.file,0o700);const terminal=vscode.window.createTerminal({name:vscode.l10n.t("Install Swobu"),shellPath:plan.shellPath,shellArgs:plan.shellArgs});const subscription=vscode.window.onDidCloseTerminal(closed=>{if(closed!==terminal)return;subscription.dispose();void rm(directory,{recursive:true,force:true});});context.subscriptions.push(subscription);terminal.show(false);}catch(error){await rm(directory,{recursive:true,force:true});throw error;}}
async function waitUntilReady(client:ControlPlaneClient,timeout:number):Promise<StatusPayload>{const deadline=Date.now()+timeout;while(Date.now()<deadline){const status=await compatibleStatus(client);if(status)return status;await new Promise(resolve=>setTimeout(resolve,200));}throw new Error(vscode.l10n.t("Swobu did not become ready. Check the Swobu terminal for details."));
}
