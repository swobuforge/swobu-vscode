import assert from "node:assert/strict";
import test from "node:test";
import * as vscode from "vscode";
import {chmod,mkdtemp,rm,symlink,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import { canonicalExecutable,ensureRuntime,executableCandidates,officialInstallerPlan,resolveSwobuCommand } from "../src/runtime.js";

test("official installers are downloaded to a temporary file and invoked without a shell pipeline",()=>{
 const unix=officialInstallerPlan("linux","/tmp/extension-owned");
 assert.deepEqual(unix,{url:"https://swobu.com/install.sh",file:"/tmp/extension-owned/install.sh",shellPath:"/bin/sh",shellArgs:["/tmp/extension-owned/install.sh"]});
 const windows=officialInstallerPlan("win32","C:\\Temp\\extension-owned");
 assert.equal(windows.url,"https://swobu.com/install.ps1");
 assert.equal(windows.shellPath,"powershell.exe");
 assert.deepEqual(windows.shellArgs.slice(0,4),["-NoProfile","-ExecutionPolicy","Bypass","-File"]);
 assert.match(windows.file,/install\.ps1$/);
 assert.equal(windows.shellArgs.at(-1),windows.file);
});

test("canonical installer locations remain resolvable when VS Code inherited a stale PATH",()=>{
 assert.equal(canonicalExecutable("linux","/home/alice"),"/home/alice/.local/bin/swobu");
 assert.equal(canonicalExecutable("darwin","/Users/alice"),"/Users/alice/.local/bin/swobu");
 assert.equal(canonicalExecutable("win32","C:\\Users\\Alice","C:\\Users\\Alice\\AppData\\Local"),"C:\\Users\\Alice\\AppData\\Local\\Programs\\swobu\\bin\\swobu.exe");
 assert.equal(canonicalExecutable("win32","C:\\Users\\Alice"),undefined);
 assert.deepEqual(executableCandidates(undefined,"linux","/home/alice",undefined,"/usr/local/bin:/usr/bin"),["/usr/local/bin/swobu","/usr/bin/swobu","/home/alice/.local/bin/swobu"]);
 assert.deepEqual(executableCandidates(undefined,"win32","C:\\Users\\Alice","C:\\Users\\Alice\\AppData\\Local","C:\\Tools;D:\\Bin"),["C:\\Tools\\swobu.exe","D:\\Bin\\swobu.exe","C:\\Users\\Alice\\AppData\\Local\\Programs\\swobu\\bin\\swobu.exe"]);
 assert.deepEqual(executableCandidates("/opt/swobu/bin/swobu","linux","/home/alice"),["/opt/swobu/bin/swobu"],"configured executable never falls through");
});

test("PATH resolution never returns relative or workspace-controlled binaries",()=>{
 assert.deepEqual(executableCandidates(undefined,"linux","/home/alice",undefined,"bin:/work/repo/tools:/usr/bin",["/work/repo"]),["/usr/bin/swobu","/home/alice/.local/bin/swobu"]);
 assert.deepEqual(executableCandidates("/work/repo/swobu","linux","/home/alice",undefined,"/usr/bin",["/work/repo"]),[],"configured workspace binary fails closed");
});

test("configured symlinks into a workspace fail closed",async()=>{const root=await mkdtemp(join(tmpdir(),"swobu-resolver-")),workspace=join(root,"workspace"),binary=join(workspace,"swobu"),link=join(root,"outside-swobu"),setConfiguration=(vscode as unknown as {__setConfiguration:(key:string,value:unknown)=>void}).__setConfiguration,mutableWorkspace=vscode.workspace as unknown as {workspaceFolders:Array<{uri:{scheme:string;fsPath:string}}> | undefined},originalFolders=mutableWorkspace.workspaceFolders;await import("node:fs/promises").then(fs=>fs.mkdir(workspace));await writeFile(binary,"#!/bin/sh\nexit 0\n");await chmod(binary,0o700);await symlink(binary,link);setConfiguration("executable",link);mutableWorkspace.workspaceFolders=[{uri:{scheme:"file",fsPath:workspace}}];try{assert.equal(await resolveSwobuCommand(),undefined);}finally{setConfiguration("executable",undefined);mutableWorkspace.workspaceFolders=originalFolders;await rm(root,{recursive:true,force:true});}});

test("symlinked workspace roots cannot hide workspace-controlled executables",async()=>{const root=await mkdtemp(join(tmpdir(),"swobu-resolver-root-")),workspace=join(root,"real-workspace"),workspaceLink=join(root,"workspace-link"),binary=join(workspace,"swobu"),outsideLink=join(root,"outside-swobu"),setConfiguration=(vscode as unknown as {__setConfiguration:(key:string,value:unknown)=>void}).__setConfiguration,mutableWorkspace=vscode.workspace as unknown as {workspaceFolders:Array<{uri:{scheme:string;fsPath:string}}> | undefined},originalFolders=mutableWorkspace.workspaceFolders;await import("node:fs/promises").then(fs=>fs.mkdir(workspace));await writeFile(binary,"#!/bin/sh\nexit 0\n");await chmod(binary,0o700);await symlink(workspace,workspaceLink);await symlink(binary,outsideLink);setConfiguration("executable",outsideLink);mutableWorkspace.workspaceFolders=[{uri:{scheme:"file",fsPath:workspaceLink}}];try{assert.equal(await resolveSwobuCommand(),undefined);}finally{setConfiguration("executable",undefined);mutableWorkspace.workspaceFolders=originalFolders;await rm(root,{recursive:true,force:true});}});

test("absolute executable resolution rejects directories",async()=>{const setConfiguration=(vscode as unknown as {__setConfiguration:(key:string,value:unknown)=>void}).__setConfiguration;setConfiguration("executable","/tmp");try{assert.equal(await resolveSwobuCommand(),undefined);}finally{setConfiguration("executable",undefined);}});

test("cancelling discovery stops only its wait, not shared runtime initialization",async()=>{
 const original=globalThis.fetch;
 let finish!:(response:Response)=>void;
 let sharedSignal:AbortSignal|null|undefined;
 let probes=0;
 globalThis.fetch=async(_input,init)=>{probes++;sharedSignal=init?.signal;return new Promise<Response>(resolve=>{finish=resolve;});};
 const discovery=new AbortController();
 const context={} as vscode.ExtensionContext;
 try {
  const first=ensureRuntime(context,discovery.signal);
  const second=ensureRuntime(context);
  const rejected=assert.rejects(first);
  discovery.abort();
  // Complete the shared operation only after observing whether cancellation
  // leaked into its transport; a forever-pending first waiter is also a failure.
  assert.notEqual(sharedSignal?.aborted,true);
  finish(new Response(JSON.stringify({state:"healthy",control_plane_protocol:9,swobu_version:"2.0.0"}),{status:200}));
  await rejected;
  assert.equal((await second).state,"healthy");
  assert.equal(probes,1);
 } finally {globalThis.fetch=original;}
});

test("already-cancelled caller does not initialize runtime",async()=>{
 const controller=new AbortController();controller.abort();
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error("unexpected probe");};
 try {await assert.rejects(ensureRuntime({} as vscode.ExtensionContext,controller.signal));assert.equal(calls,0);}finally{globalThis.fetch=original;}
});

test("localized compatibility failures do not fall through to executable recovery",async()=>{
 const originalFetch=globalThis.fetch,originalTranslate=vscode.l10n.t;
 const setConfiguration=(vscode as unknown as {__setConfiguration:(key:string,value:unknown)=>void}).__setConfiguration;
 globalThis.fetch=async()=>new Response(JSON.stringify({state:"healthy",control_plane_protocol:8,swobu_version:"2.0.0"}),{status:200});
 (vscode.l10n as {t:typeof vscode.l10n.t}).t=((message:string,...args:unknown[])=>message.startsWith("Swobu control-plane protocol")?`本扩展不兼容协议 ${args[0]}`:message.replace(/\{(\d+)\}/g,(_,index)=>String(args[Number(index)]))) as typeof vscode.l10n.t;
 setConfiguration("executable","/definitely-missing/swobu");
 try{await assert.rejects(ensureRuntime({} as vscode.ExtensionContext),/本扩展不兼容协议 8/);}finally{globalThis.fetch=originalFetch;(vscode.l10n as {t:typeof vscode.l10n.t}).t=originalTranslate;setConfiguration("executable",undefined);}
});
